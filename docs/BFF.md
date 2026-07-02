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
| GET | `/api/review/queue` | Yes | `BACKEND_URL/api/review/queue` (forwards `language`, `limit`) | No |
| GET | `/api/review/stats` | Yes | `BACKEND_URL/api/review/stats` (forwards `language`) | No |
| POST | `/api/review/[id]` | Yes | `BACKEND_URL/api/review/{id}` (body `{ grade }`) | No |
| POST | `/api/review/[id]/suspend` | Yes | `BACKEND_URL/api/review/{id}/suspend` | No |
| POST | `/api/review/[id]/unsuspend` | Yes | `BACKEND_URL/api/review/{id}/unsuspend` | No |

The `/api/review/*` handlers map the backend's snake_case payloads to the camelCase,
`Word`-shaped card the UI consumes (`src/features/Review/api/mappers.ts`); the rest pass
JSON through. Each card carries `projected_intervals` (`{ grade: seconds_until_due }`)
straight from the backend scheduler — the frontend does no SM-2 of its own.

## Auth pattern for protected routes

Middleware (`src/middleware.ts`) verifies the `refresh_token` cookie using JOSE before
the handler runs (matcher: `/api/dictionary/*`, `/api/history/*`, `/api/review/*`). The
handler itself then exchanges that cookie for an access token by calling
`BACKEND_URL/api/auth/refresh` server-side, and attaches the resulting
`Authorization: Bearer <token>` header on the upstream call. That exchange is centralised
in `src/shared/api/serverAuth.ts` (`requireAccessToken`), used by the dictionary, history,
and review routes.

This means the browser never holds or sends an access token — it only holds the httpOnly
`refresh_token` cookie.

Under `MOCK_BACKEND=1` (`npm run dev:mock`) the upstream `fetch` is intercepted by
`src/mocks/*` — every route below runs unchanged against an in-memory mock backend instead
of FastAPI/OpenRouter (see RUNBOOK → "Run with a mocked backend").

## SSE streaming (`/api/ai-overview`)

1. Receives `{ sentence, tokens }` JSON body
2. Detects language from token POS tags
3. Calls OpenRouter with `stream: true`; model defaults to `deepseek/deepseek-v4-flash` (override with `OPENROUTER_MODEL`)
4. Re-emits each `delta.content` chunk as `data: {"content":"…"}\n\n`
5. Terminates with `data: [DONE]\n\n`
6. Falls back to a deterministic mock if `OPENROUTER_KEY` is unset or OpenRouter returns an error
