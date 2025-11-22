package models

import "time"

type User struct {
    ID                        int       `gorm:"primaryKey" json:"id"`
    Email                     string    `gorm:"unique;not null" json:"email"`
    FullName                  string    `json:"full_name"`
    HashedPassword            string    `json:"-"`
    Role                      string    `json:"role"`
    TenantID                  *int      `json:"tenant_id"`
    IsActive                  bool      `json:"is_active"`
    EmailVerified             bool      `json:"email_verified"`
    EmailVerificationOtp      *string   `json:"-"`
    EmailVerificationExpires  *time.Time `json:"-"`
    PasswordResetToken        *string   `json:"-"`
    PasswordResetExpires      *time.Time `json:"-"`
    CreatedAt                 time.Time `json:"created_at"`
    UpdatedAt                 time.Time `json:"updated_at"`
}
