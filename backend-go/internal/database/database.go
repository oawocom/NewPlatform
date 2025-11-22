package database

import (
    "log"
    "os"
    "gorm.io/gorm"
    "gorm.io/driver/postgres"
)

var DB *gorm.DB

func Connect() {
    dsn := os.Getenv("DATABASE_URL")
    if dsn == "" {
        dsn = "postgresql://platform_user:iw3NO6UKZzAiUxS6YOmytQZj9M7MrVzF@postgres:5432/platform_system"
    }

    var err error
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    log.Println("✅ Database connected")
}
