package handlers

import (
    "strconv"
    "github.com/gin-gonic/gin"
    "github.com/yourusername/platform-v2-go/internal/database"
    "github.com/yourusername/platform-v2-go/internal/models"
)

func CreateContent(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)

    var data map[string]interface{}
    c.BindJSON(&data)

    content := models.Content{
        TenantID:    *u.TenantID,
        AuthorID:    u.ID,
        Title:       data["title"].(string),
        Slug:        data["slug"].(string),
        Body:        data["body"].(string),
        ContentType: "post",
        Status:      "draft",
        Featured:    false,
    }

    if ct, ok := data["content_type"].(string); ok {
        content.ContentType = ct
    }
    if st, ok := data["status"].(string); ok {
        content.Status = st
    }

    database.DB.Create(&content)
    c.JSON(201, content)
}

func ListContent(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)

    contentType := c.Query("content_type")
    status := c.Query("status")
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
    offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

    query := database.DB.Where("tenant_id = ?", u.TenantID)

    if contentType != "" {
        query = query.Where("content_type = ?", contentType)
    }
    if status != "" {
        query = query.Where("status = ?", status)
    }

    var contents []models.Content
    query.Order("created_at DESC").Offset(offset).Limit(limit).Find(&contents)

    c.JSON(200, contents)
}

func GetContent(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)
    id := c.Param("content_id")

    var content models.Content
    if err := database.DB.Where("id = ? AND tenant_id = ?", id, u.TenantID).First(&content).Error; err != nil {
        c.JSON(404, gin.H{"detail": "Content not found"})
        return
    }

    c.JSON(200, content)
}

func UpdateContent(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)
    id := c.Param("content_id")

    var content models.Content
    if err := database.DB.Where("id = ? AND tenant_id = ?", id, u.TenantID).First(&content).Error; err != nil {
        c.JSON(404, gin.H{"detail": "Content not found"})
        return
    }

    var data map[string]interface{}
    c.BindJSON(&data)

    database.DB.Model(&content).Updates(data)
    c.JSON(200, content)
}

func DeleteContent(c *gin.Context) {
    user, _ := c.Get("user")
    u := user.(models.User)
    id := c.Param("content_id")

    var content models.Content
    if err := database.DB.Where("id = ? AND tenant_id = ?", id, u.TenantID).First(&content).Error; err != nil {
        c.JSON(404, gin.H{"detail": "Content not found"})
        return
    }

    database.DB.Delete(&content)
    c.JSON(204, nil)
}
