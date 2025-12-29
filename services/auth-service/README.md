# FlowMate Auth Service

Authentication and OAuth2 service for FlowMate, providing JWT auth, refresh tokens, and GitHub/Google sign-in.

## Features
- JWT access + refresh tokens with rotation and Redis storage
- Email/password registration and login with bcrypt hashing
- OAuth2 (GitHub, Google) helpers
- Rate limiting via Redis
- Postgres persistence for users
- Simple migration runner
- Docker + docker-compose support

## Quick Start
```bash
cp .env.example .env
make docker-up        # start postgres + redis
make install-deps     # go mod tidy
make migrate          # apply migrations
make run              # start service on :8001
```

Run tests:
```bash
make test
```

Build:
```bash
make build
```

## API
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/user/me` (requires Bearer token)
- `GET /api/v1/auth/oauth/{github|google}` → redirect to provider
- `GET /api/v1/auth/oauth/{github|google}/callback`

Health: `GET /health`

## Migrations
```bash
make migrate
```
Reads SQL files in `migrations/` and applies them in order.
