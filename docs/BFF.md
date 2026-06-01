# BFF (Backend-for-Frontend)

Next.js route handlers under `src/app/api/`. The browser never calls FastAPI directly.

Backend base URL source of truth: `src/shared/api/backend.ts`
```
NEXT_PUBLIC_BACKEND_URL  →  FASTAPI_URL  →  http://localhost:8000
```

## Route table

| Method | Path | Middleware auth | Proxies to | Streams |
|--------|------|-----------------|-----------|---------|
| POST | `/api/auth/login` | No | `BACKEND_URL/api/auth/login` | No |
| POST | `/api/auth/register` | No | `BACKEND_URL/api/auth/register` | No |
| POST | `/api/auth/refresh` | No | `BACKEND_URL/api/auth/refresh` | No |
| POST | `/api/auth/logout` | No | clears cookie locally | No |
| GET | `/api/parse-sentence` | No | `BACKEND_URL/api/parse-sentence` | No |
| POST | `/api/ai-overview` | No | **OpenRouter** (`openrouter.ai/api/v1/chat/completions`) | **Yes (SSE)** |
| GET | `/api/dictionary` | Yes (cookie JWT) | `BACKEND_URL/api/vocabulary` | No |
| POST | `/api/dictionary` | Yes | `BACKEND_URL/api/vocabulary` | No |
| DELETE | `/api/dictionary/[id]` | Yes | `BACKEND_URL/api/vocabulary/{id}` | No |
| PATCH | `/api/dictionary/[id]` | Yes | `BACKEND_URL/api/vocabulary/{id}` | No |
| GET | `/api/history` | Yes | `BACKEND_URL/api/history` | No |
| POST | `/api/history` | Yes | `BACKEND_URL/api/history` | No |
| DELETE | `/api/history` | Yes | `BACKEND_URL/api/history` (clear all) | No |
| DELETE | `/api/history/[id]` | Yes | `BACKEND_URL/api/history/{id}` | No |

## Auth pattern for protected routes

Middleware (`src/middleware.ts`) verifies the `refresh_token` cookie using JOSE before
the handler runs. The handler itself then exchanges that cookie for an access token by
calling `BACKEND_URL/api/auth/refresh` server-side, and attaches the resulting
`Authorization: Bearer <token>` header on the upstream call.

This means the browser never holds or sends an access token — it only holds the httpOnly
`refresh_token` cookie.

## SSE streaming (`/api/ai-overview`)

1. Receives `{ sentence, tokens }` JSON body
2. Detects language from token POS tags
3. Calls OpenRouter with `stream: true`; model defaults to `deepseek/deepseek-v4-flash` (override with `OPENROUTER_MODEL`)
4. Re-emits each `delta.content` chunk as `data: {"content":"…"}\n\n`
5. Terminates with `data: [DONE]\n\n`
6. Falls back to a deterministic mock if `OPENROUTER_KEY` is unset or OpenRouter returns an error
