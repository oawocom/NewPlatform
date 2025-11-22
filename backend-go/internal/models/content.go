package models

import "time"

type Content struct {
    ID              int       `gorm:"primaryKey" json:"id"`
    TenantID        int       `json:"tenant_id"`
    AuthorID        int       `json:"author_id"`
    Title           string    `json:"title"`
    Slug            string    `json:"slug"`
    ContentType     string    `json:"content_type"`
    Status          string    `json:"status"`
    Excerpt         *string   `json:"excerpt"`
    Body            string    `json:"body"`
    MetaTitle       *string   `json:"meta_title"`
    MetaDescription *string   `json:"meta_description"`
    Featured        bool      `json:"featured"`
    CreatedAt       time.Time `json:"created_at"`
    UpdatedAt       time.Time `json:"updated_at"`
}
