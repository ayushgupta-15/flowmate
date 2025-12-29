package main

import (
	"log"

	"github.com/flowmate/auth-service/internal/config"
	"github.com/flowmate/auth-service/pkg/database"
)

func main() {
	cfg := config.Load()

	db, err := database.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer db.Close()

	if err := database.RunMigrations(db.DB); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("migrations applied")
}
