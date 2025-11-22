package handlers

import (
    "strconv"
    "github.com/gin-gonic/gin"
    "github.com/yourusername/platform-v2-go/internal/database"
    "github.com/yourusername/platform-v2-go/internal/models"
)

func ListTenants(c *gin.Context) {
    skip, _ := strconv.Atoi(c.DefaultQuery("skip", "0"))
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))

    var tenants []models.Tenant
    database.DB.Offset(skip).Limit(limit).Find(&tenants)

    c.JSON(200, tenants)
}

func GetTenant(c *gin.Context) {
    id := c.Param("tenant_id")
    
    var tenant models.Tenant
    if err := database.DB.First(&tenant, id).Error; err != nil {
        c.JSON(404, gin.H{"detail": "Tenant not found"})
        return
    }

    c.JSON(200, tenant)
}

func CreateTenant(c *gin.Context) {
    var data map[string]interface{}
    c.BindJSON(&data)

    tenant := models.Tenant{
        Name:     data["name"].(string),
        Status:   "TRIAL",
        IsActive: true,
    }

    database.DB.Create(&tenant)
    c.JSON(201, tenant)
}

func UpdateTenant(c *gin.Context) {
    id := c.Param("tenant_id")
    
    var tenant models.Tenant
    if err := database.DB.First(&tenant, id).Error; err != nil {
        c.JSON(404, gin.H{"detail": "Tenant not found"})
        return
    }

    var data map[string]interface{}
    c.BindJSON(&data)

    database.DB.Model(&tenant).Updates(data)
    c.JSON(200, tenant)
}

func DeleteTenant(c *gin.Context) {
    id := c.Param("tenant_id")
    database.DB.Delete(&models.Tenant{}, id)
    c.JSON(200, gin.H{"message": "Tenant deleted successfully"})
}

func GetTenantsWithAdmins(c *gin.Context) {
    type TenantWithAdmin struct {
        ID        int    `json:"id"`
        Name      string `json:"name"`
        Status    string `json:"status"`
        CreatedAt string `json:"created_at"`
    }

    var tenants []TenantWithAdmin
    database.DB.Raw(`
        SELECT DISTINCT t.id, t.name, t.status, t.created_at
        FROM tenants t
        INNER JOIN users u ON u.tenant_id = t.id
        WHERE u.role = 'TENANT_ADMIN'
        ORDER BY t.name
    `).Scan(&tenants)

    c.JSON(200, gin.H{"items": tenants})
}
