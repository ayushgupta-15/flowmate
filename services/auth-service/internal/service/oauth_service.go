package service

import (
    "context"
    "encoding/json"
    "errors"
    "fmt"
    "io"
    "net/http"
    "net/url"
    "strings"

	"github.com/flowmate/auth-service/internal/config"
	"github.com/flowmate/auth-service/internal/models"
	"github.com/flowmate/auth-service/internal/repository"
)

type OAuthService interface {
	GetGitHubAuthURL(state string) string
	GetGoogleAuthURL(state string) string
	HandleGitHubCallback(ctx context.Context, code string) (*models.AuthResponse, error)
	HandleGoogleCallback(ctx context.Context, code string) (*models.AuthResponse, error)
}

type oauthService struct {
	userRepo  repository.UserRepository
	tokenRepo repository.TokenRepository
	cfg       *config.Config
	authSvc   AuthService
}

func NewOAuthService(userRepo repository.UserRepository, tokenRepo repository.TokenRepository, cfg *config.Config, authSvc AuthService) OAuthService {
	return &oauthService{
		userRepo:  userRepo,
		tokenRepo: tokenRepo,
		cfg:       cfg,
		authSvc:   authSvc,
	}
}

func (s *oauthService) GetGitHubAuthURL(state string) string {
	baseURL := "https://github.com/login/oauth/authorize"
	params := url.Values{
		"client_id":    {s.cfg.GitHubClientID},
		"redirect_uri": {fmt.Sprintf("%s/github/callback", strings.TrimRight(s.cfg.OAuthCallbackURL, "/"))},
		"scope":        {"user:email"},
		"state":        {state},
	}
	return fmt.Sprintf("%s?%s", baseURL, params.Encode())
}

func (s *oauthService) HandleGitHubCallback(ctx context.Context, code string) (*models.AuthResponse, error) {
	tokenResp, err := s.exchangeGitHubCode(code)
	if err != nil {
		return nil, err
	}

	userInfo, err := s.getGitHubUserInfo(tokenResp.AccessToken)
	if err != nil {
		return nil, err
	}

	user, err := s.userRepo.GetByGitHubID(ctx, fmt.Sprintf("%d", userInfo.ID))
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			user = &models.User{
				Email:     userInfo.Email,
				Username:  userInfo.Login,
				AvatarURL: stringPtr(userInfo.AvatarURL),
				GitHubID:  stringPtr(fmt.Sprintf("%d", userInfo.ID)),
			}
			if err := s.userRepo.Create(ctx, user); err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	return s.issueTokens(ctx, user)
}

func (s *oauthService) exchangeGitHubCode(code string) (*struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
}, error) {
	tokenURL := "https://github.com/login/oauth/access_token"
	data := url.Values{
		"client_id":     {s.cfg.GitHubClientID},
		"client_secret": {s.cfg.GitHubClientSecret},
		"code":          {code},
	}

	req, err := http.NewRequest("POST", tokenURL, nil)
	if err != nil {
		return nil, err
	}
	req.URL.RawQuery = data.Encode()
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		Scope       string `json:"scope"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}
	return &tokenResp, nil
}

func (s *oauthService) getGitHubUserInfo(accessToken string) (*GitHubUser, error) {
	req, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var user GitHubUser
	if err := json.Unmarshal(body, &user); err != nil {
		return nil, err
	}

	if user.Email == "" {
		if emails, err := s.getGitHubEmails(accessToken); err == nil && len(emails) > 0 {
			user.Email = emails[0].Email
		}
	}
	return &user, nil
}

func (s *oauthService) getGitHubEmails(accessToken string) ([]GitHubEmail, error) {
	req, err := http.NewRequest("GET", "https://api.github.com/user/emails", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var emails []GitHubEmail
	if err := json.NewDecoder(resp.Body).Decode(&emails); err != nil {
		return nil, err
	}
	return emails, nil
}

func (s *oauthService) GetGoogleAuthURL(state string) string {
	baseURL := "https://accounts.google.com/o/oauth2/v2/auth"
	params := url.Values{
		"client_id":     {s.cfg.GoogleClientID},
		"redirect_uri":  {fmt.Sprintf("%s/google/callback", strings.TrimRight(s.cfg.OAuthCallbackURL, "/"))},
		"response_type": {"code"},
		"scope":         {"email profile"},
		"state":         {state},
	}
	return fmt.Sprintf("%s?%s", baseURL, params.Encode())
}

func (s *oauthService) HandleGoogleCallback(ctx context.Context, code string) (*models.AuthResponse, error) {
	tokenURL := "https://oauth2.googleapis.com/token"
	data := url.Values{
		"client_id":     {s.cfg.GoogleClientID},
		"client_secret": {s.cfg.GoogleClientSecret},
		"code":          {code},
		"grant_type":    {"authorization_code"},
		"redirect_uri":  {fmt.Sprintf("%s/google/callback", strings.TrimRight(s.cfg.OAuthCallbackURL, "/"))},
	}

	resp, err := http.PostForm(tokenURL, data)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var tokenResp struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}

	userInfo, err := s.getGoogleUserInfo(tokenResp.AccessToken)
	if err != nil {
		return nil, err
	}

	user, err := s.userRepo.GetByGoogleID(ctx, userInfo.ID)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			username := generateUsername(userInfo.Email)
			user = &models.User{
				Email:     userInfo.Email,
				Username:  username,
				AvatarURL: stringPtr(userInfo.Picture),
				GoogleID:  &userInfo.ID,
			}
			if err := s.userRepo.Create(ctx, user); err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	return s.issueTokens(ctx, user)
}

func (s *oauthService) getGoogleUserInfo(accessToken string) (*GoogleUser, error) {
	req, err := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var user GoogleUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *oauthService) issueTokens(ctx context.Context, user *models.User) (*models.AuthResponse, error) {
	issuer, ok := s.authSvc.(*authService)
	if !ok {
		return nil, errors.New("auth service unavailable")
	}
	tokens, err := issuer.generateTokens(user)
	if err != nil {
		return nil, err
	}
	if err := issuer.storeRefreshToken(ctx, tokens.RefreshToken, user); err != nil {
		return nil, err
	}
	return &models.AuthResponse{
		User:         user.ToResponse(),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
	}, nil
}

type GitHubUser struct {
	ID        int    `json:"id"`
	Login     string `json:"login"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
	Name      string `json:"name"`
}

type GitHubEmail struct {
	Email    string `json:"email"`
	Primary  bool   `json:"primary"`
	Verified bool   `json:"verified"`
}

type GoogleUser struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

func stringPtr(s string) *string {
	return &s
}

func generateUsername(email string) string {
	for i, c := range email {
		if c == '@' {
			return email[:i]
		}
	}
	return email
}
