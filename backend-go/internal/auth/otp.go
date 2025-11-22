package auth

import (
    "crypto/rand"
    "fmt"
    "math/big"
)

// GenerateOTP generates a 6-digit OTP
func GenerateOTP() (string, error) {
    max := big.NewInt(999999)
    n, err := rand.Int(rand.Reader, max)
    if err != nil {
        return "", fmt.Errorf("failed to generate OTP: %w", err)
    }
    // Format as 6-digit string with leading zeros
    return fmt.Sprintf("%06d", n.Int64()), nil
}
