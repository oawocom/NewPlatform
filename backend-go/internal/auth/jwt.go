package auth

import (
    "fmt"
    "os"
    "time"
    "github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

func init() {
    secret := os.Getenv("JWT_SECRET")
    if secret == "" {
        panic("FATAL: JWT_SECRET environment variable is not set. Server cannot start without a secure JWT secret.")
    }
    if len(secret) < 32 {
        panic("FATAL: JWT_SECRET must be at least 32 characters long for security.")
    }
    jwtSecret = []byte(secret)
}

func CreateToken(userID int) (string, error) {
    claims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(time.Hour * 24 * 7).Unix(),
        "iat":     time.Now().Unix(),
        "iss":     "platform-v2",
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    signedToken, err := token.SignedString(jwtSecret)
    if err != nil {
        return "", fmt.Errorf("failed to sign token: %w", err)
    }
    
    return signedToken, nil
}

func ValidateToken(tokenString string) (int, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        // Verify signing method to prevent algorithm confusion attacks
        if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return jwtSecret, nil
    })
    
    if err != nil {
        return 0, fmt.Errorf("token parsing failed: %w", err)
    }
    
    if !token.Valid {
        return 0, fmt.Errorf("invalid token")
    }
    
    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return 0, fmt.Errorf("invalid token claims")
    }
    
    // Verify issuer
    if iss, ok := claims["iss"].(string); !ok || iss != "platform-v2" {
        return 0, fmt.Errorf("invalid token issuer")
    }
    
    userIDFloat, ok := claims["user_id"].(float64)
    if !ok {
        return 0, fmt.Errorf("invalid user_id in token")
    }
    
    return int(userIDFloat), nil
}
