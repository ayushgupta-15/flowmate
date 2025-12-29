package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"

	"github.com/flowmate/auth-service/internal/config"
	"github.com/flowmate/auth-service/internal/handlers"
	mid "github.com/flowmate/auth-service/internal/middleware"
	"github.com/flowmate/auth-service/internal/repository"
	"github.com/flowmate/auth-service/internal/routes"
	"github.com/flowmate/auth-service/internal/service"
	"github.com/flowmate/auth-service/pkg/database"
	redisclient "github.com/flowmate/auth-service/pkg/redis"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()
	db, err := database.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	redis := redisclient.NewRedisClient(cfg.RedisURL)
	defer redis.Close()

	userRepo := repository.NewUserRepository(db)
	tokenRepo := repository.NewTokenRepository(redis)

	authService := service.NewAuthService(userRepo, tokenRepo, cfg)
	oauthService := service.NewOAuthService(userRepo, tokenRepo, cfg, authService)

	authHandler := handlers.NewAuthHandler(authService, oauthService, cfg)

	app := fiber.New(fiber.Config{
		ErrorHandler:   customErrorHandler,
		BodyLimit:      4 * 1024 * 1024,
		ReadBufferSize: 64 * 1024, // allow larger headers (e.g., many cookies during OAuth redirects)
	})

	app.Use(mid.Recover())
	app.Use(mid.Logger())
	app.Use(mid.CORS(cfg.CORSOrigins))

	rateLimiter := mid.NewRateLimiter(redis)
	authMiddleware := mid.NewAuthMiddleware(cfg.JWTSecret)

	app.Get("/health", handlers.HealthHandler("auth-service"))
	routes.SetupAuthRoutes(app, authHandler, rateLimiter, authMiddleware)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt, syscall.SIGTERM)
		<-sigint

		log.Println("Shutting down server...")
		cancel()

		if err := app.Shutdown(); err != nil {
			log.Printf("Server shutdown error: %v", err)
		}
	}()

	log.Printf("Auth Service starting on port %s", cfg.Port)
	if err := app.Listen(":" + cfg.Port); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}

	<-ctx.Done()
	log.Println("Server stopped")
}

func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"error": fiber.Map{
			"code":    code,
			"message": message,
		},
	})
}
