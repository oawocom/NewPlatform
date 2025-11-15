# Platform V2 - Project Instructions

## For AI Assistants (Claude, GPT, etc.)

This document provides complete context about the Platform V2 project structure, conventions, and development guidelines.

---

## Project Overview

**Platform V2** is a multi-tenant SaaS platform where users create unlimited projects with modular functionality (CMS, E-commerce, CRM, etc.). Think "WordPress + Shopify + HubSpot" combined with AI assistance.

**Live URL:** https://account.buildown.design  
**Repository:** /home/platform-v2/  
**Server:** Ubuntu 22.04 @ Hetzner (hel1-1)

---

## Critical Rules for AI Assistants

### DO's ✅
1. **Read VISION.md first** - Understand the architecture
2. **Follow existing patterns** - Don't create new patterns
3. **Test immediately** - Verify every change
4. **Ask before major changes** - Get user confirmation
5. **Use universal systems** - Leverage the module architecture
6. **Step-by-step approach** - One change, test, then next

### DON'Ts ❌
1. **Don't modify core structure** - Module system, auth, database core
2. **Don't hardcode** - Use configuration over code
3. **Don't create duplicate code** - DRY principle
4. **Don't assume** - Ask clarifying questions
5. **Don't start coding** - without 100% understanding of the task
6. **Don't use different tech** - Stick to the stack

---

## Technology Stack

### Frontend (Monorepo - apps/)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript + JSX
- **Styling:** Tailwind CSS
- **State:** Zustand (NOT Redux, NOT Context API)
- **Forms:** React Hook Form + Zod validation
- **HTTP:** Axios
- **UI:** Headless UI + Heroicons
- **Editor:** React Quill
- **i18n:** next-intl

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 15
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Auth:** JWT + Argon2 password hashing
- **Cache:** Redis
- **Tasks:** Celery (background jobs)
- **Validation:** Pydantic

### Deployment
- **Containers:** Docker + Docker Compose
- **Web Server:** Nginx (reverse proxy)
- **Monorepo:** Turborepo

---

## Folder Structure
```
/home/platform-v2/
├── apps/                          # Frontend applications
│   ├── admin/                    # Platform admin panel
│   └── storefront/               # Universal project frontend
│
├── backend/                       # FastAPI backend
│   ├── app/
│   │   ├── core/                # Core system (auth, db, config)
│   │   ├── models/              # SQLAlchemy models
│   │   ├── api/routes/          # API endpoints
│   │   ├── modules/             # Module definitions
│   │   ├── templates/           # Project templates (JSON)
│   │   └── sections/            # Section definitions (JSON)
│   └── requirements.txt
│
├── packages/                      # Shared packages
│   ├── ui/                       # Shared React components
│   ├── sections/                # Shared section components
│   └── config/                  # Shared configurations
│
├── docs/                          # Documentation
│   ├── VISION.md
│   └── PROJECT_INSTRUCTIONS.md
│
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## Database Architecture

### Single Database: `platform_system`

### Core Tables:
```sql
tenants        -- Companies/Resellers
users          -- All users (super_admin, reseller, user)
projects       -- User projects (settings, modules_enabled, domain)
```

### Module Tables (with project_id):
```sql
ecommerce_products
ecommerce_categories
ecommerce_orders
cms_pages
blog_posts
crm_contacts
translations       -- Multilingual module
ai_changes         -- AI Brain module
```

**Every module table MUST have:**
- `project_id INT REFERENCES projects(id)` - For data isolation
- `created_at TIMESTAMP`
- `updated_at TIMESTAMP` (if mutable)

---

## Module System (MOST IMPORTANT!)

### Concept:
Modules are **plug-and-play** features that users enable per project. Each module:
1. Has predefined database tables
2. Has API routes
3. Has frontend components
4. Can be enabled/disabled anytime

### Available Modules:
- cms, blog, ecommerce, crm, hr
- multilingual, ai-brain, seo, forms, analytics
- email-marketing, payments, social-media

### Adding a New Module:

**1. Backend Model** (`backend/app/models/modules/my_module.py`):
```python
from sqlalchemy import Column, Integer, String, ForeignKey, Text
from app.models.base import Base

class MyModuleItem(Base):
    __tablename__ = "my_module_items"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    # ... other fields
```

**2. Backend Routes** (`backend/app/api/routes/modules/my_module.py`):
```python
from fastapi import APIRouter, Depends
from app.api.routes.crud import create_item, get_items

router = APIRouter(prefix="/my-module", tags=["my-module"])

@router.get("/")
async def list_items(project_id: int):
    return get_items("my_module_items", project_id)

@router.post("/")
async def create_item_route(data: dict, project_id: int):
    return create_item("my_module_items", data, project_id)
```

**3. Frontend Admin** (`apps/storefront/app/manage/my-module/page.tsx`):
```tsx
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MyModuleAdmin() {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    // Fetch items
    axios.get('/api/v1/my-module?project_id=123').then(res => setItems(res.data));
  }, []);
  
  return (
    <div>
      <h1>My Module Admin</h1>
      {/* List, Create, Edit items */}
    </div>
  );
}
```

**4. Register Module** (`backend/app/config/modules.json`):
```json
{
  "my-module": {
    "name": "My Module",
    "description": "Description of my module",
    "tables": ["my_module_items"],
    "routes": ["/my-module"],
    "admin_pages": ["/manage/my-module"]
  }
}
```

---

## Authentication Flow

### Login:
```
1. User submits email + password → POST /api/v1/auth/login
2. Backend validates with Argon2
3. Returns: {access_token, user: {id, email, role}, tenant: {id}}
4. Frontend saves:
   - localStorage.setItem('token', access_token)
   - localStorage.setItem('user', JSON.stringify({...user, tenant_id: tenant.id}))
5. All requests include: Authorization: Bearer {token}
```

### Protected Routes:
```python
from fastapi import Depends, HTTPException
from app.core.security import get_current_user

@router.get("/protected")
async def protected_route(current_user = Depends(get_current_user)):
    return {"user": current_user}
```

---

## API Conventions

### Endpoints:
- Base URL: `/api/v1/`
- Auth: `/api/v1/auth/login`, `/api/v1/auth/register`
- CRUD: `/api/v1/crud/{table}`
- Modules: `/api/v1/{module}/...`

### Request/Response:
```python
# Request
{
  "name": "Product Name",
  "price": 99.99,
  "project_id": 123  # Always include
}

# Success Response
{
  "id": 1,
  "name": "Product Name",
  "price": 99.99,
  "created_at": "2024-01-01T00:00:00Z"
}

# Error Response
{
  "detail": "Product not found"
}
```

---

## Frontend Conventions

### File Naming:
- Pages: `page.tsx` or `page.jsx`
- Components: `PascalCase.tsx` (e.g., `Button.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)

### Component Structure:
```tsx
'use client';  // If uses hooks/state
import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState(initial);
  
  const handleAction = () => {
    // Logic
  };
  
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
}
```

### Styling:
- **Only Tailwind CSS** - No CSS modules, no styled-components
- Responsive: `md:`, `lg:`, `xl:`
- Colors: Use `primary-*`, `secondary-*` from config

### State Management:
```tsx
// Use Zustand for global state
import create from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```

---

## Common Commands

### Development:
```bash
# Frontend (apps/admin)
cd /home/platform-v2/apps/admin
npm run dev        # Development server
npm run build      # Production build
npm run lint       # ESLint

# Backend
cd /home/platform-v2/backend
docker restart platform_backend_v2
docker logs platform_backend_v2 --tail 50

# Database
docker exec -it platform_postgres_v2 psql -U platform_user -d platform_system
```

### Deployment:
```bash
# Build all
cd /home/platform-v2
npm run build

# Restart services
docker-compose restart

# Check logs
docker-compose logs -f
```

---

## Troubleshooting

### Frontend not updating?
```bash
cd /home/platform-v2/apps/admin
rm -rf .next node_modules/.cache
npm run build
# Hard refresh: Ctrl+Shift+R
```

### Backend error?
```bash
docker logs platform_backend_v2 --tail 100
# Check Python errors, missing packages
```

### Database issue?
```bash
# Check connection
docker exec -it platform_postgres_v2 psql -U platform_user -d platform_system -c "SELECT 1"

# Check tables
docker exec -it platform_postgres_v2 psql -U platform_user -d platform_system -c "\dt"
```

---

## Testing Guidelines

### Before Committing:
1. ✅ Code builds without errors
2. ✅ All existing features still work
3. ✅ New feature tested manually
4. ✅ No console errors
5. ✅ Responsive on mobile

### Manual Testing Checklist:
- [ ] Login/logout works
- [ ] Project creation works
- [ ] Module enable/disable works
- [ ] CRUD operations work
- [ ] Multi-tenant isolation works (user A can't see user B's data)

---

## Git Workflow
```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "feat: add ecommerce module"

# Push
git push origin master
```

### Commit Message Format:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `docs:` Documentation
- `style:` Formatting
- `test:` Tests

---

## When User Asks for Help

1. **Read existing code** - Check current implementation
2. **Ask clarifying questions** - Understand requirements
3. **Propose solution** - Explain what you'll do
4. **Wait for confirmation** - Don't start without approval
5. **Make one change** - Test immediately
6. **Verify** - Ask for screenshot/confirmation
7. **Iterate** - Fix issues one at a time

---

## Important Notes

- **Current tenant_id:** 11 (main user: ceo@oawo.com)
- **Current user_id:** 5
- **Database:** platform_system
- **Ports:** Backend:8000, Postgres:5432, Redis:6379, Nginx:80/443

---

## Summary

This is a **modular, multi-tenant, AI-powered platform**. The magic is in the module system - users can enable/disable features without coding. When adding features, always use the module system. Configuration over coding!

**Golden Rule:** If it can be solved with configuration, don't write code.

---

Built with ❤️ for AI assistants to understand the platform better.
