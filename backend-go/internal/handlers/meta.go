package handlers

import (
    "strings"
    "github.com/gin-gonic/gin"
    "github.com/yourusername/platform-v2-go/internal/database"
)

func GetTableMetadata(c *gin.Context) {
    tableName := c.Param("table_name")

    type Column struct {
        ColumnName    string
        DataType      string
        IsNullable    string
        ColumnDefault *string
    }

    var columns []Column
    query := `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = ? AND table_schema = 'public'
        ORDER BY ordinal_position
    `
    database.DB.Raw(query, tableName).Scan(&columns)

    if len(columns) == 0 {
        c.JSON(404, gin.H{"detail": "Table not found"})
        return
    }

    fields := []gin.H{}
    tableColumns := []gin.H{}

    for _, col := range columns {
        // Skip system fields
        if col.ColumnName == "id" || col.ColumnName == "created_at" || 
           col.ColumnName == "updated_at" || col.ColumnName == "tenant_id" {
            continue
        }

        // Map type
        formType := "text"
        if strings.Contains(col.DataType, "text") {
            formType = "textarea"
        } else if strings.Contains(col.DataType, "integer") || strings.Contains(col.DataType, "numeric") {
            formType = "number"
        } else if strings.Contains(col.DataType, "boolean") {
            formType = "checkbox"
        } else if strings.Contains(col.DataType, "timestamp") {
            formType = "datetime"
        } else if strings.Contains(col.DataType, "date") {
            formType = "date"
        }

        if strings.Contains(col.ColumnName, "password") {
            formType = "password"
        }
        if strings.Contains(col.ColumnName, "email") {
            formType = "email"
        }

        label := strings.Title(strings.ReplaceAll(col.ColumnName, "_", " "))

        fields = append(fields, gin.H{
            "name":         col.ColumnName,
            "label":        label,
            "type":         formType,
            "required":     col.IsNullable == "NO",
            "defaultValue": col.ColumnDefault,
        })

        // Skip sensitive fields in columns
        if col.ColumnName == "hashed_password" || col.ColumnName == "settings" {
            continue
        }

        colType := "text"
        if strings.Contains(col.ColumnName, "status") || strings.Contains(col.ColumnName, "role") {
            colType = "badge"
        }

        tableColumns = append(tableColumns, gin.H{
            "key":        col.ColumnName,
            "label":      label,
            "sortable":   true,
            "searchable": col.ColumnName != "id",
            "type":       colType,
        })
    }

    c.JSON(200, gin.H{
        "table":       tableName,
        "title":       strings.Title(tableName),
        "apiEndpoint": "/api/v1/" + tableName,
        "fields":      fields,
        "columns":     tableColumns,
    })
}

func ListTables(c *gin.Context) {
    var tables []string
    query := `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'pg_%'
        AND table_name != 'spatial_ref_sys'
        ORDER BY table_name
    `
    database.DB.Raw(query).Pluck("table_name", &tables)

    c.JSON(200, gin.H{"tables": tables})
}
