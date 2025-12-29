package handlers

import (
    "errors"
    "fmt"
    "net/http"
    "net/url"
    "strings"
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/google/uuid"

    "github.com/flowmate/auth-service/internal/config"
    "github.com/flowmate/auth-service/internal/models"
    "github.com/flowmate/auth-service/internal/service"
)

type AuthHandler struct {
	auth  service.AuthService
	oauth service.OAuthService
	cfg   *config.Config
}

func NewAuthHandler(auth service.AuthService, oauth service.OAuthService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{auth: auth, oauth: oauth, cfg: cfg}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var input models.RegisterRequest
	if err := c.BodyParser(&input); err != nil {
		return fiber.NewError(http.StatusBadRequest, "invalid payload")
	}

	resp, err := h.auth.Register(c.Context(), &input)
	if err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    resp,
	})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var input models.LoginRequest
	if err := c.BodyParser(&input); err != nil {
		return fiber.NewError(http.StatusBadRequest, "invalid payload")
	}

	resp, err := h.auth.Login(c.Context(), &input)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, service.ErrInvalidCredentials) {
			status = http.StatusUnauthorized
		}
		return fiber.NewError(status, err.Error())
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    resp,
	})
}

func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	var payload models.RefreshTokenRequest
	if err := c.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, "invalid payload")
	}

	resp, err := h.auth.RefreshToken(c.Context(), payload.RefreshToken)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, service.ErrInvalidToken) {
			status = http.StatusUnauthorized
		}
		return fiber.NewError(status, err.Error())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    resp,
	})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	var payload models.RefreshTokenRequest
	if err := c.BodyParser(&payload); err != nil {
		return fiber.NewError(http.StatusBadRequest, "invalid payload")
	}

	if err := h.auth.Logout(c.Context(), payload.RefreshToken); err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(fiber.Map{"success": true})
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(string)
	if !ok || userID == "" {
		return fiber.NewError(http.StatusUnauthorized, "unauthorized")
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return fiber.NewError(http.StatusBadRequest, "invalid user id")
	}

	user, err := h.auth.GetUserByID(c.Context(), userUUID)
	if err != nil {
		return fiber.NewError(http.StatusNotFound, err.Error())
	}

	return c.JSON(fiber.Map{"success": true, "data": user})
}

func (h *AuthHandler) OAuthStart(c *fiber.Ctx) error {
	provider := c.Params("provider")
	state := c.Query("state")
	if state == "" {
		state = uuid.New().String()
	}

	var url string
	switch provider {
	case "github":
		url = h.oauth.GetGitHubAuthURL(state)
	case "google":
		url = h.oauth.GetGoogleAuthURL(state)
	default:
		return fiber.NewError(http.StatusBadRequest, "unsupported provider")
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"url":   url,
			"state": state,
		},
	})
}

func (h *AuthHandler) OAuthCallback(c *fiber.Ctx) error {
	provider := c.Params("provider")
	code := c.Query("code")
	if code == "" {
		return fiber.NewError(http.StatusBadRequest, "missing code")
	}

	var resp *models.AuthResponse
	var err error

	switch provider {
	case "github":
		resp, err = h.oauth.HandleGitHubCallback(c.Context(), code)
	case "google":
		resp, err = h.oauth.HandleGoogleCallback(c.Context(), code)
	default:
		return fiber.NewError(http.StatusBadRequest, "unsupported provider")
	}
	if err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    resp,
	})
}

func (h *AuthHandler) GetGitHubAuthURL(c *fiber.Ctx) error {
	state := c.Query("state", uuid.New().String())
	url := h.oauth.GetGitHubAuthURL(state)
	return c.Redirect(url, fiber.StatusTemporaryRedirect)
}

func (h *AuthHandler) HandleGitHubCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return fiber.NewError(http.StatusBadRequest, "missing authorization code")
	}
	resp, err := h.oauth.HandleGitHubCallback(c.Context(), code)
	if err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	redirect := buildRedirectWithTokens(h.cfg.FrontendURL, resp)
	return c.Redirect(redirect, fiber.StatusTemporaryRedirect)
}

func (h *AuthHandler) GetGoogleAuthURL(c *fiber.Ctx) error {
	state := c.Query("state", uuid.New().String())
	url := h.oauth.GetGoogleAuthURL(state)
	return c.Redirect(url, fiber.StatusTemporaryRedirect)
}

func (h *AuthHandler) HandleGoogleCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return fiber.NewError(http.StatusBadRequest, "missing authorization code")
	}
	resp, err := h.oauth.HandleGoogleCallback(c.Context(), code)
	if err != nil {
		return fiber.NewError(http.StatusBadRequest, err.Error())
	}
	redirect := buildRedirectWithTokens(h.cfg.FrontendURL, resp)
	return c.Redirect(redirect, fiber.StatusTemporaryRedirect)
}

func HealthHandler(serviceName string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"service": serviceName,
			"time":    time.Now().Unix(),
		})
	}
}

func buildRedirectWithTokens(frontend string, resp *models.AuthResponse) string {
	base := strings.TrimRight(frontend, "/")
	q := url.Values{}
	q.Set("access_token", resp.AccessToken)
	q.Set("refresh_token", resp.RefreshToken)
	q.Set("expires_in", fmt.Sprintf("%d", resp.ExpiresIn))
	return base + "/dashboard?" + q.Encode()
}
