package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "github.com/yourusername/platform-v2-go/internal/database"
    "github.com/yourusername/platform-v2-go/internal/handlers"
    "github.com/yourusername/platform-v2-go/internal/middleware"
)

func main() {
    database.Connect()
    
    r := gin.Default()
    
    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{"status": "healthy"})
    })
    
    v1 := r.Group("/api/v1")
    {
        auth := v1.Group("/auth")
        {
            auth.POST("/login", handlers.Login)
            auth.POST("/register", handlers.Register)
            auth.GET("/me", middleware.AuthRequired(), handlers.GetMe)
            auth.POST("/verify-email", handlers.VerifyEmail)
            auth.POST("/resend-otp", handlers.ResendOTP)
            auth.POST("/forgot-password", handlers.ForgotPassword)
            auth.POST("/reset-password", handlers.ResetPassword)
            auth.GET("/validate-partner-code", handlers.ValidatePartnerCode)
        }
        
        projects := v1.Group("/projects")
        {
            projects.GET("", middleware.AuthRequired(), handlers.ListProjects)
            projects.GET("/count", middleware.AuthRequired(), handlers.CountProjects)
            projects.GET("/:id", middleware.AuthRequired(), handlers.GetProject)
            projects.POST("", middleware.AuthRequired(), handlers.CreateProject)
            projects.PUT("/:id", middleware.AuthRequired(), handlers.UpdateProject)
            projects.DELETE("/:id", middleware.AuthRequired(), handlers.DeleteProject)
            projects.POST("/:id/publish", middleware.AuthRequired(), handlers.PublishProject)
            projects.POST("/:id/unpublish", middleware.AuthRequired(), handlers.UnpublishProject)
            projects.POST("/:id/verify-password", middleware.AuthRequired(), handlers.VerifyProjectPassword)
            projects.GET("/by-subdomain/:subdomain", handlers.GetProjectBySubdomain)
        }
        
        admin := v1.Group("/admin")
        {
            admin.GET("/dashboard/stats", middleware.AuthRequired(), handlers.GetDashboardStats)
            admin.GET("/users", middleware.AuthRequired(), handlers.ListAdminUsers)
            admin.GET("/projects", middleware.AuthRequired(), handlers.ListAdminProjects)
            admin.GET("/tenant-admins", middleware.AuthRequired(), handlers.ListTenantAdmins)
            admin.POST("/users/create", middleware.AuthRequired(), handlers.CreateUserAdmin)
            admin.PUT("/users/:user_id/reset-password", middleware.AuthRequired(), handlers.ResetUserPassword)
            admin.GET("/has-tenant-admins", handlers.HasTenantAdmins)
            
            adminTenants := admin.Group("/tenants")
            {
                adminTenants.GET("/with-admins", middleware.AuthRequired(), handlers.GetTenantsWithAdmins)
            }
        }
        
        users := v1.Group("/users")
        {
            users.GET("", middleware.AuthRequired(), handlers.ListUsers)
            users.GET("/count", middleware.AuthRequired(), handlers.CountUsers)
            users.GET("/:user_id", middleware.AuthRequired(), handlers.GetUser)
            users.POST("", middleware.AuthRequired(), handlers.CreateUser)
            users.PUT("/:user_id", middleware.AuthRequired(), handlers.UpdateUser)
            users.DELETE("/:user_id", middleware.AuthRequired(), handlers.DeleteUser)
            users.POST("/:user_id/password", middleware.AuthRequired(), handlers.UpdateUserPassword)
            users.POST("/:user_id/activate", middleware.AuthRequired(), handlers.ActivateUser)
            users.POST("/:user_id/deactivate", middleware.AuthRequired(), handlers.DeactivateUser)
            users.PUT("/:user_id/role", middleware.AuthRequired(), handlers.ChangeUserRole)
        }
        
        tenants := v1.Group("/tenants")
        {
            tenants.GET("", middleware.AuthRequired(), handlers.ListTenants)
            tenants.GET("/:tenant_id", middleware.AuthRequired(), handlers.GetTenant)
            tenants.POST("", middleware.AuthRequired(), handlers.CreateTenant)
            tenants.PUT("/:tenant_id", middleware.AuthRequired(), handlers.UpdateTenant)
            tenants.DELETE("/:tenant_id", middleware.AuthRequired(), handlers.DeleteTenant)
        }
        
        cms := v1.Group("/cms")
        {
            cms.POST("/content", middleware.AuthRequired(), handlers.CreateContent)
            cms.GET("/content", middleware.AuthRequired(), handlers.ListContent)
            cms.GET("/content/:content_id", middleware.AuthRequired(), handlers.GetContent)
            cms.PUT("/content/:content_id", middleware.AuthRequired(), handlers.UpdateContent)
            cms.DELETE("/content/:content_id", middleware.AuthRequired(), handlers.DeleteContent)
        }
        
        meta := v1.Group("/meta")
        {
            meta.GET("/", middleware.AuthRequired(), handlers.ListTables)
            meta.GET("/:table_name", middleware.AuthRequired(), handlers.GetTableMetadata)
        }
    }
    
    log.Println("🚀 Go Backend starting on :8002")
    r.Run(":8002")
}
