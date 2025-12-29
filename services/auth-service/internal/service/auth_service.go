package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/flowmate/auth-service/internal/config"
	"github.com/flowmate/auth-service/internal/models"
	"github.com/flowmate/auth-service/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrTokenExpired       = errors.New("token expired")
	ErrInvalidToken       = errors.New("invalid token")
)

type AuthService interface {
	Register(ctx context.Context, req *models.RegisterRequest) (*models.AuthResponse, error)
	Login(ctx context.Context, req *models.LoginRequest) (*models.AuthResponse, error)
	RefreshToken(ctx context.Context, refreshToken string) (*models.AuthResponse, error)
	Logout(ctx context.Context, refreshToken string) error
	GetUserByID(ctx context.Context, userID uuid.UUID) (*models.UserResponse, error)
	ValidateToken(ctx context.Context, tokenString string) (*models.Claims, error)
}

type authService struct {
	userRepo  repository.UserRepository
	tokenRepo repository.TokenRepository
	cfg       *config.Config
}

func NewAuthService(userRepo repository.UserRepository, tokenRepo repository.TokenRepository, cfg *config.Config) AuthService {
	return &authService{
		userRepo:  userRepo,
		tokenRepo: tokenRepo,
		cfg:       cfg,
	}
}

func (s *authService) Register(ctx context.Context, req *models.RegisterRequest) (*models.AuthResponse, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), s.cfg.BcryptCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	tokens, err := s.generateTokens(user)
	if err != nil {
		return nil, err
	}

	if err := s.storeRefreshToken(ctx, tokens.RefreshToken, user); err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		User:         user.ToResponse(),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
	}, nil
}

func (s *authService) Login(ctx context.Context, req *models.LoginRequest) (*models.AuthResponse, error) {
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	tokens, err := s.generateTokens(user)
	if err != nil {
		return nil, err
	}

	if err := s.storeRefreshToken(ctx, tokens.RefreshToken, user); err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		User:         user.ToResponse(),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
	}, nil
}

func (s *authService) RefreshToken(ctx context.Context, refreshToken string) (*models.AuthResponse, error) {
	tokenData, err := s.tokenRepo.GetRefreshToken(ctx, refreshToken)
	if err != nil {
		return nil, ErrInvalidToken
	}

	if time.Now().After(tokenData.ExpiresAt) {
		_ = s.tokenRepo.DeleteRefreshToken(ctx, refreshToken)
		return nil, ErrTokenExpired
	}

	userID, err := uuid.Parse(tokenData.UserID)
	if err != nil {
		return nil, ErrInvalidToken
	}

	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	_ = s.tokenRepo.DeleteRefreshToken(ctx, refreshToken)

	tokens, err := s.generateTokens(user)
	if err != nil {
		return nil, err
	}

	if err := s.storeRefreshToken(ctx, tokens.RefreshToken, user); err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		User:         user.ToResponse(),
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
	}, nil
}

func (s *authService) Logout(ctx context.Context, refreshToken string) error {
	return s.tokenRepo.DeleteRefreshToken(ctx, refreshToken)
}

func (s *authService) GetUserByID(ctx context.Context, userID uuid.UUID) (*models.UserResponse, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return user.ToResponse(), nil
}

func (s *authService) ValidateToken(ctx context.Context, tokenString string) (*models.Claims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return &models.Claims{
			UserID:   claims["user_id"].(string),
			Email:    claims["email"].(string),
			Username: claims["username"].(string),
		}, nil
	}

	return nil, ErrInvalidToken
}

func (s *authService) generateTokens(user *models.User) (*models.TokenPair, error) {
	accessToken, err := s.generateAccessToken(user)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateRefreshToken()
	if err != nil {
		return nil, err
	}

	return &models.TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    s.cfg.JWTExpiryMinutes * 60,
	}, nil
}

func (s *authService) generateAccessToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id":  user.ID.String(),
		"email":    user.Email,
		"username": user.Username,
		"exp":      time.Now().Add(time.Minute * time.Duration(s.cfg.JWTExpiryMinutes)).Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *authService) generateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func (s *authService) storeRefreshToken(ctx context.Context, token string, user *models.User) error {
	data := &models.RefreshTokenData{
		UserID:    user.ID.String(),
		Email:     user.Email,
		ExpiresAt: time.Now().Add(time.Hour * 24 * time.Duration(s.cfg.RefreshExpiryDays)),
	}
	expiry := time.Hour * 24 * time.Duration(s.cfg.RefreshExpiryDays)
	return s.tokenRepo.StoreRefreshToken(ctx, token, data, expiry)
}
