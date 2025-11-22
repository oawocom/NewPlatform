package handlers

import (
    "strconv"
    "github.com/gin-gonic/gin"
    "github.com/yourusername/platform-v2-go/internal/database"
    "github.com/yourusername/platform-v2-go/internal/models"
    "github.com/yourusername/platform-v2-go/internal/auth"
)

func ListUsers(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)

    skip, _ := strconv.Atoi(c.DefaultQuery("skip", "0"))
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

    var users []models.User
    database.DB.Where("tenant_id = ?", u.TenantID).
        Offset(skip).Limit(limit).Find(&users)

    c.JSON(200, users)
}

func CountUsers(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)

    var count int64
    database.DB.Model(&models.User{}).
        Where("tenant_id = ?", u.TenantID).Count(&count)

    c.JSON(200, gin.H{"count": count})
}

func GetUser(c *gin.Context) {
    id := c.Param("user_id")
    
    var user models.User
    if err := database.DB.First(&user, id).Error; err != nil {
        c.JSON(404, gin.H{"detail": "User not found"})
        return
    }

    c.JSON(200, user)
}

func CreateUser(c *gin.Context) {
    currentUser, _ := c.Get("user")
    u := currentUser.(models.User)

    var req struct {
        Email    string `json:"email" binding:"required"`
        Password string `json:"password" binding:"required"`
        FullName string `json:"full_name" binding:"required"`
        Role     string `json:"role"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"detail": "Invalid request"})
        return
    }

    var existing models.User
    if database.DB.Where("email = ?", req.Email).First(&existing).Error == nil {
        c.JSON(400, gin.H{"detail": "Email already exists"})
        return
    }

    if req.Role == "" {
        req.Role = "USER"
    }

    hashed, _ := auth.HashPassword(req.Password)

    newUser := models.User{
        Email:          req.Email,
        FullName:       req.FullName,
        HashedPassword: hashed,
        Role:           req.Role,
        TenantID:       u.TenantID,
        IsActive:       true,
        EmailVerified:  true,
    }

    database.DB.Create(&newUser)
    c.JSON(201, newUser)
}

func UpdateUser(c *gin.Context) {
    id := c.Param("user_id")
    
    var user models.User
    if err := database.DB.First(&user, id).Error; err != nil {
        c.JSON(404, gin.H{"detail": "User not found"})
        return
    }

    var data map[string]interface{}
    c.BindJSON(&data)

    database.DB.Model(&user).Updates(data)
    c.JSON(200, user)
}

func DeleteUser(c *gin.Context) {
    id := c.Param("user_id")
    database.DB.Delete(&models.User{}, id)
    c.JSON(200, gin.H{"message": "User deleted successfully"})
}

func UpdateUserPassword(c *gin.Context) {
    id := c.Param("user_id")
    
    var user models.User
    if err := database.DB.First(&user, id).Error; err != nil {
        c.JSON(404, gin.H{"detail": "User not found"})
        return
    }

    var req struct {
        NewPassword string `json:"new_password" binding:"required"`
    }
    c.BindJSON(&req)

    hashed, _ := auth.HashPassword(req.NewPassword)
    user.HashedPassword = hashed
    database.DB.Save(&user)

    c.JSON(200, gin.H{"message": "Password updated successfully"})
}

func ActivateUser(c *gin.Context) {
    id := c.Param("user_id")
    
    var user models.User
    if err := database.DB.First(&user, id).Error; err != nil {
        c.JSON(404, gin.H{"detail": "User not found"})
        return
    }

    user.IsActive = true
    database.DB.Save(&user)
    c.JSON(200, user)
}

func DeactivateUser(c *gin.Context) {
    id := c.Param("user_id")
    
    var user models.User
    if err := database.DB.First(&user, id).Error; err != nil {
        c.JSON(404, gin.H{"detail": "User not found"})
        return
    }

    user.IsActive = false
    database.DB.Save(&user)
    c.JSON(200, user)
}

func ChangeUserRole(c *gin.Context) {
    id := c.Param("user_id")
    
    var user models.User
    if err := database.DB.First(&user, id).Error; err != nil {
        c.JSON(404, gin.H{"detail": "User not found"})
        return
    }

    var req struct {
        NewRole string `json:"new_role" binding:"required"`
    }
    c.BindJSON(&req)

    user.Role = req.NewRole
    database.DB.Save(&user)
    c.JSON(200, user)
}
