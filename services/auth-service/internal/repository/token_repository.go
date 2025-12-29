package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/flowmate/auth-service/internal/models"
)

type TokenRepository interface {
	StoreRefreshToken(ctx context.Context, token string, data *models.RefreshTokenData, expiry time.Duration) error
	GetRefreshToken(ctx context.Context, token string) (*models.RefreshTokenData, error)
	DeleteRefreshToken(ctx context.Context, token string) error
	DeleteUserTokens(ctx context.Context, userID string) error
}

type tokenRepository struct {
	redis *redis.Client
}

func NewTokenRepository(redis *redis.Client) TokenRepository {
	return &tokenRepository{redis: redis}
}

func (r *tokenRepository) StoreRefreshToken(ctx context.Context, token string, data *models.RefreshTokenData, expiry time.Duration) error {
	key := fmt.Sprintf("refresh_token:%s", token)
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return r.redis.Set(ctx, key, jsonData, expiry).Err()
}

func (r *tokenRepository) GetRefreshToken(ctx context.Context, token string) (*models.RefreshTokenData, error) {
	key := fmt.Sprintf("refresh_token:%s", token)
	val, err := r.redis.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return nil, fmt.Errorf("refresh token not found")
		}
		return nil, err
	}

	var data models.RefreshTokenData
	if err := json.Unmarshal([]byte(val), &data); err != nil {
		return nil, err
	}
	return &data, nil
}

func (r *tokenRepository) DeleteRefreshToken(ctx context.Context, token string) error {
	key := fmt.Sprintf("refresh_token:%s", token)
	return r.redis.Del(ctx, key).Err()
}

func (r *tokenRepository) DeleteUserTokens(ctx context.Context, userID string) error {
	iter := r.redis.Scan(ctx, 0, "refresh_token:*", 0).Iterator()
	for iter.Next(ctx) {
		key := iter.Val()
		val, err := r.redis.Get(ctx, key).Result()
		if err != nil {
			continue
		}
		var data models.RefreshTokenData
		if err := json.Unmarshal([]byte(val), &data); err != nil {
			continue
		}
		if data.UserID == userID {
			r.redis.Del(ctx, key)
		}
	}
	return iter.Err()
}
