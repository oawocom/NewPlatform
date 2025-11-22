package middleware

import (
    "strings"
    "github.com/gin-gonic/gin"
    "github.com/yourusername/platform-v2-go/internal/auth"
    "github.com/yourusername/platform-v2-go/internal/database"
    "github.com/yourusername/platform-v2-go/internal/models"
)

func AuthRequired() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(401, gin.H{"detail": "Authorization header required"})
            c.Abort()
            return
        }

        tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
        userID, err := auth.ValidateToken(tokenString)
        if err != nil {
            c.JSON(401, gin.H{"detail": "Invalid token"})
            c.Abort()
            return
        }

        var user models.User
        if err := database.DB.First(&user, userID).Error; err != nil {
            c.JSON(401, gin.H{"detail": "User not found"})
            c.Abort()
            return
        }

        c.Set("user", user)
        c.Next()
    }
}
