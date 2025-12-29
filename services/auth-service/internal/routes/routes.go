package routes

import (
	"time"

	"github.com/gofiber/fiber/v2"

	"github.com/flowmate/auth-service/internal/handlers"
	"github.com/flowmate/auth-service/internal/middleware"
)

func SetupAuthRoutes(app *fiber.App, authHandler *handlers.AuthHandler, rateLimiter *middleware.RateLimiter, authMiddleware *middleware.AuthMiddleware) {
	api := app.Group("/api/v1")

	auth := api.Group("/auth")
	if rateLimiter != nil {
		auth.Use(rateLimiter.Limit(5, time.Minute))
	}
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/refresh", authHandler.RefreshToken)
	auth.Post("/logout", authHandler.Logout)

	auth.Get("/oauth/github", authHandler.GetGitHubAuthURL)
	auth.Get("/oauth/github/callback", authHandler.HandleGitHubCallback)
	auth.Get("/oauth/github/callback/github", authHandler.HandleGitHubCallback)          // fallback if provider appended twice
	auth.Get("/oauth/github/callback/github/callback", authHandler.HandleGitHubCallback) // fallback if provider appended twice
	auth.Get("/oauth/google", authHandler.GetGoogleAuthURL)
	auth.Get("/oauth/google/callback", authHandler.HandleGoogleCallback)
	auth.Get("/oauth/google/callback/google", authHandler.HandleGoogleCallback)
	auth.Get("/oauth/google/callback/google/callback", authHandler.HandleGoogleCallback)

	protected := api.Group("/user")
	protected.Use(authMiddleware.Protect())
	protected.Get("/me", authHandler.Me)
}
