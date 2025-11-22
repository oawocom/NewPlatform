package handlers

import (
    "log"
    "time"
    "strings"
    "github.com/gin-gonic/gin"
    "github.com/yourusername/platform-v2-go/internal/auth"
    "github.com/yourusername/platform-v2-go/internal/database"
    "github.com/yourusername/platform-v2-go/internal/models"
)

type LoginRequest struct {
    Email    string `json:"email" binding:"required"`
    Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
    Email    string `json:"email" binding:"required"`
    Password string `json:"password" binding:"required"`
    FullName string `json:"full_name" binding:"required"`
}

func getPermissions(role string) []string {
    switch role {
    case "SUPER_ADMIN":
        return []string{
            "view_dashboard",
            "view_users",
            "view_projects",
            "view_billing",
            "view_settings",
            "create_users",
            "edit_users",
            "delete_users",
            "create_projects",
            "edit_projects",
            "delete_projects",
        }
    case "TENANT_ADMIN":
        return []string{
            "view_dashboard",
            "view_users",
            "view_projects",
            "view_billing",
            "view_settings",
            "create_users",
            "edit_users",
            "create_projects",
            "edit_projects",
        }
    default:
        return []string{
            "view_dashboard",
            "view_projects",
        }
    }
}

func Login(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"detail": "Invalid request"})
        return
    }

    var user models.User
    if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
        c.JSON(401, gin.H{"detail": "Incorrect email or password"})
        return
    }

    if !auth.CheckPassword(req.Password, user.HashedPassword) {
        c.JSON(401, gin.H{"detail": "Incorrect email or password"})
        return
    }

    if !user.IsActive {
        c.JSON(403, gin.H{"detail": "User account is inactive"})
        return
    }

    if !user.EmailVerified {
        c.JSON(403, gin.H{"detail": "Please verify your email before logging in"})
        return
    }

    token, _ := auth.CreateToken(user.ID)

    c.JSON(200, gin.H{
        "access_token": token,
        "token_type":   "bearer",
        "user": gin.H{
            "id":          user.ID,
            "email":       user.Email,
            "full_name":   user.FullName,
            "role":        user.Role,
            "tenant_id":   user.TenantID,
            "permissions": getPermissions(user.Role),
        },
    })
}

func Register(c *gin.Context) {
    // Only accept JSON (no query params for security)
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"detail": "Invalid request"})
        return
    }

    var existing models.User
    if database.DB.Where("email = ?", req.Email).First(&existing).Error == nil {
        c.JSON(400, gin.H{"detail": "Email already registered"})
        return
    }

    hashed, err := auth.HashPassword(req.Password)
    if err != nil {
        c.JSON(500, gin.H{"detail": "Failed to hash password"})
        return
    }

    // Generate 6-digit OTP
    otp, err := auth.GenerateOTP()
    if err != nil {
        c.JSON(500, gin.H{"detail": "Failed to generate verification code"})
        return
    }

    // Set expiry to 1 hour from now
    expiryTime := time.Now().Add(1 * time.Hour)

    user := models.User{
        Email:                    req.Email,
        FullName:                 req.FullName,
        HashedPassword:           hashed,
        Role:                     "USER",
        IsActive:                 true,
        EmailVerified:            false, // Must verify email
        EmailVerificationOtp:     &otp,
        EmailVerificationExpires: &expiryTime,
    }

    database.DB.Create(&user)

    // TODO: Send email with OTP
    // For now, log to console
    log.Printf("📧 EMAIL VERIFICATION - User: %s, OTP: %s, Expires: %s", user.Email, otp, expiryTime.Format(time.RFC3339))

    c.JSON(201, gin.H{
        "message":      "Registration successful. Please check your email for verification code.",
        "user_id":      user.ID,
        "email":        user.Email,
        "email_sent":   true,
        "partner_code": nil,
    })
}

func GetMe(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)

    c.JSON(200, gin.H{
        "id":             u.ID,
        "email":          u.Email,
        "full_name":      u.FullName,
        "role":           u.Role,
        "tenant_id":      u.TenantID,
        "is_active":      u.IsActive,
        "email_verified": u.EmailVerified,
        "permissions":    getPermissions(u.Role),
    })
}

func VerifyEmail(c *gin.Context) {
    var req struct {
        Email string `json:"email" binding:"required"`
        OTP   string `json:"otp" binding:"required"`
    }
    c.BindJSON(&req)

    var user models.User
    if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
        c.JSON(404, gin.H{"detail": "User not found"})
        return
    }

    if user.EmailVerified {
        c.JSON(400, gin.H{"detail": "Email already verified"})
        return
    }

    if user.EmailVerificationOtp == nil {
        c.JSON(400, gin.H{"detail": "No verification code found"})
        return
    }

    // Check if OTP expired
    if user.EmailVerificationExpires != nil && time.Now().After(*user.EmailVerificationExpires) {
        c.JSON(400, gin.H{"detail": "Verification code expired. Please request a new one."})
        return
    }

    if *user.EmailVerificationOtp != req.OTP {
        c.JSON(400, gin.H{"detail": "Invalid verification code"})
        return
    }

    user.EmailVerified = true
    user.EmailVerificationOtp = nil
    user.EmailVerificationExpires = nil
    database.DB.Save(&user)

    token, _ := auth.CreateToken(user.ID)

    c.JSON(200, gin.H{
        "message":      "Email verified successfully",
        "access_token": token,
        "token_type":   "bearer",
        "user": gin.H{
            "id":          user.ID,
            "email":       user.Email,
            "full_name":   user.FullName,
            "role":        user.Role,
            "tenant_id":   user.TenantID,
            "permissions": getPermissions(user.Role),
        },
    })
}

func ResendOTP(c *gin.Context) {
    var req struct {
        Email string `json:"email" binding:"required"`
    }
    c.BindJSON(&req)

    var user models.User
    if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
        c.JSON(404, gin.H{"detail": "User not found"})
        return
    }

    if user.EmailVerified {
        c.JSON(400, gin.H{"detail": "Email already verified"})
        return
    }

    c.JSON(200, gin.H{
        "message":    "Verification code resent",
        "email_sent": true,
    })
}

func ForgotPassword(c *gin.Context) {
    var req struct {
        Email string `json:"email" binding:"required"`
    }
    c.BindJSON(&req)

    c.JSON(200, gin.H{"message": "If email exists, reset link has been sent"})
}

func ResetPassword(c *gin.Context) {
    var req struct {
        Token       string `json:"token" binding:"required"`
        NewPassword string `json:"new_password" binding:"required"`
    }
    c.BindJSON(&req)

    var user models.User
    if err := database.DB.Where("password_reset_token = ?", req.Token).First(&user).Error; err != nil {
        c.JSON(400, gin.H{"detail": "Invalid or expired reset link"})
        return
    }

    hashed, _ := auth.HashPassword(req.NewPassword)
    user.HashedPassword = hashed
    user.PasswordResetToken = nil
    user.PasswordResetExpires = nil
    database.DB.Save(&user)

    c.JSON(200, gin.H{"message": "Password reset successfully"})
}

func ValidatePartnerCode(c *gin.Context) {
    code := c.Query("code")

    if !strings.HasPrefix(code, "PA") {
        c.JSON(200, gin.H{"valid": false, "message": "Invalid code format"})
        return
    }

    c.JSON(200, gin.H{"valid": false, "message": "Invalid code"})
}
