# Platform V2 - Vision & Architecture

## Overview
**Platform V2** is a revolutionary multi-tenant SaaS platform that enables users to build any type of digital product (websites, e-commerce stores, CRM systems, etc.) without coding, powered by AI.

## Core Concept
> **"WordPress + Shopify + Wix + HubSpot + AI Brain - All in One Platform"**

Users can create unlimited projects, each with its own modules, design, and subdomain/custom domain. An optional AI Brain module allows users to modify their projects using natural language.

---

## User Hierarchy
```
Super User (Platform Owner)
  └── Manages entire platform
  └── Sees all tenants, users, and projects
  
Reseller (Company/Agency)
  └── Manages their users
  └── Sees all projects from their users
  └── Can create projects for users
  
User (Developer/Designer/Business Owner)
  └── Creates and manages their own projects
  └── Can enable/disable modules per project
  └── Can invite team members to projects
```

---

## Project Structure

### Every User Can:
- Create **unlimited projects**
- Each project gets:
  - Unique subdomain: `myshop.buildown.design`
  - Custom domain support: `myshop.com`
  - Project admin panel: `myshop.buildown.design/manage`
  - Independent settings (colors, fonts, logo, etc.)

### Project Creation Flow:
```
1. User creates new project
2. Selects modules (E-commerce, Blog, CRM, etc.)
3. Chooses template (optional)
4. Project is created with:
   - Database tables for selected modules
   - Default settings
   - Subdomain activated
   - Admin panel ready
```

---

## Module System

### Core Modules
- **CMS** - Content management (pages, blocks)
- **Blog** - Articles, posts, categories
- **E-commerce** - Products, cart, checkout, orders
- **CRM** - Contacts, leads, deals, pipeline
- **HR** - Employees, attendance, payroll, leave

### Feature Modules
- **Multilingual** - Multiple languages with translations table
- **AI Brain** - Natural language project modifications
- **Advanced SEO** - Meta tags, schema markup, sitemaps
- **Form Builder** - Custom forms with submissions
- **Analytics** - Page views, events, conversions
- **Email Marketing** - Campaigns, automation (SendGrid, Gmail, etc.)
- **Payments** - Stripe, PayPal, etc.

### How Modules Work:
- Each module has predefined database tables
- When enabled, tables are created with `project_id` field
- Module routes become active
- Module admin interface appears in `/manage`
- Can be enabled/disabled anytime

**Example:**
```
Project: "My Store"
Modules enabled: [E-commerce, Blog, Multilingual]

Database tables created:
- ecommerce_products (project_id, name, price, ...)
- ecommerce_categories (project_id, name, ...)
- ecommerce_orders (project_id, total, status, ...)
- blog_posts (project_id, title, content, ...)
- translations (project_id, entity_type, entity_id, language, value, ...)
```

---

## AI Brain Module

### Concept
Users can modify their projects using natural language. AI understands the project structure and makes controlled changes.

### How It Works:
1. User enables AI Brain module
2. User adds their own API credentials (OpenAI, Claude, etc.)
3. User selects which AI model to use
4. AI can:
   - Add/edit/remove sections on pages
   - Create content (text, copy)
   - Modify styling (colors, fonts)
   - Add simple database fields (with approval)
   - Generate images/graphics

### Safety & Limitations:
- AI **CANNOT** change:
  - Core database structure
  - Module definitions
  - Security settings
  - Payment configurations
- All major changes require **approval**
- Full **rollback** functionality
- Change history logged

### Example Usage:
```
User: "Add a newsletter signup section to the homepage"
AI: 
  1. Analyzes homepage structure
  2. Creates newsletter section component
  3. Adds email field to database (if needed)
  4. Shows preview
  5. Waits for approval
  6. Applies changes
```

---

## Multilingual System

### Without Multilingual Module:
- Project has one language (default: English)
- No translations needed

### With Multilingual Module:
- User selects languages: [English, Arabic, Turkish, Spanish, ...]
- New table created: `translations`
- Every translatable field stored in translations table
- AI Brain can auto-translate (if enabled)

### URL Structure:
```
myshop.com/en/          → English
myshop.com/ar/          → Arabic (RTL support)
myshop.com/tr/          → Turkish
myshop.com/es/          → Spanish
```

### Translation Flow:
```
1. User creates product: "Blue Shoes"
2. Multilingual module enabled with [en, ar, tr]
3. AI Brain (if enabled) auto-translates:
   - EN: "Blue Shoes"
   - AR: "حذاء أزرق"
   - TR: "Mavi Ayakkabı"
4. Stored in translations table
5. Frontend shows based on URL (/ar/, /tr/)
```

### RTL Support:
- Automatic RTL for Arabic, Hebrew, Persian
- CSS direction changes
- Mirror layouts

---

## SEO System

Every page/product/post has SEO fields:
- Meta title
- Meta description
- Canonical URL
- Open Graph image
- Keywords
- JSON-LD schema markup

**Database:**
```sql
-- Added to every content table
meta_title VARCHAR(255)
meta_description TEXT
canonical_url VARCHAR(500)
og_image VARCHAR(500)
keywords TEXT[]
schema_markup JSONB
```

**Frontend Rendering:**
```html
<head>
  <title>Blue Shoes - My Shop</title>
  <meta name="description" content="Comfortable blue shoes..." />
  <link rel="canonical" href="https://myshop.com/products/blue-shoes" />
  <meta property="og:image" content="https://myshop.com/images/blue-shoes.jpg" />
  <script type="application/ld+json">{...schema...}</script>
</head>
```

---

## Domain & Hosting

### Subdomain (Default):
- Every project gets: `projectname.buildown.design`
- Automatic SSL
- Admin panel: `projectname.buildown.design/manage`

### Custom Domain:
- User can add: `mystore.com`
- Points to same project
- Admin panel: `mystore.com/manage`

### Future (Kubernetes):
- User can use their own database (Supabase, own server)
- User can use their own file storage (S3, own server)
- Multi-region deployment

---

## Database Architecture

### Single Database, Multi-Tenant
- Database: `platform_system`
- Every table has `project_id` for isolation
- Core tables: `tenants`, `users`, `projects`
- Module tables: `ecommerce_products`, `cms_pages`, etc.

### Example Schema:
```sql
-- Core
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    tenant_id INT,
    user_id INT,
    name VARCHAR(255),
    subdomain VARCHAR(255) UNIQUE,
    custom_domain VARCHAR(255),
    modules_enabled JSONB,  -- ['ecommerce', 'blog', 'multilingual']
    settings JSONB,         -- {primaryColor: '#FF5733', font: 'Inter'}
    created_at TIMESTAMP
);

-- E-commerce Module
CREATE TABLE ecommerce_products (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id),  -- Isolation
    name VARCHAR(255),
    slug VARCHAR(255),
    price DECIMAL(10,2),
    description TEXT,
    -- SEO fields
    meta_title VARCHAR(255),
    canonical_url VARCHAR(500),
    created_at TIMESTAMP
);

-- Multilingual Module
CREATE TABLE translations (
    id SERIAL PRIMARY KEY,
    project_id INT,
    entity_type VARCHAR(50),  -- 'product', 'page', 'post'
    entity_id INT,
    field_name VARCHAR(100),  -- 'name', 'description'
    language VARCHAR(5),      -- 'en', 'ar', 'tr'
    value TEXT,
    created_at TIMESTAMP
);

-- AI Brain Module
CREATE TABLE ai_changes (
    id SERIAL PRIMARY KEY,
    project_id INT,
    user_prompt TEXT,
    ai_response TEXT,
    changes_made JSONB,
    status VARCHAR(50),  -- 'pending', 'approved', 'applied'
    created_at TIMESTAMP
);
```

---

## Technology Stack

### Frontend:
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **UI Components:** Headless UI
- **Icons:** Heroicons
- **Editor:** React Quill (rich text)
- **i18n:** next-intl (multilingual)

### Backend:
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Auth:** JWT + Argon2
- **Cache:** Redis
- **Tasks:** Celery (background jobs)
- **AI:** Anthropic Claude / OpenAI GPT

### Infrastructure:
- **Deployment:** Docker + Docker Compose
- **Web Server:** Nginx
- **Monorepo:** Turborepo
- **Current:** Single server (Hetzner)
- **Future:** Kubernetes, multi-region

### Storage:
- **Files:** Local (now), S3 (future), user's own storage
- **Images:** Sharp (optimization)
- **Uploads:** React Dropzone

### Payments (Future):
- Stripe
- PayPal
- Custom payment modules

---

## Business Model

### Pricing Tiers:
1. **Free** - 1 project, basic modules
2. **Pro** ($29/mo) - 5 projects, all modules, AI Brain
3. **Business** ($99/mo) - Unlimited projects, team features
4. **Enterprise** - Custom pricing, white-label, dedicated support

### Revenue Streams:
- Monthly subscriptions
- AI usage fees (if user uses platform's API)
- Custom domain fees
- Template marketplace
- Plugin marketplace
- White-label licensing

---

## Competitive Advantages

1. **All-in-One** - No need for multiple tools
2. **AI-Powered** - Modify projects with natural language
3. **Module System** - Only pay for what you use
4. **Multi-Tenant** - Built for scale from day 1
5. **No Coding** - Anyone can build professional apps
6. **Multilingual** - Global from day 1
7. **SEO-First** - Built-in optimization
8. **Flexible** - Use our hosting or yours

---

## Roadmap

### Phase 1: Foundation (Current) ✅
- Core authentication
- Project management
- Module system architecture
- Admin panel

### Phase 2: Essential Modules (Next 3 months)
- CMS module
- E-commerce module
- Blog module
- Multilingual module
- SEO system

### Phase 3: AI Brain (6 months)
- AI integration
- Natural language processing
- Change approval system
- Rollback functionality

### Phase 4: Advanced Features (9 months)
- CRM module
- HR module
- Form builder
- Analytics
- Email marketing

### Phase 5: Scale (12 months)
- Kubernetes deployment
- Multi-region
- Template marketplace
- Plugin system
- White-label

---

## Target Users

1. **Small Businesses** - Need website + e-commerce + basic CRM
2. **Freelancers** - Build client websites quickly
3. **Agencies** - Manage multiple client projects
4. **Startups** - MVP to production without developers
5. **Enterprises** - White-label for internal tools

---

## Success Metrics

- **10,000+ active users** in Year 1
- **50,000+ projects** created
- **$500K+ ARR** in Year 1
- **99.9% uptime**
- **<2s page load time**
- **5-star rating** on review platforms

---

## Vision Statement

> **"Democratize digital product creation by combining the power of modular architecture with AI assistance, enabling anyone to build professional-grade websites, e-commerce stores, and business tools without writing a single line of code."**

Built with ❤️ by the Buildown team
