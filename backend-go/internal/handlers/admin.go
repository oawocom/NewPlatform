package handlers

import (
    "github.com/gin-gonic/gin"
    "github.com/yourusername/platform-v2-go/internal/database"
    "github.com/yourusername/platform-v2-go/internal/models"
    "github.com/yourusername/platform-v2-go/internal/auth"
)

func GetDashboardStats(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)

    var usersCount, projectsCount, tenantsCount, activeUsersCount int64

    if u.Role == "SUPER_ADMIN" {
        database.DB.Model(&models.User{}).Count(&usersCount)
        database.DB.Model(&models.Project{}).Count(&projectsCount)
        database.DB.Model(&models.User{}).Where("role = ?", "TENANT_ADMIN").Distinct("tenant_id").Count(&tenantsCount)
        database.DB.Model(&models.User{}).Where("is_active = ?", true).Count(&activeUsersCount)
    } else {
        database.DB.Model(&models.User{}).Where("tenant_id = ?", u.TenantID).Count(&usersCount)
        database.DB.Model(&models.Project{}).Where("tenant_id = ?", u.TenantID).Count(&projectsCount)
        tenantsCount = 1
        database.DB.Model(&models.User{}).Where("tenant_id = ? AND is_active = ?", u.TenantID, true).Count(&activeUsersCount)
    }

    c.JSON(200, gin.H{
        "users_count":    usersCount,
        "projects_count": projectsCount,
        "tenants_count":  tenantsCount,
        "active_users":   activeUsersCount,
    })
}

func ListAdminUsers(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)

    var users []models.User
    if u.Role == "SUPER_ADMIN" {
        database.DB.Order("created_at DESC").Find(&users)
    } else {
        database.DB.Where("tenant_id = ?", u.TenantID).Order("created_at DESC").Find(&users)
    }

    items := []gin.H{}
    for _, usr := range users {
        items = append(items, gin.H{
            "id":         usr.ID,
            "email":      usr.Email,
            "full_name":  usr.FullName,
            "role":       usr.Role,
            "is_active":  usr.IsActive,
            "tenant_id":  usr.TenantID,
            "created_at": usr.CreatedAt,
        })
    }

    c.JSON(200, gin.H{"items": items})
}

func ListAdminProjects(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)

    type ProjectWithCreator struct {
        models.Project
        CreatedByName *string `json:"created_by_name"`
    }

    var projects []ProjectWithCreator
    
    if u.Role == "SUPER_ADMIN" {
        database.DB.Table("projects").
            Select("projects.*, users.full_name as created_by_name").
            Joins("LEFT JOIN users ON projects.created_by_id = users.id").
            Order("projects.created_at DESC").
            Scan(&projects)
    } else {
        database.DB.Table("projects").
            Select("projects.*, users.full_name as created_by_name").
            Joins("LEFT JOIN users ON projects.created_by_id = users.id").
            Where("projects.tenant_id = ?", u.TenantID).
            Order("projects.created_at DESC").
            Scan(&projects)
    }

    items := []gin.H{}
    for _, proj := range projects {
        items = append(items, gin.H{
            "id":              proj.ID,
            "name":            proj.Name,
            "subdomain":       proj.Subdomain,
            "description":     proj.Description,
            "status":          proj.Status,
            "tenant_id":       proj.TenantID,
            "created_by_id":   proj.CreatedByID,
            "created_by_name": proj.CreatedByName,
            "created_at":      proj.CreatedAt,
            "published_at":    proj.PublishedAt,
        })
    }

    c.JSON(200, gin.H{"items": items})
}

func ListTenantAdmins(c *gin.Context) {
    var users []models.User
    database.DB.Select("id, full_name, email").
        Where("role = ?", "TENANT_ADMIN").
        Order("full_name").
        Find(&users)

    items := []gin.H{}
    for _, usr := range users {
        items = append(items, gin.H{
            "id":        usr.ID,
            "full_name": usr.FullName,
            "email":     usr.Email,
        })
    }

    c.JSON(200, gin.H{"items": items})
}

func CreateUserAdmin(c *gin.Context) {
    var req struct {
        Email       string `json:"email" binding:"required"`
        FullName    string `json:"full_name" binding:"required"`
        Password    string `json:"password" binding:"required"`
        Role        string `json:"role" binding:"required"`
        CompanyName string `json:"company_name"`
        IsActive    bool   `json:"is_active"`
    }
    c.BindJSON(&req)

    var existing models.User
    if database.DB.Where("email = ?", req.Email).First(&existing).Error == nil {
        c.JSON(400, gin.H{"detail": "Email already exists"})
        return
    }

    user, _ := c.Get("user")
    u := user.(models.User)
    tenantID := u.TenantID

    hashed, _ := auth.HashPassword(req.Password)

    newUser := models.User{
        Email:          req.Email,
        FullName:       req.FullName,
        HashedPassword: hashed,
        Role:           req.Role,
        TenantID:       tenantID,
        IsActive:       req.IsActive,
        EmailVerified:  true,
    }

    database.DB.Create(&newUser)

    c.JSON(201, gin.H{
        "id":      newUser.ID,
        "email":   newUser.Email,
        "message": "User created",
    })
}

func ResetUserPassword(c *gin.Context) {
    userID := c.Param("user_id")
    var req struct {
        NewPassword string `json:"new_password" binding:"required"`
    }
    c.BindJSON(&req)

    var user models.User
    if err := database.DB.First(&user, userID).Error; err != nil {
        c.JSON(404, gin.H{"detail": "User not found"})
        return
    }

    hashed, _ := auth.HashPassword(req.NewPassword)
    user.HashedPassword = hashed
    database.DB.Save(&user)

    c.JSON(200, gin.H{"message": "Password reset successfully"})
}

func HasTenantAdmins(c *gin.Context) {
    var count int64
    database.DB.Model(&models.User{}).
        Where("role = ? AND is_active = ?", "TENANT_ADMIN", true).
        Count(&count)

    c.JSON(200, gin.H{
        "has_admins": count > 0,
        "count":      count,
    })
}
