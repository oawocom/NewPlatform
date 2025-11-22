package handlers

import (
    "time"
    "github.com/gin-gonic/gin"
    "github.com/yourusername/platform-v2-go/internal/database"
    "github.com/yourusername/platform-v2-go/internal/models"
)

func strPtr(s string) *string { return &s }

func ListProjects(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)

    var projects []models.Project
    query := database.DB.Where("tenant_id = ?", u.TenantID)
    query.Find(&projects)

    c.JSON(200, projects)
}

func GetProject(c *gin.Context) {
    id := c.Param("id")
    
    var project models.Project
    if err := database.DB.First(&project, id).Error; err != nil {
        c.JSON(404, gin.H{"detail": "Project not found"})
        return
    }

    c.JSON(200, project)
}

func CreateProject(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)

    var data map[string]interface{}
    c.BindJSON(&data)

    project := models.Project{
        Name:       data["name"].(string),
        Subdomain:  data["subdomain"].(string),
        Status:     strPtr("INACTIVE"),
        TenantID:   *u.TenantID,
        CreatedByID: &u.ID,
        IsActive:   true,
    }

    database.DB.Create(&project)
    c.JSON(201, project)
}

func UpdateProject(c *gin.Context) {
    id := c.Param("id")
    
    var project models.Project
    if err := database.DB.First(&project, id).Error; err != nil {
        c.JSON(404, gin.H{"detail": "Project not found"})
        return
    }

    var data map[string]interface{}
    c.BindJSON(&data)

    database.DB.Model(&project).Updates(data)
    c.JSON(200, project)
}

func DeleteProject(c *gin.Context) {
    id := c.Param("id")
    database.DB.Delete(&models.Project{}, id)
    c.JSON(200, gin.H{"message": "Project deleted successfully"})
}

func PublishProject(c *gin.Context) {
    id := c.Param("id")
    
    var project models.Project
    database.DB.First(&project, id)
    
    now := time.Now()
    project.PublishedAt = &now
    project.Status = strPtr("ACTIVE")
    database.DB.Save(&project)
    
    c.JSON(200, project)
}

func UnpublishProject(c *gin.Context) {
    id := c.Param("id")
    
    var project models.Project
    database.DB.First(&project, id)
    
    project.PublishedAt = nil
    project.Status = strPtr("DRAFT")
    database.DB.Save(&project)
    
    c.JSON(200, project)
}

func GetProjectBySubdomain(c *gin.Context) {
    subdomain := c.Param("subdomain")
    
    var project models.Project
    if err := database.DB.Where("subdomain = ?", subdomain).First(&project).Error; err != nil {
        c.JSON(404, gin.H{"detail": "Project not found"})
        return
    }

    c.JSON(200, project)
}

func CountProjects(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)

    var count int64
    database.DB.Model(&models.Project{}).
        Where("tenant_id = ?", u.TenantID).Count(&count)

    c.JSON(200, gin.H{"count": count})
}

func VerifyProjectPassword(c *gin.Context) {
    id := c.Param("id")
    
    var project models.Project
    if err := database.DB.First(&project, id).Error; err != nil {
        c.JSON(404, gin.H{"detail": "Project not found"})
        return
    }

    var req struct {
        Password string `json:"password" binding:"required"`
    }
    c.BindJSON(&req)

    if project.Password == nil || *project.Password != req.Password {
        c.JSON(401, gin.H{"detail": "Invalid password"})
        return
    }

    c.JSON(200, gin.H{
        "success":    true,
        "token":      "manage_" + id,
        "project_id": project.ID,
    })
}
