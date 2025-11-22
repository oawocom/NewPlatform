package models

import (
    "time"
    "database/sql/driver"
    "encoding/json"
)

type Project struct {
    ID              int           `gorm:"primaryKey" json:"id"`
    Name            string        `json:"name"`
    Type            *string       `json:"type"`
    Subdomain       string        `json:"subdomain"`
    Description     *string       `json:"description"`
    Status          *string       `json:"status"`
    Password        *string       `json:"password,omitempty"`
    ModulesEnabled  StringArray   `gorm:"type:jsonb;default:'[]'" json:"modules_enabled"`
    TenantID        int           `json:"tenant_id"`
    CreatedByID     *int          `json:"created_by_id"`
    PublishedAt     *time.Time    `json:"published_at"`
    IsActive        bool          `json:"is_active"`
    CreatedAt       time.Time     `json:"created_at"`
    UpdatedAt       *time.Time    `json:"updated_at"`
}

type StringArray []string

func (s StringArray) Value() (driver.Value, error) {
    return json.Marshal(s)
}

func (s *StringArray) Scan(value interface{}) error {
    if value == nil {
        *s = []string{}
        return nil
    }
    bytes, ok := value.([]byte)
    if !ok {
        return nil
    }
    return json.Unmarshal(bytes, s)
}
