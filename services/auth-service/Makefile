APP_NAME=auth-service

.PHONY: help build run test clean docker-up docker-down docker-logs migrate dev install-deps lint format

help:
	@echo "Available commands:"
	@echo "  make build       - Build the application"
	@echo "  make run         - Run the application"
	@echo "  make test        - Run tests"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make docker-up   - Start Docker containers"
	@echo "  make docker-down - Stop Docker containers"
	@echo "  make migrate     - Run database migrations"

build:
	go build -o bin/main ./cmd

run:
	go run ./cmd

test:
	go test -v ./...

clean:
	rm -rf bin/
	go clean

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f auth-service

migrate:
	go run ./cmd/migrate

dev:
	air

install-deps:
	go mod download
	go mod tidy

lint:
	golangci-lint run

format:
	gofmt -s -w .
	goimports -w .
