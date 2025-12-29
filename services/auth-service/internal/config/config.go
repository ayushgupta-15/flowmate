package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	Environment string
	DatabaseURL string
	RedisURL    string
	FrontendURL string

	JWTSecret         string
	JWTExpiryMinutes  int
	RefreshExpiryDays int

	GitHubClientID     string
	GitHubClientSecret string
	GoogleClientID     string
	GoogleClientSecret string
	OAuthCallbackURL   string

	CORSOrigins     string
	BcryptCost      int
	RateLimitPerMin int

	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
}

func Load() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		Port:        getEnv("PORT", "8001"),
		Environment: getEnv("ENVIRONMENT", "development"),
		DatabaseURL: getEnv("DATABASE_URL", ""),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),

		JWTSecret:         getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTExpiryMinutes:  getEnvInt("JWT_EXPIRY_MINUTES", 15),
		RefreshExpiryDays: getEnvInt("REFRESH_EXPIRY_DAYS", 30),

		GitHubClientID:     getEnv("GITHUB_CLIENT_ID", ""),
		GitHubClientSecret: getEnv("GITHUB_CLIENT_SECRET", ""),
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		OAuthCallbackURL:   getEnv("OAUTH_CALLBACK_URL", "http://localhost:8001/api/v1/auth/oauth"),

		CORSOrigins:     getEnv("CORS_ORIGINS", "http://localhost:3000"),
		BcryptCost:      getEnvInt("BCRYPT_COST", 12),
		RateLimitPerMin: getEnvInt("RATE_LIMIT_PER_MIN", 100),

		SMTPHost:     getEnv("SMTP_HOST", ""),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUsername: getEnv("SMTP_USERNAME", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		FromEmail:    getEnv("FROM_EMAIL", "noreply@flowmate.dev"),
	}

	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	val := getEnv(key, "")
	if val == "" {
		return defaultValue
	}
	if n, err := strconv.Atoi(val); err == nil {
		return n
	}
	return defaultValue
}

func GetAllowedOrigins(origins string) []string {
	parts := strings.Split(origins, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
