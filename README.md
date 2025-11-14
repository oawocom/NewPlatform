# Platform V2 - Multi-Tenant SaaS Platform

A comprehensive, modular SaaS platform with multi-tenant architecture, supporting 85+ business modules for enterprise applications.

## 🚀 Overview

Platform V2 is a modern, scalable multi-tenant SaaS solution designed to support various business needs through modular architecture. Each tenant gets isolated data storage with customizable modules and features.

## ✨ Key Features

### Core Platform
- **Multi-Tenant Architecture** - Isolated databases per tenant for data security
- **Role-Based Access Control (RBAC)** - 4 user roles (System Admin, Tenant Admin, Project Admin, User)
- **JWT Authentication** - Secure token-based authentication
- **Dynamic CRUD** - Generic API endpoints for all entities
- **RESTful API** - Well-documented FastAPI backend
- **Modern Admin Panel** - Next.js 14 with Tailwind CSS

### Security
- JWT token authentication with refresh tokens
- Bcrypt password hashing
- Role-based permissions system
- Tenant data isolation
- SSL/TLS encryption
- Cloudflare CDN and DDoS protection

### Architecture
- **Backend**: FastAPI (Python 3.11) with PostgreSQL
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Infrastructure**: Docker, Nginx, Let's Encrypt SSL
- **Database**: PostgreSQL 15 with multi-database support

## 📦 Available Modules (85+)

### 🌍 Core & System
- Multilingual (unlimited languages)
- RBAC & Permissions
- Audit Logs
- API Integrations Hub
- Workflow Builder

### 🤖 AI & Automation
- AI Brain (Private AI Training)
- AI Email Assistant
- AI Document Analyzer
- AI Sales Assistant
- Predictive Analytics
- AI Fraud Detection

### 📝 Content & Knowledge
- CMS (Content Management)
- Document Management System
- Knowledge Base
- Digital Signature
- PDF Generator

### 👥 Human Resources
- Employee Database
- Attendance & Timesheet
- Payroll Management
- Recruitment (ATS)
- Performance Reviews
- Leave Management

### 🧾 Finance & Accounting
- Invoicing
- Payment Processing
- Double-Entry Accounting
- Expense Management
- Bank Reconciliation
- Financial Reports
- Subscription Billing

### 📦 Inventory & Warehouse
- Stock Tracking
- Multi-Warehouse Support
- Barcode/QR Scanner
- Purchase Orders
- Serial & Batch Tracking

### 🛒 Procurement & Supply Chain
- RFQ Management
- Supplier Database
- Contract Management
- Delivery Tracking

### 🎯 CRM & Sales
- Customer Relationship Management
- Sales Pipeline
- Lead Management
- WhatsApp Integration
- Customer Support Ticketing
- Live Chat
- Loyalty System

### 📋 Project Management
- Task Management
- Kanban Boards
- Gantt Charts
- Time Tracking
- Resource Allocation

### 🔧 Operations & Field Service
- Work Orders
- Maintenance (CMMS)
- Field Service Management
- GPS Tracking

### ⚙️ Manufacturing
- Bill of Materials (BOM)
- Production Planning
- Quality Control
- OEE Monitoring

### 📧 Marketing & Sales
- Email Marketing
- WhatsApp Campaigns
- Landing Page Builder
- A/B Testing
- AI Copywriting
- Social Media Scheduler

### 🚚 Logistics
- Delivery Management
- Fleet Management
- Route Optimization
- Shipment Tracking

### 🛒 E-Commerce
- Online Store
- Payment Gateway Integration
- Order Management
- Coupon System
- Returns Management
- SEO Tools

### ⚖️ Legal & Compliance
- Legal Case Management
- Compliance Tracker
- Risk Assessment
- NDA/Contract Manager

### 🔐 IT & Security
- User Access Control
- IT Service Desk
- Auto Backups
- Security Alerts

### 🏗️ Industry-Specific
- Marine Management (Vessel & Crew)
- Construction (BOQ & Site Reports)
- Energy Management

### 🔧 Platform Tools
- Custom Form Builder
- Workflow Automation
- Webhooks
- Company Portal (Intranet)

## 🏗️ Project Structure
```
platform-v2/
├── apps/
│   ├── admin/                 # Admin panel (Next.js)
│   │   ├── app/
│   │   │   ├── account/      # Auth pages (login, register)
│   │   │   ├── admin/        # Admin panel pages
│   │   │   │   ├── dashboard/
│   │   │   │   ├── projects/
│   │   │   │   └── users/
│   │   │   └── page.tsx      # Root page
│   │   └── Dockerfile.dev
│   ├── storefront/           # Customer-facing storefront
│   └── tenant-portal/        # Tenant portal
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/       # API endpoints
│   │   ├── core/             # Core utilities
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── packages/                  # Shared packages
│   ├── api-client/
│   ├── config/
│   └── ui/
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Nginx (for production)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/platform-v2.git
cd platform-v2
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start with Docker Compose**
```bash
docker-compose up -d
```

4. **Initialize system database**
```bash
docker exec -it platform_backend_v2 python create_system_db.py
```

5. **Access the platform**
- Admin Panel: https://account.buildown.design
- API Documentation: http://localhost:8000/docs

### Development Setup

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend (Admin):**
```bash
cd apps/admin
npm install
npm run dev
```

## 🔧 Configuration

### Database
The platform uses a multi-database architecture:
- **System Database**: `platform_system` - Stores tenants, users, projects
- **Tenant Databases**: `tenant_{id}` - Each tenant's isolated data

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/platform_system

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securepassword
```

## 📚 API Documentation

### Authentication
```bash
POST /api/v1/auth/register     # Register new tenant
POST /api/v1/auth/login        # Login user
POST /api/v1/auth/refresh      # Refresh token
```

### Admin Endpoints
```bash
GET  /api/v1/admin/dashboard/stats    # Dashboard statistics
GET  /api/v1/admin/users              # List users
GET  /api/v1/admin/projects           # List projects
```

### CRUD Endpoints
```bash
GET    /api/v1/crud/{table}           # List all
POST   /api/v1/crud/{table}           # Create
GET    /api/v1/crud/{table}/{id}      # Get by ID
PUT    /api/v1/crud/{table}/{id}      # Update
DELETE /api/v1/crud/{table}/{id}      # Delete
```

## 🎨 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **System Admin** | Platform administrator | Full access to all tenants |
| **Tenant Admin** | Company administrator | Manage tenant, users, projects |
| **Project Admin** | Project manager | Manage specific projects |
| **User** | Regular user | View and edit assigned content |

## 🌐 Domain Structure

- `account.buildown.design` - Authentication & Admin Panel
- `{project}.buildown.design` - Project-specific subdomains
- Wildcard DNS for dynamic subdomain routing

## 🔒 Security Features

- JWT-based authentication
- Bcrypt password hashing (12 rounds)
- Role-based access control (RBAC)
- Tenant data isolation
- SQL injection prevention (SQLAlchemy ORM)
- CORS configuration
- SSL/TLS encryption
- Cloudflare protection

## 📊 Tech Stack

**Backend:**
- FastAPI 0.104+
- SQLAlchemy 2.0+
- PostgreSQL 15
- Pydantic V2
- Python 3.11

**Frontend:**
- Next.js 14
- React 18
- TypeScript 5
- Tailwind CSS 3
- Axios

**Infrastructure:**
- Docker & Docker Compose
- Nginx
- Let's Encrypt SSL
- Cloudflare CDN

## 🚀 Deployment

### Production Deployment (Ubuntu/Debian)

1. **Install dependencies**
```bash
apt update && apt install -y docker docker-compose nginx certbot python3-certbot-nginx
```

2. **Clone and configure**
```bash
git clone <repository>
cd platform-v2
cp .env.example .env
# Edit .env
```

3. **Start services**
```bash
docker-compose up -d
```

4. **Configure Nginx**
```bash
# Copy nginx config
cp nginx.conf /etc/nginx/sites-available/platform
ln -s /etc/nginx/sites-available/platform /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

5. **Setup SSL**
```bash
certbot --nginx -d account.buildown.design
```

## 📝 Development Roadmap

- [x] Multi-tenant architecture
- [x] Authentication & authorization
- [x] Admin panel
- [x] Project management
- [x] User management
- [ ] Module marketplace
- [ ] Billing & subscriptions
- [ ] AI integrations
- [ ] Mobile apps
- [ ] Advanced analytics

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

Proprietary - All rights reserved

## 👥 Team

- **CEO**: Shamil Abbasov - ceo@oawo.com
- **Company**: OAWO

## 📞 Support

- Email: support@buildown.design
- Documentation: https://docs.buildown.design
- Issues: GitHub Issues

## 🙏 Acknowledgments

- FastAPI for the excellent Python framework
- Next.js team for the amazing React framework
- PostgreSQL for robust database system

---

**Built with ❤️ by OAWO Team**

Current Version: 2.0.0
Last Updated: November 2025
