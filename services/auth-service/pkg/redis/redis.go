package redis

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

func NewRedisClient(redisURL string) *redis.Client {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		panic(fmt.Sprintf("failed to parse redis URL: %v", err))
	}

	client := redis.NewClient(opt)
	if err := client.Ping(context.Background()).Err(); err != nil {
		panic(fmt.Sprintf("failed to connect to redis: %v", err))
	}
	return client
}
