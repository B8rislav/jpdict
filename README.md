# JapChin Dict — Frontend

Next.js 15 application for studying Japanese and Chinese: morphological analysis,
dictionary lookup, and AI-powered grammar explanations in a single interface.

The **backend lives in `../backend/`** and owns both Docker Compose files. All run
commands below are executed from the `backend/` directory unless stated otherwise.

---

## Documentation

- [docs/README.md](docs/README.md) — full index with one-liner per doc
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — data flow, BFF pattern, SSE, auth cookies
- [docs/STATE.md](docs/STATE.md) — Effector store map
- [docs/AUTH.md](docs/AUTH.md) — JWT flow and threat model
- [docs/RUNBOOK.md](docs/RUNBOOK.md) — dev recipes, env vars, debugging

---

## For AI agents / contributors

New to the repo (human or coding agent)? Start with **[AGENTS.md](AGENTS.md)** — a
one-screen map of commands, the FSD-ish architecture, conventions, and gotchas
(`CLAUDE.md` is a symlink to it). Then fan out from the [docs index](docs/README.md).
Before pushing, see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Frontend dev server and build |
| npm | 10+ | Package management |
| Docker + Docker Compose | v2 | Runs PostgreSQL, Redis, and the full stack |
| git-lfs | any | Fetches dictionary data files stored in LFS |

For the backend's Python toolchain (only needed for `make dev` hybrid mode), see
[`../backend/README.md`](../backend/README.md).

---

## Development

Two options — choose based on how much you want to run locally.

### Option A — Frontend only (fastest iteration)

Use this when you already have the backend running somewhere (Docker or remote).

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

Point at a running backend via env var (defaults to `http://localhost:8000`):

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 npm run dev
```

### Option B — Full stack in Docker (recommended first run)

Runs Postgres, Redis, FastAPI, and Next.js together. All commands from `backend/`.

```bash
# 1. Fetch dictionary data files (once per machine, requires git-lfs)
git lfs install && git lfs pull

# 2. Copy backend env file and fill in the required values
cd backend
cp .env.example .env    # edit DATABASE_URL, SECRET_KEY, etc.

# 3. Start the full stack
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Interactive API docs | http://localhost:8000/docs |

The dev compose (`docker-compose.yml`) uses hardcoded credentials suitable for local
use only (`POSTGRES_PASSWORD: postgres`).

### Option C — Backend local, frontend in Docker

```bash
# Terminal 1 — backend (starts DB + Redis in Docker, API with hot reload)
cd backend && make dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

`make dev` starts `db` and `cache` containers, then runs uvicorn directly on the host
with `--reload`. The frontend picks up the backend at `http://localhost:8000` by default.

---

## Production

All commands from `backend/`. The prod compose file (`docker-compose.prod.yml`) builds
and runs both the backend and frontend containers.

### 1. Set environment variables

```bash
# Database
export POSTGRES_DB=jpdict
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=<strong-password>
export DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}

# Cache
export REDIS_URL=redis://cache:6379/0

# Backend secrets
export SECRET_KEY=<random-string-min-32-chars>
export OPENROUTER_API_KEY=<your-openrouter-key>
export ALLOWED_ORIGINS=https://your-frontend-domain.com

# Frontend
export NEXT_PUBLIC_BACKEND_URL=https://api.your-domain.com
export OPENROUTER_KEY=<same-openrouter-key>
export JWT_SECRET=<same-as-SECRET_KEY-or-separate>
```

> Tip: write these into a `.env.prod` file and source it: `set -a && source .env.prod && set +a`

### 2. Start

```bash
cd backend
docker compose -f docker-compose.prod.yml up --build -d
```

The backend container runs Alembic migrations and all dictionary imports automatically on
first boot (no-op on subsequent starts). Subsequent boots are fast.

### 3. Stop / restart

```bash
docker compose -f docker-compose.prod.yml down          # stop, keep volumes
docker compose -f docker-compose.prod.yml down -v       # stop + wipe DB
docker compose -f docker-compose.prod.yml restart frontend
```

---

## Environment variables

### Frontend variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | No | Public backend URL used in browser bundles. Defaults to `FASTAPI_URL` then `http://localhost:8000`. |
| `FASTAPI_URL` | No | Server-side backend URL (not exposed to browser). Used inside Docker where backend is `http://backend:8000`. |
| `OPENROUTER_KEY` | No | API key for OpenRouter AI explanations. If absent, the BFF returns a static mock. |
| `OPENROUTER_MODEL` | No | Override the AI model. Defaults to `deepseek/deepseek-v4-flash`. |
| `JWT_SECRET` | **Yes (prod)** | Must match the backend `SECRET_KEY`. Used by Next.js middleware to verify refresh tokens. |

### Backend variables (summarised — full list in `../backend/README.md`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL async connection string |
| `REDIS_URL` | **Yes** | Redis connection string |
| `SECRET_KEY` | **Yes** | JWT signing secret, ≥ 32 chars |
| `OPENROUTER_API_KEY` | No | OpenRouter key for AI explanations |
| `ALLOWED_ORIGINS` | No | CORS origins, comma-separated |

---

## Frontend scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Production build (outputs to `.next/`) |
| `npm run start` | Serve the production build locally |
| `npm run test` | Vitest unit tests |
| `npm run test:storybook` | Storybook component tests (headless) |
| `npm run storybook` | Storybook dev server — http://localhost:6006 |
| `npm run generate-types` | Regenerate OpenAPI types from a running backend at localhost:8000 |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run format` | Prettier |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + React 19 |
| State | Effector 23 + effector-react |
| UI components | Gravity UI 7 (`@gravity-ui/uikit`) |
| Styling | CSS Modules + CSS custom properties |
| Fonts | Noto Sans JP / SC via `next/font/google` |
| Testing | Vitest + Storybook test runner |
| JWT verification | JOSE (`jose`) |
| AI streaming | OpenRouter via SSE (`text/event-stream`) |
