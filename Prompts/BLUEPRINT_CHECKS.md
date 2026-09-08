# NEPSE Insight — Full-Stack Project Blueprint & Prompt Sheet

### Next.js + FastAPI + Supabase — Production Deployment Ready

> **Version:** 1.1
> **Document snapshot:** Practices are maintained over time — dependency numbers in this file are **not** authoritative.
> **Audience:** Solo developer (Samyog), AI coding assistants (Claude Code, Cursor, Copilot), future team contributors
> **Purpose:** Copy-paste prompts, security checklists, per-module code patterns, folder structure, and API documentation standards to build NEPSE Insight from zero to a production-deployed web app — free-tier stack, zero known high/critical vulnerabilities.
> **Provenance:** This blueprint was originally formalized from `prd.md` (v1.0, 26 Aug 2026) and `trd.md` (v2). Those two files have since been removed/consolidated — this document is now the single, self-contained source of truth for implementation (schemas, endpoints, business rules, and security checklists are all inlined below with `PRD §x` / `TRD §x` citations kept only as historical traceability markers, not as pointers to files that still need to exist). Do not re-create `prd.md`/`trd.md` unless the person explicitly asks for them back.
> **Mobile note:** Capacitor conversion is a **final-stage, one-time step** — see §16. Build and ship the web app first; §16 exists so that step doesn't require a rewrite when you get there, not so you build both in parallel now.

---

## ⚠️ Version Safety Rule (Read First)

> **Never copy version numbers from this document (or from memory) into `package.json` or `pyproject.toml`/`requirements.txt`.** Old pins stay vulnerable; docs go stale the day they ship.

### For humans

1. Open [npmjs.com](https://www.npmjs.com/) or [pypi.org](https://pypi.org/) for each package — confirm **latest** and read the **Security**/advisory links if shown.
2. Prefer the **newest patched release** on a supported major line — not an old pin "because a tutorial said so."
3. After install: `npm audit` (frontend) and `pip-audit` (backend) — fix **high/critical** before shipping.

```bash
npm show <package-name> version          # latest published (frontend)
npm audit                                # installed tree (frontend)
pip index versions <package-name>        # latest published (backend)
pip-audit                                # installed tree (backend)
```

### For AI assistants (mandatory)

Before you write or edit `package.json`, `requirements.txt`/`pyproject.toml`, or recommend install commands:

1. **Web search** for each non-trivial dependency — `"npm <package> latest version"`, `"<package> npm security advisory"` or `"<package> CVE"`; for Python, `"pypi <package> latest version"` / `"<package> CVE"`. For Node.js itself, search `"Node.js LTS current release"` and align with **Active LTS**.
2. Cross-check with `npm show <package> version` / `pip index versions <package>` in the terminal when the environment allows.
3. If search turns up an **unpatched CVE** on `latest`, search again for the **patched version** or a mitigation (or choose an alternative package). This applies with extra weight to `litellm` (see §11b — a real supply-chain compromise happened on specific pinned versions in March 2026; always resolve to current patched).
4. In your reply, briefly state what you verified — do not silently invent versions.
5. Use `^` ranges in `package.json` and unpinned/`>=` ranges with a lockfile in Python unless you have a documented reason to pin exact — then pin to a verified good release.

**No hardcoded version table below — names to verify only.**

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Repository Structure](#2-repository-structure)
3. [Environment Variables](#3-environment-variables)
4. [Backend Architecture (FastAPI)](#4-backend-architecture-fastapi)
5. [Domain Module Reference — Backend](#5-domain-module-reference--backend)
6. [API Documentation Standard](#6-api-documentation-standard)
7. [Backend Security Checklist](#7-backend-security-checklist)
8. [Frontend Architecture (Next.js)](#8-frontend-architecture-nextjs)
9. [Domain Module Reference — Frontend](#9-domain-module-reference--frontend)
10. [Frontend Security Checklist](#10-frontend-security-checklist)
11. [AI Subsystem — Outlook Model & RAG Explainer](#11-ai-subsystem--outlook-model--rag-explainer)
12. [Bilingual (Nepali/English) Architecture](#12-bilingual-nepaliengish-architecture)
13. [Scraping Pipeline Hardening](#13-scraping-pipeline-hardening)
14. [Postman & Testing Guide](#14-postman--testing-guide)
15. [AI Workflow, CI & Git Hygiene](#15-ai-workflow-ci--git-hygiene)
16. [Capacitor Mobile Conversion — Final Stage Only](#16-capacitor-mobile-conversion--final-stage-only)
17. [Master Prompts](#17-master-prompts)
18. [Pre-Launch Production Checklist](#18-pre-launch-production-checklist)
19. [Document Maintenance](#19-document-maintenance)

---

## 1. Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| **Frontend** | Next.js (App Router) | SSR/SSG for public stock/news pages during web development. No mobile-specific constraints apply until §16. |
| **UI** | shadcn/ui + Tailwind | Treated as unstyled primitives, own token system on top (TRD §2 — must not look vibe-coded) |
| **Backend** | FastAPI (Python) | Owns data pipeline, AI inference, business logic, auth verification |
| **Database** | Supabase (Postgres + `pgvector`) | Relational core + JSONB for news/IPO fields + vector store for RAG |
| **Auth** | Supabase Auth (email/mobile/Google) | JWT issued by Supabase, verified in FastAPI — do not build a parallel auth system |
| **Charts** | TradingView Lightweight Charts | Per PRD §5.2 — verify latest license terms before commercial use |
| **State/data fetching** | TanStack Query | Caching, retries, background refetch for live market data |
| **Forms** | React Hook Form + Zod | Validated forms client-side, mirrored server-side by Pydantic |
| **HTML sanitize** | DOMPurify | Any AI-generated or scraped HTML rendered client-side must pass through this |
| **Hosting: Frontend** | Vercel | Free tier |
| **Hosting: Backend** | Render or Fly.io | Free tier; cold-starts after idle — design loading states for it (TRD §1) |
| **Hosting: DB** | Supabase | Free tier pauses after inactivity — weekly keep-alive cron (§15) |
| **Jobs** | GitHub Actions scheduled workflows | Scraping, indicator calc, keep-alive ping — no always-on server needed |
| **Admin panel** | Next.js (`/admin` route) | Integrated internal-only route inside frontend app |
| **Monitoring** | Sentry (frontend + backend SDKs) | Error tracking |
| **AI serving** | LiteLLM in-process | Unified interface over Gemini/Groq/NIM/OpenRouter free tiers — pin to a current patched version, never an old requirements file |
| **Mobile (final stage only)** | Capacitor | Not part of the day-to-day stack — wraps the finished web build once, at the end. See §16. |

**Token lifetime standard (verify against current Supabase docs before launch):**

- Access JWT: short-lived, sent in `Authorization: Bearer` header, refreshed silently by the Supabase client SDK.
- Refresh token: managed by the Supabase client SDK; storage posture is discussed in §10.

---

## 2. Repository Structure

```
NepseInsight/
├── frontend/                         # Next.js app (App Router) — unified investor & admin portal
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/             # /ne and /en routes — see §12
│   │   │   │   ├── (dashboard)/
│   │   │   │   ├── stocks/[symbol]/
│   │   │   │   ├── ipo/
│   │   │   │   ├── news/
│   │   │   │   ├── portfolio/
│   │   │   │   ├── journal/
│   │   │   │   ├── floorsheet/
│   │   │   │   ├── ai/
│   │   │   │   └── admin/            # Integrated internal system control route
│   │   │   ├── api/                  # Thin proxy routes only — never business logic
│   │   │   └── layout.tsx
│   │   ├── lib/
│   │   │   ├── env.ts                # Zod-validated NEXT_PUBLIC_* env
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts         # Browser client (anon key only)
│   │   │   │   └── server.ts         # Server client (server-side only, never bundled)
│   │   │   └── api/
│   │   │       └── client.ts         # Fetch wrapper → FastAPI, attaches Supabase JWT
│   │   ├── components/
│   │   │   ├── RequireAuth.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── DataFreshnessBadge.tsx
│   │   │   └── ui/                   # shadcn primitives, themed per §2 design direction
│   │   └── features/                 # One folder per domain area — see §9
│   │       ├── dashboard/
│   │       ├── stock-detail/
│   │       ├── technical-analysis/
│   │       ├── ipo-center/
│   │       ├── news/
│   │       ├── portfolio/
│   │       ├── journal/
│   │       ├── floorsheet/
│   │       └── ai-outlook/
│   ├── public/
│   ├── .env.example
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI entry — middleware stack + router mounts
│   │   ├── core/
│   │   │   ├── config.py             # Pydantic Settings — crash on startup if misconfigured
│   │   │   ├── security.py           # Supabase JWT verification
│   │   │   └── logging.py            # Structured logging, PII redaction
│   │   ├── middleware/
│   │   │   ├── auth.py               # Dependency: verify JWT → attach request.state.user
│   │   │   ├── rate_limit.py
│   │   │   └── error_handler.py      # Central exception → standard JSON response
│   │   ├── modules/                  # One folder per domain resource — see §5
│   │   │   ├── market/
│   │   │   ├── stocks/
│   │   │   ├── technicals/
│   │   │   ├── ipo/
│   │   │   ├── news/
│   │   │   ├── portfolio/
│   │   │   ├── journal/
│   │   │   ├── floorsheet/
│   │   │   └── ai/
│   │   │       ├── outlook/          # §11a — self-trained tabular model
│   │   │       └── explainer/        # §11b — RAG + LiteLLM routing
│   │   ├── services/
│   │   │   └── market_data/          # Provider abstraction — see §13.1. Modules call ONLY this.
│   │   │       ├── base.py           # MarketDataProvider ABC + shared Pydantic types
│   │   │       ├── scraper_provider.py     # Wraps pipeline/scrapers — today's default
│   │   │       ├── nepse_api_provider.py   # Stub until official API access is granted
│   │   │       └── factory.py        # Reads MARKET_DATA_PROVIDER env, returns the active provider
│   │   ├── pipeline/                 # Scraping + normalization — see §13.2
│   │   │   ├── scrapers/
│   │   │   ├── validation.py
│   │   │   └── audit_log.py
│   │   ├── models/                   # Trained artifacts (small .joblib/.onnx only)
│   │   └── utils/
│   │       └── ownership_check.py
│   ├── scripts/
│   │   └── train_outlook_model.py    # Run on Colab/Kaggle, exported artifact committed here
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_market.py
│   │   ├── test_portfolio.py
│   │   ├── test_rls.py               # Cross-user access must fail — see §14
│   │   └── test_ai_outlook.py
│   ├── .env.example
│   ├── requirements.txt / pyproject.toml
│   └── pytest.ini
│
├── .github/
│   └── workflows/
│       ├── scrape-market-data.yml
│       ├── scrape-news-ipo.yml
│       ├── supabase-keepalive.yml
│       └── ci.yml                    # lint, type-check, test, npm audit, pip-audit
│
├── postman/
│   ├── nepse-insight.postman_collection.json
│   └── nepse-insight.postman_environment.json
│
└── docs/
    ├── PROJECT_BLUEPRINT.md          # This file
    └── DATA_PIPELINE.md
```

**Rules — never break these:**

- Never commit `.env`, `node_modules/`, `__pycache__/`, `dist/`, `.next/`, or trained model weights above a few MB.
- Always commit `.env.example` with placeholder values and comments, for **every** app in `frontend/` and for `backend/`.
- One source of truth for env validation: `frontend/web/src/lib/env.ts` (frontend), `backend/app/core/config.py` (backend).
- Backend: type hints everywhere, `mypy`/`pyright` clean. Frontend: TypeScript strict mode always on.
- No `android/` or `ios/` directories exist in this repository until §16 is actually reached. Don't scaffold them early — an unmaintained native project drifting from the web build is worse than not having one yet.

### `.gitignore` — dependencies, env files, secrets, build output

```gitignore
# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/

# Environment & secrets — NEVER commit (only .env.example is allowed)
.env
.env.*
!.env.example

# Private keys and common secret filenames
*.pem
*.key
id_rsa
id_ed25519
*.p12
*.pfx
service-account*.json

# Build output
dist/
build/
out/
.next/
*.tsbuildinfo

# Trained model artifacts above a few MB — store on Hugging Face Hub, not git
*.bin
*.safetensors
*.gguf

# Logs & coverage
*.log
coverage/
.pytest_cache/
.nyc_output/

# OS / editor noise
.DS_Store
Thumbs.db

# Native mobile projects — only appear once §16 is actually executed
android/
ios/
```

**Verify before first push:** `git status` must never list `.env`, `node_modules/`, or `.venv/`. Use `git check-ignore -v <path>` if unsure.

---

## 3. Environment Variables

### `backend/.env.example`

```env
# ── Server ──────────────────────────────────────────────────────────────
ENVIRONMENT=development
PORT=8000

# ── Supabase ────────────────────────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace_with_service_role_key   # server-side ONLY — never sent to frontend
SUPABASE_JWT_SECRET=replace_with_jwt_secret                # used to verify incoming Supabase JWTs

# ── CORS (comma-separated) ─────────────────────────────────────────────
CORS_ORIGINS=http://localhost:3000

# ── AI providers (free tiers — see §11b) ─────────────────────────────
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
NVIDIA_NIM_API_KEY=your_nim_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# ── Market Data Provider (§13.1) ───────────────────────────────────────
MARKET_DATA_PROVIDER=scraper               # scraper | nepse_api — swap this, not the code, when API access is granted
NEPSE_API_KEY=                             # leave blank until official access is granted; unused while provider=scraper
NEPSE_API_BASE_URL=                        # leave blank until official access is granted

# ── Scraping ────────────────────────────────────────────────────────────
TELEGRAM_BOT_TOKEN=your_bot_token          # scrape-failure alerts, per §13.2
TELEGRAM_CHAT_ID=your_chat_id

# ── Monitoring ──────────────────────────────────────────────────────────
SENTRY_DSN=https://your_sentry_dsn_here
```

### `frontend/.env.example`

```env
# ── Supabase (public — anon key only, RLS enforces real access control) ──
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# ── Backend API ─────────────────────────────────────────────────────────
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

> **Never put `SUPABASE_SERVICE_ROLE_KEY` in any `NEXT_PUBLIC_*` variable.** The service role key bypasses Row Level Security entirely. It belongs only in `backend/.env`, never in anything that ships to a browser.
>
> **A `NEXT_PUBLIC_IS_CAPACITOR_BUILD` flag and any Capacitor-specific env values are intentionally absent from this file.** They get added in §16, at the point you actually run the conversion — not now.

### Env Validation Pattern (Backend — Pydantic Settings)

```python
# backend/app/core/config.py
from pydantic import Field, AnyHttpUrl
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    environment: str = Field(pattern="^(development|production|test)$")
    port: int = 8000
    supabase_url: AnyHttpUrl
    supabase_service_role_key: str = Field(min_length=32)
    supabase_jwt_secret: str = Field(min_length=32)
    cors_origins: str
    gemini_api_key: str | None = None
    groq_api_key: str | None = None
    nvidia_nim_api_key: str | None = None
    openrouter_api_key: str | None = None
    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None
    sentry_dsn: str | None = None

    class Config:
        env_file = ".env"

try:
    settings = Settings()
except Exception as e:
    # Crash immediately — never run with bad config
    raise SystemExit(f"Invalid environment variables: {e}")
```

### Env Validation Pattern (Frontend — Zod)

```typescript
// frontend/web/src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
```

---

## 4. Backend Architecture (FastAPI)

### Middleware Stack Order (`main.py`)

Every request passes through this chain in order. Order matters.

```python
# backend/app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import sentry_sdk

# 1. Sentry (must be initialized before app creation)
sentry_sdk.init(dsn=settings.sentry_dsn, environment=settings.environment, traces_sample_rate=0.1)

app = FastAPI(title="NEPSE Insight API", version="1.0.0")

# 2. CORS — explicit origin allowlist only, never "*" with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
)

# 3. Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 4. Request body size — enforce at reverse-proxy/hosting layer too, not only in app code

# 5. Health checks — mounted before routers, excluded from strict rate limits
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
async def ready():
    try:
        await supabase_ping()
        return {"status": "ready"}
    except Exception:
        return JSONResponse(status_code=503, content={"status": "not_ready"})

# 6. Routers — versioned prefix, one include_router per module in app/modules/
app.include_router(market_router, prefix="/api/v1/market", tags=["market"])
app.include_router(stocks_router, prefix="/api/v1/stocks", tags=["stocks"])
app.include_router(technicals_router, prefix="/api/v1/technicals", tags=["technicals"])
app.include_router(ipo_router, prefix="/api/v1/ipo", tags=["ipo"])
app.include_router(news_router, prefix="/api/v1/news", tags=["news"])
app.include_router(portfolio_router, prefix="/api/v1/portfolio", tags=["portfolio"])
app.include_router(journal_router, prefix="/api/v1/journal", tags=["journal"])
app.include_router(floorsheet_router, prefix="/api/v1/floorsheet", tags=["floorsheet"])
app.include_router(ai_outlook_router, prefix="/api/v1/ai/outlook", tags=["ai"])
app.include_router(ai_explainer_router, prefix="/api/v1/ai/explainer", tags=["ai"])

# 7. Central exception handler — always last to register, first to catch
app.add_exception_handler(Exception, global_exception_handler)
```

### Auth Dependency (verifies Supabase JWT — does not re-implement auth)

```python
# backend/app/middleware/auth.py
from fastapi import Header, HTTPException
import jwt

def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, detail={"code": "UNAUTHORIZED", "message": "No token provided"})
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(
            token, settings.supabase_jwt_secret, algorithms=["HS256"], audience="authenticated"
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, detail={"code": "TOKEN_EXPIRED", "message": "Access token expired"})
    except jwt.InvalidTokenError:
        raise HTTPException(401, detail={"code": "TOKEN_INVALID", "message": "Invalid token"})
    return {"id": payload["sub"], "email": payload.get("email")}
```

### Standard Error Response Shape

All errors across the entire API must follow this shape. Define it once, use it everywhere.

```python
# backend/app/middleware/error_handler.py
from fastapi import Request
from fastapi.responses import JSONResponse

async def global_exception_handler(request: Request, exc: Exception):
    status_code = getattr(exc, "status_code", 500)
    code = getattr(exc, "code", "INTERNAL_ERROR")
    message = str(exc) if status_code < 500 else "Internal server error"
    if status_code >= 500:
        sentry_sdk.capture_exception(exc)
    return JSONResponse(
        status_code=status_code,
        content={"success": False, "error": {"code": code, "message": message}},
    )
```

```json
// Success shape
{ "success": true, "data": { "...": "..." } }

// Paginated success shape
{
  "success": true,
  "data": [ ... ],
  "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

### Ownership Check — mandatory in every controller touching a resource by ID

```python
# backend/app/utils/ownership_check.py
from fastapi import HTTPException

async def assert_ownership(table: str, resource_id: str, user_id: str, db):
    row = (
        await db.table(table)
        .select("*")
        .eq("id", resource_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if row.data is None:
        # Always 404, never 403 — don't confirm the resource exists to a non-owner
        raise HTTPException(404, detail={"code": "NOT_FOUND", "message": "Resource not found"})
    return row.data
```

> **Supabase Row Level Security (RLS) is the primary control, not a nice-to-have.** Every table that holds user data (`portfolio_transactions`, `journal_entries`, `watchlists`, `alerts`) must have RLS policies restricting rows to `auth.uid() = user_id`. The FastAPI-level ownership check above is defense-in-depth — a service-role key call from the backend bypasses RLS entirely, so this application-level check is what actually protects those routes when the backend itself is the one querying.

### Reference RLS Policy (apply this shape to every user-data table)

```sql
alter table portfolio_transactions enable row level security;

create policy "Users can view own transactions"
  on portfolio_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on portfolio_transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on portfolio_transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on portfolio_transactions for delete
  using (auth.uid() = user_id);
```

Repeat this exact four-policy pattern for `journal_entries`, `watchlists`, `alerts`, and any future user-owned table. Market data, news, and IPO tables are public-read and should instead have a single permissive `select` policy with writes restricted to a service role.

---

## 5. Domain Module Reference — Backend

One subsection per PRD module (§5 of the PRD). Each gets its own FastAPI router, Pydantic schemas, and Supabase table(s). Build in this order — later modules depend on earlier ones being stable.

### 5.1 `market` — Market Dashboard (PRD §5.1)

- **Tables:** `market_snapshot` (index/turnover/breadth, one row per session), `sector_performance`.
- **Key response field:** every payload includes `data_status: live|delayed|eod` and `last_updated` — non-nullable at the schema level.
- **Endpoints:** `GET /market/dashboard`, `GET /market/sectors`, `GET /market/top-movers`.
- **Business rule:** if the latest scrape is older than the freshness threshold for the current session state (market open/closed), respond with `STALE_DATA` rather than serving old numbers silently (PRD §13 acceptance criteria).

### 5.2 `stocks` — Stock Detail Page (PRD §5.2)

- **Tables:** `stocks` (static reference data), `stock_prices` (time series — TimescaleDB-style partitioning if volume grows), `stock_news_link`.
- **Endpoints:** `GET /stocks/{symbol}`, `GET /stocks/{symbol}/history?timeframe=`, `GET /stocks/{symbol}/compare?against=sector|index`.
- **Business rule:** historical chart timeframes are a fixed enum server-side (`1D|1W|1M|3M|1Y|ALL`) — never accept an arbitrary date range unvalidated, to bound query cost.

### 5.3 `technicals` — Technical Analysis (PRD §5.3)

- **Computation:** SMA/EMA/RSI/MACD/Bollinger Bands computed server-side on schedule (GitHub Actions, §13) and cached — never recomputed per request.
- **Endpoints:** `GET /technicals/{symbol}?indicator=rsi&timeframe=1D`.
- **Business rule:** every signal response includes indicator, timeframe, age (time since computed), reason, invalidation condition, and a risk warning string — enforced via a shared Pydantic response model (PRD §5.3 explicit requirement).

```python
# backend/app/modules/technicals/technicals.schema.py
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class Timeframe(str, Enum):
    d1 = "1D"; w1 = "1W"; m1 = "1M"; m3 = "3M"; y1 = "1Y"; all = "ALL"

class TechnicalSignal(BaseModel):
    indicator: str
    timeframe: Timeframe
    value: float
    computed_at: datetime
    reason: str
    invalidation: str
    risk_warning: str = "Educational technical output; not a guaranteed forecast."
```

### 5.4 `ipo` — IPO Center (PRD §5.4)

- **Tables:** `ipo_listings` (pipeline/approval status through listing), sourced from SEBON/NEPSE-linked scrapers (§13).
- **Endpoints:** `GET /ipo`, `GET /ipo/{id}`, `GET /ipo/{id}/subscribe-info`.
- **Business rule:** every IPO entry links back to its official source (SEBON/NEPSE or a verified primary source) — a `source_url` field is required, not optional, and populated at scrape time (PRD §5.4).

### 5.5 `news` — News and Announcements (PRD §5.5)

- **Tables:** `news_items` (headline, source, timestamp, category, related symbols, original link, AI summary, importance, correction history as a JSONB array).
- **Endpoints:** `GET /news?category=&symbol=`, `POST /news/{id}/subscribe` (alert subscription, auth required).
- **Business rule:** correction history is append-only — a correction never overwrites the original entry, it adds a record to the JSONB array, so users who already read the original can see what changed (transparency requirement implicit in PRD §5.5's "correction history" field).

### 5.6 `portfolio` — Portfolio Tracker (PRD §7.3)

- **Tables:** `portfolio_transactions` (RLS-protected, per §4), computed views for realized/unrealized P&L.
- **Endpoints:** `GET /portfolio`, `POST /portfolio/transactions`, `POST /portfolio/import` (CSV/Excel), `GET /portfolio/export`.
- **Business rule:** CSV import is parsed server-side with strict column validation and a row cap — reject the whole file with a clear error rather than partially importing malformed rows silently.
- **Hard boundary:** no field in this module ever stores a broker username, password, or OTP (PRD non-goal, §3 and §8) — this is enforced by the schema simply never having those columns, not by a runtime check.

### 5.7 `journal` — Trading Journal & Paper Trading (PRD §7.4)

- **Tables:** `journal_entries` (RLS-protected), `paper_trading_accounts`, `paper_trading_positions`.
- **Endpoints:** `POST /journal/entries`, `GET /journal/entries`, `POST /journal/paper-trade`.
- **Business rule:** paper trading uses simulated fees matching real NEPSE commission structure so performance comparisons against the AI outlook (PRD §7.4) are meaningful, not just directionally correct.

### 5.8 `floorsheet` — Floorsheet Analyzer (PRD §7.5)

- **Tables:** `floorsheet_transactions` (raw scraped), `floorsheet_daily_summary` (aggregated).
- **Endpoints:** `GET /floorsheet/{symbol}/summary`, `GET /floorsheet/{symbol}/large-transactions`, `GET /floorsheet/{symbol}/export`.
- **Business rule:** all response text uses neutral wording — no field or label implies manipulation from observed concentration data (PRD §7.5 explicit requirement). This is a copy/wording review item as much as a code item — check API response `message`/label strings, not just the frontend.

### 5.9 `ai/outlook` and `ai/explainer` — see §11 (dedicated section, since these have the most security-relevant detail).

---

## 6. API Documentation Standard

Every endpoint in the project must be documented in this format before it's considered done.

### Template (copy for each endpoint)

```
### METHOD /api/v1/<resource>/<action>

**Description:** One sentence.
**Auth required:** Yes / No
**Data freshness label required:** Yes (if this returns price/market data — PRD §5.1, §13)

#### Request
Headers:
  Authorization: Bearer <supabaseAccessToken>   (if auth required)

Query params:
  ?page=1&limit=20
  ?locale=ne|en

Body:
  { "field": "value" }   // Required. Description.

#### Response — 200 OK
  {
    "success": true,
    "data": {
      "...": "...",
      "data_status": "live|delayed|eod",
      "last_updated": "2026-08-28T10:15:00Z"
    }
  }

#### Response — 400/401/403/404/429 — use codes from the master reference below

#### Postman example
  Method: GET
  URL: {{baseUrl}}/api/v1/<resource>
  Tests: pm.test("Status 200", () => pm.response.to.have.status(200));

#### Business rules
  - Never fabricate a value not present in source data (PRD §6.1) — if unavailable, return null with a reason code, not an invented number.
```

### Worked Example — Stock Detail Endpoint

```
### GET /api/v1/stocks/{symbol}

**Description:** Returns current price, key stats, and a data-freshness label for one stock.
**Auth required:** No (public dashboard data)

#### Request
Path params:
  symbol — NEPSE ticker symbol, e.g. NABIL

#### Response — 200 OK
  {
    "success": true,
    "data": {
      "symbol": "NABIL",
      "price": 845.5,
      "change_pct": 1.2,
      "volume": 154200,
      "turnover": 130432100,
      "market_cap": 92100000000,
      "week52_high": 920.0,
      "week52_low": 680.0,
      "trading_status": "active",
      "data_status": "delayed",
      "last_updated": "2026-08-28T09:45:00Z"
    }
  }

#### Response — 404 Not Found
  { "success": false, "error": { "code": "NOT_FOUND", "message": "Symbol not found" } }

#### Business rules
  - trading_status reflects actual exchange state (active/halted/suspended) — never inferred from price movement alone.
```

### Error Codes Master Reference

| HTTP | Code | When to use |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Pydantic/Zod validation failed |
| 400 | `STALE_DATA` | Source data older than the freshness threshold (PRD §13) |
| 401 | `UNAUTHORIZED` | No token provided |
| 401 | `TOKEN_EXPIRED` | Access token expired — client refreshes via Supabase SDK |
| 401 | `TOKEN_INVALID` | Token tampered or wrong secret |
| 403 | `FORBIDDEN` | Authenticated but insufficient permission |
| 404 | `NOT_FOUND` | Resource not found or not owned by this user |
| 409 | `CONFLICT` | Duplicate resource |
| 422 | `AI_LOW_CONFIDENCE` | AI outlook confidence below display threshold — client must show the low-confidence label, not suppress the response |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests, or an upstream free-tier AI provider quota was hit |
| 500 | `INTERNAL_ERROR` | Unhandled — check Sentry |
| 503 | `DATA_SOURCE_UNAVAILABLE` | Scraper pipeline is down/stale — never silently serve fabricated data |

---

## 7. Backend Security Checklist

Run through this before every production deployment. Target: **zero high/critical findings.**

### Environment & Configuration
- [ ] All secrets in `.env` — zero secrets hardcoded in source
- [ ] `.env` and all `.env.*` in `.gitignore`; only `.env.example` committed
- [ ] Env validated with Pydantic Settings at startup — app crashes on bad config
- [ ] `SUPABASE_SERVICE_ROLE_KEY` used only in backend, never referenced anywhere in `frontend/web`
- [ ] Supabase connection uses RLS-protected tables; service role key calls are the exception, not the default, and are scoped tightly per-query

### Authentication & Authorization
- [ ] JWTs verified against the Supabase secret on every protected route
- [ ] RLS policies exist on every table holding user-specific data — tested with a second test user account, not just the owner (§14)
- [ ] `assert_ownership()` used before any read/write to a resource by ID — no IDOR
- [ ] Admin panel has its own stricter auth check — a compromised public-app token must not grant admin-panel access

### API Security
- [ ] CORS configured with an explicit origin allowlist — never `*` with credentials
- [ ] Rate limiting on all routes; stricter limits on auth and AI-explainer routes (protects both abuse and your free-tier AI quota)
- [ ] Request body size capped
- [ ] Input validation (Pydantic) on every route accepting body/query/params
- [ ] All Supabase queries filter by `user_id` even when RLS is present — belt and suspenders
- [ ] Public/no-auth endpoints (market dashboard, news feed) rate-limited separately from authenticated ones

### AI-Specific Security
- [ ] AI explainer never accepts free-text that gets concatenated unsanitized into the system prompt sent to Gemini/Groq/etc. — prompt-injection risk from scraped news/report content flowing into RAG context
- [ ] RAG-retrieved document content is treated as untrusted input: never let retrieved text override the system prompt's instructions
- [ ] AI outlook responses are never returned without their required fields (timeframe, confidence, factors, warning) — enforced in the response schema, not just the prompt
- [ ] Every AI signal (right and wrong) is logged to a `signals` table before being shown to a user
- [ ] LiteLLM pinned to a current patched version (≥1.83.0 per the March 2026 advisory — verify against current advisories, don't trust that number blindly by the time you read this)

### Data & Privacy
- [ ] No broker credentials are ever accepted, stored, or logged anywhere in the stack (PRD §8 — hard boundary, enforced at the schema level per §5.6)
- [ ] `DELETE /users/me` requires confirmation and cascades correctly through portfolio/journal data
- [ ] Data export endpoint exists for user-owned data
- [ ] Scraped raw payloads and normalized data stored in separate tables so a parsing bug never destroys the reprocessable source

### Infrastructure
- [ ] `GET /health` and `GET /ready` implemented, excluded from aggressive rate limits
- [ ] Structured logging in production — no tokens, API keys, or raw PII in logs
- [ ] Sentry configured with `before_send` scrubbing for sensitive fields
- [ ] `pip-audit` and `npm audit` both clean (zero high/critical) before every deploy
- [ ] HTTPS enforced everywhere in production — no HTTP origin accepted
- [ ] GitHub Actions secrets (Telegram token, AI API keys) stored as repo/environment secrets, never in workflow YAML

---

## 8. Frontend Architecture (Next.js)

### API Client (attaches Supabase session token to every FastAPI call)

```typescript
// frontend/web/src/lib/api/client.ts
import { createClient } from '@/lib/supabase/client';
import { env } from '@/lib/env';

class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error?.code ?? 'UNKNOWN', body?.error?.message ?? res.statusText);
  }
  return res.json();
}
```

> Supabase's client SDK manages token refresh internally — do not hand-roll a refresh interceptor on top of it. Just re-read `getSession()` before each call, as above.

### Auth Provider Pattern

```typescript
// frontend/web/src/components/AuthProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const AuthContext = createContext<{ user: any; loading: boolean }>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
```

### RequireAuth Route Guard

```typescript
// frontend/web/src/components/RequireAuth.tsx
'use client';
import { useAuth } from './AuthProvider';
import { redirect } from 'next/navigation';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) redirect('/login');
  return <>{children}</>;
}
```

### Data-freshness type contract (structural requirement, not optional styling — TRD §2)

Every component that renders a price, index value, or indicator must accept and visibly render `dataStatus` and `lastUpdated` — enforced at the TypeScript type level so it's impossible to render a number without its freshness label.

```typescript
// frontend/web/src/features/dashboard/types.ts
export interface PriceData {
  value: number;
  dataStatus: 'live' | 'delayed' | 'eod';   // required, not optional
  lastUpdated: string;                       // required, not optional
}
```

---

## 9. Domain Module Reference — Frontend

Mirrors §5. Each `features/<name>/` folder holds `api.ts` (TanStack Query hooks), `components/`, and `types.ts`.

### 9.1 `dashboard`
- `useMarketDashboard()` query hook, 30–60s `refetchInterval` while the tab is visible (respect the free backend tier — don't poll aggressively from every open tab).
- Renders `DataFreshnessBadge` on every price/index tile, sourced from the required `PriceData` fields (§8).

### 9.2 `stock-detail`
- `useStockDetail(symbol)`, `useStockHistory(symbol, timeframe)` — timeframe is a typed enum matching the backend's fixed set (§5.2), never a free date range from the UI.
- Chart component wraps TradingView Lightweight Charts; drawings/comparisons are client-only state, not persisted unless explicitly saved by the user to a watchlist note.

### 9.3 `technical-analysis`
- Each indicator card renders indicator name, timeframe, computed-at age, reason, invalidation condition, and the fixed risk-warning string — all required fields from the backend's `TechnicalSignal` model (§5.3), so a missing field is a build-time type error, not a silent UI gap.

### 9.4 `ipo-center`
- IPO list/detail views always render the `source_url` as a visible outbound link (PRD §5.4) — never hide or omit it for layout reasons.

### 9.5 `news`
- News item component renders `correction_history` when present as a visible "Updated" note, not a silent overwrite (mirrors backend §5.5 rule).
- Subscription toggle uses optimistic UI via TanStack Query mutation, rolled back on failure.

### 9.6 `portfolio`
- CSV import: client-side pre-validation (row count cap, required columns present) before upload, mirroring the backend's strict validation (§5.6) — reject early with a clear message rather than uploading a bad file and waiting for a 400.
- P&L views clearly separate realized vs. unrealized — never blend them into one number without a label.

### 9.7 `journal`
- Entry form fields map directly to PRD §7.4: entry plan, target, stop-loss, position size, reason, screenshot, emotion, result, lesson.
- Screenshot upload validated client-side for type/size before sending (§10 checklist item).

### 9.8 `floorsheet`
- Wording review: component copy audited against the same neutral-language rule as the backend (§5.8) — "large transaction" not "suspicious transaction," "concentration observed" not "possible manipulation."

### 9.9 `ai-outlook`
- Renders the fixed disclaimer string from PRD §6.2/§10 verbatim, unmodified, every time an outlook is shown — never truncated or hidden behind a tooltip.
- Confidence level drives visual treatment (color/weight), never a decorative badge disconnected from the actual confidence value (TRD §2 design direction).

---

## 10. Frontend Security Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **anon** key only — never the service role key, anywhere in `frontend/web`
- [ ] Every table the anon key can reach has RLS enabled — the anon key is public by design, RLS is what makes that safe
- [ ] DOMPurify applied to any HTML derived from scraped news content or AI output before rendering with `dangerouslySetInnerHTML`
- [ ] URL validation before any `href`/`src` built from scraped or AI-returned data — allow only `http:`/`https:`
- [ ] All forms validated with React Hook Form + Zod before submit, mirroring backend Pydantic validation
- [ ] Error boundary at root level
- [ ] `RequireAuth` wrapper on all authenticated routes (portfolio, journal, alerts)
- [ ] No `console.log` of tokens, session objects, or API keys — stripped in production builds
- [ ] `npm audit` clean
- [ ] `NEXT_PUBLIC_*` env vars validated with Zod at build time
- [ ] Loading + explicit error states for every async call — especially AI-explainer calls, which can hit a rate-limited free-tier provider and must degrade visibly, not silently
- [ ] CSV portfolio import (PRD §7.3) is size-limited and column-validated client-side before upload
- [ ] Content Security Policy header set (via `next.config.js` headers or the hosting platform) restricting script/style sources
- [ ] No third-party analytics/ad scripts with broad DOM access — this is a financial app; minimize third-party JS surface area
- [ ] Journal screenshot uploads validated for file type and size client-side before send (§9.7)

---

## 11. AI Subsystem — Outlook Model & RAG Explainer

### 11a. Outlook model (PRD §6.2–6.3)

- Trained offline (Colab/Kaggle) on OHLCV + indicators + breadth → up/sideways/down probability.
- Walk-forward validation; every prediction (right and wrong) logged to a `signals` table before being shown — this table is what PRD §6.3's evaluation and acceptance criteria (§13) actually check.
- Exported as `.joblib`/ONNX, loaded directly in FastAPI — no external inference call, no extra attack surface.
- Response schema **must** include timeframe, outlook, probabilities, confidence, factors, and the fixed educational-disclaimer warning string — enforce via a Pydantic response model, so a code change can't accidentally ship a bare number.

```python
# backend/app/modules/ai/outlook/outlook.schema.py
from pydantic import BaseModel

class OutlookResponse(BaseModel):
    timeframe: str
    outlook: str
    prob_up: float
    prob_sideways: float
    prob_down: float
    confidence: str  # "low" | "medium" | "high"
    factors: list[str]
    warning: str = "Educational model output; not a guaranteed forecast."
```

### 11b. RAG explainer (PRD §6.1)

- Grounded in retrieved source documents (reports, prospectuses, AGM notices) via `pgvector` — never answers from general model knowledge alone for factual claims (price, date, dividend, approval, result).
- **Multi-provider fallback chain**, ordered by priority:
  1. Gemini (AI Studio) Flash/Flash-Lite — best general quality and multilingual grounding, ~1,500 requests/day (verify current limit).
  2. Groq — fast, high-volume backup once Gemini's daily cap is hit.
  3. NVIDIA NIM — independent free pool, third fallback.
  4. OpenRouter's free model pool — last resort, smaller daily cap.
- Wired via **LiteLLM** (MIT license) as an in-process library inside FastAPI — one function call with configurable fallback/retry-on-429, instead of hand-rolled try/except across four SDKs.
- **Track usage proactively:** log request counts per provider (Postgres/Redis counter, reset daily) and switch to the next provider *before* hitting the wall, not just on a caught 429.
- **Security note on LiteLLM:** a supply-chain compromise existed in specific PyPI versions (1.82.7/1.82.8) in March 2026, patched in 1.83.0+. Pin to a current, patched version — verify against current advisories at install time, not from this document.
- Every response must cite its source document/link and separate fact vs. calculation vs. interpretation, per PRD §6.1.
- Response caching by indicator/report (not per-user) stretches the free-tier quota and reduces prompt-injection surface exposed per session.

```python
# backend/app/modules/ai/explainer/router.py (excerpt)
import litellm

PROVIDER_CHAIN = ["gemini/gemini-flash", "groq/llama3-70b", "nvidia_nim/...", "openrouter/..."]

async def explain(query: str, retrieved_context: list[str], locale: str) -> str:
    system_prompt = build_system_prompt(locale)  # never lets retrieved_context override these instructions
    grounded_prompt = f"{system_prompt}\n\nSource documents:\n{format_context(retrieved_context)}\n\nQuestion: {query}"
    response = await litellm.acompletion(
        model=PROVIDER_CHAIN[current_provider_index()],
        messages=[{"role": "user", "content": grounded_prompt}],
        fallbacks=PROVIDER_CHAIN,
    )
    return response.choices[0].message.content
```

### 11c. Where the trained models actually live

| Stage | Outlook model (§11a) | Fine-tuned explainer (if ever pursued) |
| --- | --- | --- |
| Training | Local machine or free Colab/Kaggle CPU | Free Colab/Kaggle GPU (LoRA needs GPU) — not currently planned per TRD §4b Path 2 |
| Artifact | Small `.joblib`/ONNX file | Model weights, hundreds of MB+ |
| Storage | Committed to repo, or Supabase Storage | Hugging Face Hub (free, Git LFS versioning) |
| Inference | Loaded directly in FastAPI on Render/Fly | Not in current scope |

---

## 12. Bilingual (Nepali/English) Architecture

- **Routing:** `next-intl` with `/ne` and `/en` locale-prefixed routes — every page, including AI-generated explanation routes, not just static UI strings.
- **Content model:** any user-facing text stored in Supabase (news headlines, AI explanations) uses a `{ en, ne }` JSONB pair or a language column — decide once, apply everywhere, never retrofit.
- **Numerals/dates:** explicit product decision on Nepali numerals/BS calendar vs. Arabic numerals/AD dates in the `ne` locale (corporate-action dates especially — AGM, book closure). Document the decision here once made.
- **AI output:** the explainer (§11b) generates directly in the requested locale via the system prompt and few-shot examples — never machine-translate a cached English explanation after the fact, which degrades financial-terminology accuracy.
- **Testing:** a component test asserting no route ever renders a raw untranslated i18n key to the user (§10, §14).

---

## 13. Market Data Provider Abstraction & Scraping Pipeline Hardening

### 13.1 Provider Abstraction — build this before wiring the scraper, and definitely before wiring any official API

The scraper is a **temporary, swappable data source**, not a permanent architectural fact. NEPSE (or a licensed vendor) may grant official API access later, and when that happens, switching over must be a config change plus one new class — never a rewrite of `modules/market`, `modules/stocks`, or `modules/technicals`. That only works if those modules never talk to the scraper directly in the first place.

**The rule: every module that needs live/delayed/EOD price or index data calls `get_market_data_provider()` and nothing else.** No module imports `pipeline/scrapers/` directly, ever — not "just this once," not "to save time in Phase 4."

```python
# backend/app/services/market_data/base.py
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from pydantic import BaseModel

class DataStatus(str, Enum):
    live = "live"; delayed = "delayed"; eod = "eod"

class MarketSnapshot(BaseModel):
    index_value: float
    turnover: float
    breadth_advancing: int
    breadth_declining: int
    data_status: DataStatus
    last_updated: datetime

class StockPricePoint(BaseModel):
    symbol: str
    ltp: float
    change_percent: float
    volume: int
    data_status: DataStatus
    last_updated: datetime

class MarketDataProvider(ABC):
    """Implemented by ScraperMarketDataProvider today, and by NepseApiMarketDataProvider
    once official API access exists. Modules depend on this interface only — never on a
    concrete provider class."""

    @abstractmethod
    async def get_market_snapshot(self) -> MarketSnapshot: ...

    @abstractmethod
    async def get_sector_performance(self) -> list["SectorPerformance"]: ...

    @abstractmethod
    async def get_top_movers(self) -> "TopMovers": ...

    @abstractmethod
    async def get_stock_price(self, symbol: str) -> StockPricePoint: ...

    @abstractmethod
    async def get_stock_history(self, symbol: str, timeframe: "Timeframe") -> list[StockPricePoint]: ...

    @abstractmethod
    def source_name(self) -> str:
        """'scraper' or 'nepse_official_api' — surfaced in logs/response metadata so it's always
        obvious which source served a given response, useful during the parallel-run migration below."""
        ...
```

```python
# backend/app/services/market_data/factory.py
from functools import lru_cache
from app.core.config import settings
from .scraper_provider import ScraperMarketDataProvider
from .nepse_api_provider import NepseApiMarketDataProvider

@lru_cache
def get_market_data_provider() -> "MarketDataProvider":
    if settings.MARKET_DATA_PROVIDER == "nepse_api":
        return NepseApiMarketDataProvider()
    return ScraperMarketDataProvider()  # default today
```

- `MARKET_DATA_PROVIDER` (`scraper` | `nepse_api`, default `scraper`) is a real Pydantic Settings field in `backend/app/core/config.py` and `.env.example` — not a hardcoded string anywhere.
- In FastAPI routes, inject with `provider: MarketDataProvider = Depends(get_market_data_provider)` — never instantiate a concrete provider inside a route.
- **Phase sequencing:** Phase 4 modules are built against this interface with a minimal placeholder implementation (returns realistic fixed sample data). Phase 5 replaces the placeholder with `ScraperMarketDataProvider`, wired to the real pipeline — module code in `modules/market`, `modules/stocks`, `modules/technicals` should require zero changes when that swap happens. If it does require changes, the interface was leaked around somewhere and that's a bug to fix, not a one-off exception.

**When NEPSE (or a licensed vendor) grants official API access — the actual migration, later:**
1. Implement `NepseApiMarketDataProvider` fully in `nepse_api_provider.py` against the real API — it must satisfy the exact same `MarketDataProvider` interface and return the exact same Pydantic response shapes (`data_status`/`last_updated` computed from the API's own freshness signals, not scrape recency).
2. Add its own env vars (`NEPSE_API_KEY`, `NEPSE_API_BASE_URL`) to `.env.example` — keep them fully separate from scraper config, never reused or aliased.
3. Run both providers in shadow mode first: call both, serve the scraper's response as before, but log any divergence between the two outputs. Do this for at least a full trading week before trusting the new source.
4. Flip `MARKET_DATA_PROVIDER=nepse_api` in production — this should be the entire cutover. No module code changes.
5. Keep `ScraperMarketDataProvider` in the codebase as a documented fallback path (don't delete it immediately) — if the official API has an outage, falling back to the scraper is safer than serving `DATA_SOURCE_UNAVAILABLE` if the scraper still works, though which behavior you actually want here is a product decision to make explicitly, not a silent default.
6. Only retire the scraper GitHub Actions workflows (§13.2) once you're confident in the official API's reliability — don't delete the fallback the same day you cut over.

### 13.2 Scraping Pipeline Hardening

- Raw scraped payloads and normalized data live in **separate tables** — a parsing bug must never destroy the reprocessable raw record.
- Every price/index component carries a `data_status: live|delayed|eod` field and `last_updated` timestamp as a **required**, non-nullable column.
- Stale-data detection: a scheduled check compares `last_updated` against an expected freshness window per data type and flags `STALE_DATA` rather than silently serving old numbers.
- Scrape failures alert via Telegram (per your existing scraper pattern) — an operational security control, not just a nicety: silent scraper failure is how a finance app ends up serving wrong prices with no one noticing.
- Scrape conservatively (low frequency, aggressive caching) — respects source sites and GitHub Actions free-tier minutes.
- Before any commercial/high-volume launch, resolve the data-redistribution licensing question flagged in PRD §10 — this blueprint sequences the engineering around it, it doesn't remove the legal requirement.

```yaml
# .github/workflows/scrape-market-data.yml
name: Scrape Market Data
on:
  schedule:
    - cron: "*/15 3-9 * * 0-4"   # adjust to NEPSE trading hours in UTC
  workflow_dispatch: {}
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r backend/requirements.txt
      - run: python backend/app/pipeline/scrapers/market_scraper.py
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
```

---

## 14. Postman & Testing Guide

### Postman collection structure

```
postman/nepse-insight.postman_collection.json
├── Auth (login via Supabase, store {{accessToken}} in a test script)
├── Market (dashboard, sectors, top-movers)
├── Stocks (detail, history, compare)
├── Technicals
├── IPO
├── News
├── Portfolio (transactions CRUD, import, export) — requires {{accessToken}}
├── Journal — requires {{accessToken}}
├── Floorsheet
└── AI (outlook, explainer)
```

- Environment file (`nepse-insight.postman_environment.json`) defines `{{baseUrl}}` and `{{accessToken}}`; never commit real tokens — only placeholder values.
- Every request that mutates data includes a `Tests` script asserting the standard success shape (`success: true`, correct `data` keys) and, for creates, capturing the new resource ID into a collection variable for chained requests.
- A dedicated **"Cross-user access"** folder: log in as User B, attempt to read/modify User A's portfolio/journal resource IDs captured earlier, assert `404` (not `200`, not `403` — see the ownership-check rule in §4). This is the manual complement to the automated RLS test below.

### Backend tests (`pytest`)

```python
# backend/tests/test_rls.py
async def test_user_cannot_read_other_users_portfolio(client, user_a_token, user_b_token):
    # User A creates a transaction
    resp = await client.post("/api/v1/portfolio/transactions", json={...}, headers=auth(user_a_token))
    resource_id = resp.json()["data"]["id"]

    # User B attempts to read it
    resp = await client.get(f"/api/v1/portfolio/transactions/{resource_id}", headers=auth(user_b_token))
    assert resp.status_code == 404  # never 403 — don't confirm existence to a non-owner
```

- Unit tests per module (§5) covering validation, error codes, and business rules.
- Integration tests hit a **dedicated test Supabase project** — never production.
- A specific test for the AI outlook response schema — asserts `warning`, `confidence`, and `factors` are always present, catching a regression where a code change accidentally strips a required field.
- A specific test that a `signals` row is created for every outlook response returned, verifying PRD §6.3's "log every signal, right and wrong" requirement is actually enforced, not just documented.

### Frontend tests

- Component test: a price/index component cannot compile or render without `dataStatus`/`lastUpdated` props (§8) — a type-level test plus a runtime render test with the props omitted, expecting a TypeScript error at build time.
- Integration test: the full auth flow (login → protected route → logout) using a test Supabase project.
- i18n test: every route rendered in both `/ne` and `/en` resolves with no raw translation-key strings visible in the output (§12).

### AI golden-set tests

- A fixed set of ~20–30 questions with known-correct source documents for the RAG explainer. Each test asserts: (1) the response cites the correct source, (2) no numeric claim in the response is absent from the cited source, (3) the response is in the requested locale.
- Run this set after any prompt or provider-chain change — a regression here is a factual-accuracy regression in a financial product, treated with the same seriousness as a failing security test.

---

## 15. AI Workflow, CI & Git Hygiene

- `.gitignore` covers secrets, `node_modules/`, `.venv/`, build output, and large model weights (§2) — verify with `git status` before every push.
- `.cursorignore` (or equivalent AI-indexing ignore file) mirrors `.gitignore`, so secrets never enter an AI assistant's context window during development.
- Any AI assistant used for development (Claude Code, Cursor, Copilot) must follow the Version Safety Rule at the top of this document before touching dependency files.
- Dependabot (or equivalent) enabled on the repo for both `npm` and `pip` ecosystems.

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "lts/*" }
      - run: cd frontend/web && npm ci
      - run: cd frontend/web && npm run lint
      - run: cd frontend/web && npm run type-check
      - run: cd frontend/web && npm audit --audit-level=high
      - run: cd frontend/web && npm test
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pip-audit
      - run: cd backend && mypy app
      - run: cd backend && pytest
```

- `npm ci` in CI — never a bare `npm install` with unpinned ranges in the pipeline. `pip install -r requirements.txt` with a fully pinned/locked file, checked by `pip-audit` in the same job.
- Every PR must pass CI before merge — no exceptions for "just a quick fix," since a quick unaudited fix is exactly how a dependency vulnerability slips in.

---

## 16. Capacitor Mobile Conversion — Final Stage Only

**Do not build this now.** This section exists so that, when the web app is finished, deployed, and stable, converting it into a mobile app via Capacitor is a bounded, well-understood final step — not a mid-project rewrite. Treat everything below as reference material for a future session, not a current task list. The only thing this section asks of you *today* is the one item in §16.1 — everything else in §16 happens later, once, at conversion time.

### 16.1 The one thing to keep true from day one

Write features (§9) as client components that fetch data from the FastAPI backend over the network, rather than leaning on Next.js server-only data fetching for anything in `dashboard`, `stock-detail`, `portfolio`, `journal`, `technical-analysis`, `ipo-center`, `news`, `floorsheet`, or `ai-outlook`. This is already the natural pattern for a Supabase-authenticated SPA-style app, so in practice you likely don't need to change anything — just don't deliberately reach for Next.js server components/server actions for these routes for "best practice SSR" reasons, since that would need to be undone later. Public SEO-only marketing pages are exempt and can use SSR freely.

That's the entire day-one obligation. Everything else below is deferred.

### 16.2 What happens at conversion time (when you actually decide to do it)

1. **Static export target.** Capacitor wraps a static asset bundle, not a running Node server. At conversion time, add a `next export`-style static build path (Next.js `output: 'export'`) behind an env flag, and verify every route that needs to ship to mobile renders correctly as a static/client-fetched page.
2. **Drop server-only routes from the mobile bundle.** Next.js `app/api/*` routes don't exist in a static export — confirm nothing mobile-critical depends on them (should already be true per §16.1).
3. **Auth token storage on native.** Supabase's browser client defaults to `localStorage`. On native, swap in `@capacitor/preferences` (or a Keychain/Keystore-backed plugin) as a custom storage adapter — a small, explicit piece of wiring via Supabase's `storage` client option.
4. **CORS/network config.** Add the Capacitor runtime origins (`capacitor://localhost` on iOS, `http://localhost` on Android by default — confirm against current Capacitor docs, this has changed across major versions) to the backend's CORS allowlist. Disable cleartext HTTP in the production native build.
5. **Native project setup.** `npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios`, `npx cap init`, `npx cap add android`, `npx cap add ios`. These generate the `android/`/`ios/` directories that are deliberately absent from the repo until this point (§2).
6. **Push notifications.** PRD §7.2 push requirements split into two implementations at this point: web push (VAPID, already built for the browser) and native push (FCM/APNs via a Capacitor plugin) — don't assume one covers both; native push is new work done here, not earlier.
7. **Permissions.** Request only what's needed and justified by a PRD feature — camera for journal screenshots (§9.7/PRD §7.4), notifications for alerts (PRD §7.2). No broad permission requests "just in case."
8. **Signing.** Android keystore and iOS provisioning profile are generated/managed at this stage, stored in CI secrets or a secure vault — never committed to the repo.

### Build/release flow (reference, for when §16.2 is executed)

```bash
# One-time, at conversion time
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init

# Every release, after conversion
cd frontend/web
NEXT_PUBLIC_IS_CAPACITOR_BUILD=true npm run build   # next build + export
npx cap sync                                        # copy web assets + update native deps
npx cap open android                                # or ios — build/sign in the native IDE
```

### 16.3 Capacitor-specific security checklist (apply only at conversion time)

- [ ] `capacitor.config.ts` sets `server.androidScheme`/`server.iosScheme` explicitly, reflected in backend CORS allowlist
- [ ] No cleartext HTTP allowed in production Android/iOS builds
- [ ] Supabase auth storage uses `@capacitor/preferences` (or platform Keychain/Keystore) on native, not the browser `localStorage` default
- [ ] Deep links/custom URL schemes (if used for OAuth callback) validated — reject unexpected schemes/hosts
- [ ] `npx cap sync` is a documented, required pre-release step in CI
- [ ] App signing keys never committed to the repo
- [ ] Native permissions requested are minimal and each has a clear PRD-backed justification
- [ ] Native push (FCM/APNs) implemented separately from web-push/VAPID, not assumed to be shared

---

## 17. Master Prompts

### 17.1 Backend Security Hardening Prompt

```
Audit and harden this FastAPI + Supabase backend for production.

Check and implement if missing:
1. Pydantic Settings validate all env vars at startup — crash on bad config
2. Every Supabase table with user data has RLS policies restricting to auth.uid() = user_id
3. JWT verification dependency used on every protected route, correct error codes (TOKEN_EXPIRED vs TOKEN_INVALID vs UNAUTHORIZED)
4. assert_ownership() check before any resource read/write by ID
5. CORS allowlist explicit, never "*" with credentials
6. Rate limiting on all routes, stricter on /auth and /ai/explainer
7. Request body size capped
8. AI outlook responses validated against a Pydantic response model requiring timeframe/confidence/factors/warning fields
9. Every AI outlook prediction logged to a signals table before being returned to the client
10. RAG explainer never lets retrieved document content override system prompt instructions
11. LiteLLM pinned to current patched version (verify against latest advisories, not from memory)
12. Structured logging with no tokens/API keys/PII in log output
13. Sentry configured with before_send scrubbing
14. pip-audit clean — fix all high/critical
15. GET /health (liveness, no DB call) + GET /ready (readiness, DB check); excluded from strict rate limits
16. No broker credentials accepted, stored, or logged anywhere
17. .gitignore verified — .env*, __pycache__, .venv, model weights above a few MB never tracked
18. HTTPS enforced in production
```

### 17.2 Frontend Security Hardening Prompt

```
Audit and harden this Next.js + Supabase + TanStack Query frontend for production.

Check and implement if missing:
1. NEXT_PUBLIC_SUPABASE_ANON_KEY is the anon key only, service role key never referenced in frontend/web
2. DOMPurify applied to any HTML from scraped news or AI output before dangerouslySetInnerHTML
3. URL validation before any href/src from scraped or AI-returned data — http:/https: only
4. All forms validated with React Hook Form + Zod before submit
5. Error boundary at root level
6. RequireAuth on all authenticated routes
7. No console.log of tokens or session objects, stripped in production
8. npm audit clean
9. NEXT_PUBLIC_* env vars validated with Zod at build time
10. Loading + explicit error states for every async call, especially AI-explainer calls that can hit a rate-limited free provider
11. CSV import validated client-side (size + columns) before upload
12. CSP header configured
13. Price/index components cannot render without a dataStatus (live/delayed/eod) prop — enforce at the type level
14. Data-fetching in dashboard/stock-detail/portfolio/journal/technicals/ipo/news/floorsheet/ai-outlook uses client components calling the FastAPI backend, not server-only Next.js data fetching (keeps the app Capacitor-convertible later without a rewrite — see blueprint §16.1)
15. Bilingual content fields ({en, ne} pairs) never fall back to showing raw untranslated keys in the UI
```

### 17.3 Module Build Prompt (repeat per PRD module in §5/§9)

```
Build the <module name> module end to end for NEPSE Insight, per blueprint §5.<n> (backend) and §9.<n> (frontend):
1. Supabase table(s) with RLS policies matching the §4 reference pattern if user-owned data is involved
2. FastAPI router + Pydantic schemas under backend/app/modules/<module>/
3. Standard error shape and error codes from §6's master reference
4. Next.js feature folder under frontend/web/src/features/<module>/ with TanStack Query hooks
5. Data-freshness fields (dataStatus/lastUpdated) on any price-bearing response, enforced at the type level
6. pytest tests under backend/tests/test_<module>.py, including an ownership/RLS cross-user test if applicable
7. API documentation entry following the §6 template
8. Postman collection folder with at least one request per endpoint and a passing Tests script
Do not mark this module complete until all 8 items exist.
```

### 17.4 Pre-Deployment Full Audit Prompt

```
Run a full production-readiness audit against docs/PROJECT_BLUEPRINT.md sections 7, 10, and 18.
For each unchecked item, either fix it directly or report exactly why it cannot be fixed yet and what blocks it.
Do not mark an item complete without showing the specific code or config that satisfies it.
Do not touch Capacitor/mobile items (§16) — that is out of scope until the web app is fully shipped.
```

---

## 18. Pre-Launch Production Checklist

Consolidated from all sections above — the final gate before deploying the **web app**. Capacitor conversion (§16) is a separate, later gate with its own checklist (§16.3) — do not block web launch on it.

- [ ] `pip-audit` and `npm audit` both zero high/critical across `backend/`, `frontend/web/`, and `frontend/admin/`
- [ ] RLS enabled and tested on every Supabase table holding user data
- [ ] All AI outlook responses carry required disclaimer/confidence fields; every signal logged
- [ ] Scraper freshness labeling (`live/delayed/eod`) present on every price component, verified against PRD §13 acceptance criteria
- [ ] No broker credentials anywhere in code, logs, or database schema
- [ ] HTTPS enforced everywhere
- [ ] Sentry live on frontend, backend, and admin panel
- [ ] Supabase keep-alive cron active (prevents free-tier project pause)
- [ ] Data redistribution/licensing question (PRD §10) resolved or explicitly deferred with a documented owner and date
- [ ] Required PRD §10 disclaimer text present and unmodified anywhere AI output or outlooks are shown
- [ ] `.env.example` files current in every app; a fresh clone + `.env` fill-in can actually boot the stack
- [ ] Every module in §5/§9 has passed the 8-item checklist in §17.3
- [ ] Postman collection covers every endpoint with a passing Tests script (§14)

---

## 19. Document Maintenance

**When to update this file:**
- New integration added (payments, storage, push provider) → add env vars to all relevant `.env.example` files and the Zod/Pydantic schemas, add a checklist item here
- Auth strategy changes (MFA, passkeys) → update §7, §10, §17
- New CVE published for a used dependency → rotate any affected secrets, upgrade to a patched release, log the incident in your own changelog — do not add long-lived version pins to this file
- Deploying to a new host → re-verify CORS origins, cookie/storage settings, and HTTPS enforcement
- **When you actually begin §16** → move its content-in-progress notes out of "reference material" framing and start checking off §16.3 for real; until then, leave §16 untouched as a future-reference section

**Security review triggers:**
- Any change to Supabase RLS policies
- Any change to CORS origin list
- Any change to OAuth redirect URLs
- Any new public (no-auth) endpoint — add to rate-limit config
- Any change to what data the AI explainer is allowed to retrieve/cite

**AI assistant instruction:** When using this document as context, follow the ⚠️ Version Safety Rule at the top — web search each dependency, confirm with `npm show`/`pip index versions` when the shell is available, state what you verified, and never copy semver literals from this file into a lockfile. Also respect §16's framing: do not propose Capacitor/mobile work unless the person explicitly says they're ready to start the final-stage conversion.

---

*Stack-specific to NEPSE Insight (Next.js + FastAPI + Supabase). Mobile conversion via Capacitor is deferred to §16 and executed once, at the end. Originally derived from `prd.md` v1.0 and `trd.md` v2, which are no longer present as separate files — this document is self-contained; update this file directly as implementation decisions are made.* 