package middleware

import (
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
)

type RateLimiter struct {
	redis *redis.Client
}

func NewRateLimiter(redis *redis.Client) *RateLimiter {
	return &RateLimiter{redis: redis}
}

func (rl *RateLimiter) Limit(maxRequests int, window time.Duration) fiber.Handler {
	return func(c *fiber.Ctx) error {
		identifier := c.IP()
		if userID, ok := c.Locals("userID").(string); ok {
			identifier = userID
		}

		key := fmt.Sprintf("ratelimit:%s:%s", c.Path(), identifier)
		ctx := context.Background()

		count, err := rl.redis.Get(ctx, key).Int()
		if err != nil && err != redis.Nil {
			return c.Next()
		}
		if count >= maxRequests {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{"error": "Rate limit exceeded"})
		}

		pipe := rl.redis.Pipeline()
		pipe.Incr(ctx, key)
		if count == 0 {
			pipe.Expire(ctx, key, window)
		}
		if _, err := pipe.Exec(ctx); err != nil {
			return c.Next()
		}

		c.Set("X-RateLimit-Limit", fmt.Sprintf("%d", maxRequests))
		c.Set("X-RateLimit-Remaining", fmt.Sprintf("%d", maxRequests-count-1))
		return c.Next()
	}
}
