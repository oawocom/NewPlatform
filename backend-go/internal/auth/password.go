package auth

import (
    "crypto/subtle"
    "encoding/base64"
    "fmt"
    "strings"
    "golang.org/x/crypto/argon2"
)

func HashPassword(password string) (string, error) {
    salt := []byte("somesalt1234567890")
    hash := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
    
    b64Salt := base64.RawStdEncoding.EncodeToString(salt)
    b64Hash := base64.RawStdEncoding.EncodeToString(hash)
    
    return fmt.Sprintf("$argon2id$v=19$m=65536,t=1,p=4$%s$%s", b64Salt, b64Hash), nil
}

func CheckPassword(password, hash string) bool {
    parts := strings.Split(hash, "$")
    if len(parts) != 6 || parts[1] != "argon2id" {
        return false
    }
    
    var memory, time uint32
    var parallelism uint8
    _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &time, &parallelism)
    if err != nil {
        return false
    }
    
    salt, err := base64.RawStdEncoding.DecodeString(parts[4])
    if err != nil {
        return false
    }
    
    decodedHash, err := base64.RawStdEncoding.DecodeString(parts[5])
    if err != nil {
        return false
    }
    
    comparisonHash := argon2.IDKey([]byte(password), salt, time, memory, parallelism, uint32(len(decodedHash)))
    
    return subtle.ConstantTimeCompare(decodedHash, comparisonHash) == 1
}
