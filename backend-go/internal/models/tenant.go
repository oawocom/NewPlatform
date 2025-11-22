package models

import "time"

type Tenant struct {
    ID        int       `gorm:"primaryKey" json:"id"`
    Name      string    `json:"name"`
    Status    string    `json:"status"`
    IsActive  bool      `json:"is_active"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
