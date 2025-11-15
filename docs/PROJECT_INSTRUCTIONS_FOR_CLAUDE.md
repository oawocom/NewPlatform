# Platform V2 - Instructions for Claude AI

## Quick Context
Platform V2 is a **multi-tenant SaaS platform** where users create unlimited projects with modular features (CMS, E-commerce, CRM, etc.). Think "WordPress + Shopify + Wix combined with AI assistance."

**Live:** https://account.buildown.design  
**Location:** /home/platform-v2/  
**Server:** Ubuntu 22.04 @ Hetzner (hel1-1)

---

## Critical Rules (READ FIRST!)

### DO's ✅
1. **Confirm before coding** - Ask clarifying questions, wait for approval
2. **Test immediately** - Verify every change works
3. **Step-by-step** - One change at a time, test, then next
4. **Read existing code** - Check GitHub/local files before suggesting
5. **Use universal systems** - Leverage module architecture, don't hardcode

### DON'Ts ❌
1. **Don't modify core structure** - Module system, auth, database core
2. **Don't start coding** - without 100% understanding of task
3. **Don't create duplicate code** - DRY principle
4. **Don't hardcode** - Use configuration over code
5. **Don't waste attempts** - User preference: confirm first!

---

## Tech Stack (MUST USE)

### Frontend
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS (NO other CSS frameworks)
- Zustand (state management)
- React Hook Form + Zod (forms/validation)
- Axios (API calls)

### Backend
- FastAPI (Python 3.11+)
- PostgreSQL (single database, multi-tenant)
- SQLAlchemy + Alembic (ORM, migrations)
- JWT + Argon2 (auth)
- Redis + Celery (cache, background jobs)

### AI Integration
- Anthropic Claude API
- OpenAI GPT API
- User provides own API keys

---

## Architecture Overview

### Database: Single DB, Multi-Tenant
```sql
-- Every module table has project_id
CREATE TABLE ecommerce_products (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id),  -- Isolation!
    name VARCHAR(255),
    price DECIMAL
);
```

### Module System (CORE CONCEPT!)
Modules are plug-and-play features:
```
User creates project → Selects modules → Tables created → Features enabled
```

**Available Modules:**
- CMS, Blog, E-commerce, CRM, HR
- Multilingual, AI Brain, SEO, Forms, Analytics

**Each module has:**
- Database models in `backend/app/models/modules/`
- API routes in `backend/app/api/routes/modules/`
- Frontend components
- JSON definitions in `backend/app/modules/`

### Domains
```
Subdomain: shop.buildown.design (auto)
Admin: shop.buildown.design/manage
Custom domain: mystore.com (user can add)
```

---

## Folder Structure
```
/home/platform-v2/
├── apps/
│   └── admin/           # Platform admin panel ✅ WORKING
│
├── backend/
│   └── app/
│       ├── core/        # Auth, database, config
│       ├── models/      # Core + module models
│       ├── api/routes/  # Core + module routes
│       ├── modules/     # Module definitions (JSON)
│       ├── templates/   # Project templates (JSON)
│       └── sections/    # Section definitions (JSON)
│
├── packages/
│   ├── ui/             # Shared React components
│   ├── sections/       # Section components
│   └── config/         # Shared configs
│
└── docs/
    ├── VISION.md
    ├── PROJECT_INSTRUCTIONS.md
    └── NEXT_STEPS.md
```

---

## Current Status ✅

**Working:**
- Login/Register/Forgot Password
- Admin panel with sidebar
- Projects CRUD
- Users CRUD
- Multi-tenant isolation
- Animated homepage
- Module showcase

**Not Yet Built:**
- Storefront app (apps/storefront/)
- Actual modules (CMS, E-commerce, etc.)
- AI Brain
- Multilingual
- SEO tools

---

## Common Commands
```bash
# Frontend build
cd /home/platform-v2/apps/admin
npm run build

# Backend restart
docker restart platform_backend_v2
docker logs platform_backend_v2 --tail 50

# Full build
cd /home/platform-v2
npm run build

# Database
docker exec -it platform_postgres_v2 psql -U platform_user -d platform_system
```

---

## API Conventions

### Endpoints
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
GET    /api/v1/crud/{table}?project_id=123
POST   /api/v1/crud/{table}
PUT    /api/v1/crud/{table}/{id}
DELETE /api/v1/crud/{table}/{id}
```

### Authentication
```python
from app.core.security import get_current_user
from fastapi import Depends

@router.get("/protected")
async def route(current_user = Depends(get_current_user)):
    return {"user": current_user}
```

---

## Adding a New Module (Example)

### 1. Backend Model
```python
# backend/app/models/modules/cms.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.models.base import Base

class CMSPage(Base):
    __tablename__ = "cms_pages"
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))  # MUST HAVE!
    title = Column(String(255))
    slug = Column(String(255))
    content = Column(Text)
```

### 2. Backend Routes
```python
# backend/app/api/routes/modules/cms.py
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/cms", tags=["cms"])

@router.get("/pages")
async def list_pages(project_id: int):
    # Use universal CRUD or custom logic
    pass
```

### 3. Register Module
```json
// backend/app/modules/cms.json
{
  "id": "cms",
  "name": "CMS",
  "description": "Content Management System",
  "tables": ["cms_pages", "cms_blocks"],
  "routes": ["/cms"],
  "admin_pages": ["/manage/pages"]
}
```

---

## User Preferences (IMPORTANT!)

The user has specific preferences:

1. **No wasted attempts** - Always confirm 100% before coding
2. **Focus communication** - No long docs, get to the point
3. **Step-by-step** - One change → test → next (not multiple steps at once)
4. **Read from GitHub** - Don't ask user to share code

---

## Git Workflow
```bash
git status
git add .
git commit -m "feat: description"
git push origin master
```

**Commit prefixes:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `docs:` Documentation
- `chore:` Maintenance

---

## When User Asks for Help

1. ✅ Read existing code first
2. ✅ Ask clarifying questions
3. ✅ Propose solution clearly
4. ✅ **Wait for confirmation**
5. ✅ Make ONE change
6. ✅ Ask user to test
7. ✅ Iterate if needed

**Never start coding without 100% clarity and user approval!**

---

## Important Notes

- **Current tenant_id:** 11 (main user)
- **Current user_id:** 5
- **Database:** platform_system
- **Every table MUST have project_id** for isolation

---

## Next Phase: Module Implementation

Read `/home/platform-v2/docs/NEXT_STEPS.md` for:
- 16-week roadmap
- Module implementation order
- Success metrics
- Development workflow

---

## Vision Statement

> "Democratize digital product creation by combining modular architecture with AI assistance, enabling anyone to build professional-grade websites and business tools without coding."

---

## Summary

This is a **modular, multi-tenant, AI-powered platform**. The magic is in the module system - users enable/disable features without coding.

**Golden Rule:** Configuration over coding. If it can be solved with config, don't write code.

---

**Always remember:**
1. Confirm before coding
2. Test immediately
3. Step-by-step approach
4. Read existing code first
5. Follow user's preferences

Built with ❤️ for efficient AI-assisted development.
