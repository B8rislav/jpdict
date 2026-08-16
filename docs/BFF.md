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
| GET | `/api/dictionary/saved` | Yes | `BACKEND_URL/api/vocabulary/saved` | No |
| POST | `/api/dictionary` | Yes | `BACKEND_URL/api/vocabulary` | No |
| DELETE | `/api/dictionary/[id]` | Yes | `BACKEND_URL/api/vocabulary/{id}` | No |
| PATCH | `/api/dictionary/[id]` | Yes | `BACKEND_URL/api/vocabulary/{id}` | No |
| GET | `/api/history` | Yes | `BACKEND_URL/api/history` | No |
| POST | `/api/history` | Yes | `BACKEND_URL/api/history` | No |
| DELETE | `/api/history` | Yes | `BACKEND_URL/api/history` (clear all) | No |
| DELETE | `/api/history/[id]` | Yes | `BACKEND_URL/api/history/{id}` | No |
| GET | `/api/review/queue` | Yes | `BACKEND_URL/api/review/queue` (forwards `language`, `limit`, `card_type`, `tz`) | No |
| GET | `/api/review/stats` | Yes | `BACKEND_URL/api/review/stats` (forwards `language`, `tz`) | No |
| GET | `/api/review/activity` | Yes | `BACKEND_URL/api/review/activity` (forwards `language`, `tz`, `weeks`) | No |
| POST | `/api/review/[id]` | Yes | `BACKEND_URL/api/review/{id}` (body `{ grade, elapsed_ms? }`) | No |
| POST | `/api/review/[id]/suspend` | Yes | `BACKEND_URL/api/review/{id}/suspend` | No |
| POST | `/api/review/[id]/unsuspend` | Yes | `BACKEND_URL/api/review/{id}/unsuspend` | No |

**The `tz` parameter.** Every daily-scoped review call forwards an IANA timezone from
the browser (`Intl.DateTimeFormat().resolvedOptions().timeZone`), because only the client
knows what day it is where the user is. It decides the goal ring's «сегодня», the streak,
the heatmap's buckets and the daily new-card cap; the backend falls back to UTC when the
name is absent or unrecognised. Bucketing on UTC was wrong by the caller's offset — a
01:00 session in UTC+3 landed on the previous day and could appear to break a streak.

`POST /api/review/[id]` forwards `elapsedMs` (the client's measured time on the card) as
`elapsed_ms`, and only when present. The backend clamps it, so the BFF neither bounds nor
trusts the number.

The `/api/review/*` handlers map the backend's snake_case payloads to the camelCase,
`Word`-shaped card the UI consumes (`src/shared/api/mappers/review.ts`); the rest pass
JSON through. Each card carries `projected_intervals` (`{ grade: seconds_until_due }`)
straight from the backend scheduler — the frontend does no SM-2 of its own.

## Auth pattern for protected routes

There is no Next.js middleware. Each protected handler resolves auth itself via
`backendFetch` / `requireAccessToken` (`src/shared/api/serverAuth.ts`), which prefers a
cached httpOnly `access_token` cookie and only exchanges the refresh token when that's
absent. See [AUTH.md](AUTH.md#no-middleware) for why the middleware was removed.

## SSE streaming (`/api/ai-overview`)

1. Receives `{ sentence, tokens }` JSON body
2. Detects language from token POS tags
3. Calls OpenRouter with `stream: true`; model defaults to `deepseek/deepseek-v4-flash` (override with `OPENROUTER_MODEL`)
4. Re-emits each `delta.content` chunk as `data: {"content":"…"}\n\n`
5. Terminates with `data: [DONE]\n\n`
6. Falls back to a deterministic mock if `OPENROUTER_KEY` is unset or OpenRouter returns an error
