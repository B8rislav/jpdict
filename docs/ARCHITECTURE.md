# Architecture

## Data flow

```
Browser
  │
  ├─► src/app/page.tsx (Client Component — "use client")
  │     Effector effects triggered by user action
  │
  ├─► src/app/api/*  (Next.js Route Handlers — BFF)
  │     Thin proxies: attach auth headers, forward to FastAPI
  │     Exception: /api/ai-overview calls OpenRouter directly (no FastAPI)
  │
  ├─► FastAPI backend  (http://localhost:8000 by default)
  │     Auth, vocabulary, search history, sentence parsing
  │
  └─► OpenRouter API  (https://openrouter.ai)
        AI explanation stream for /api/ai-overview
```

## Next.js App Router — RSC vs Client Components

All page-level components are **Client Components** (`'use client'`): they use Effector hooks
(`useUnit`, `useList`) which require a browser runtime. The root layout
(`src/app/layout.tsx`) is a Server Component — it loads fonts and sets up `<Providers>`.

There are no RSC data-fetching patterns in use today. All data flows through Effector
effects in the client.

## BFF pattern

Every call that needs the backend goes through a Next.js route handler under
`src/app/api/`. The browser never talks to FastAPI directly. Benefits: CORS is a
non-issue, the `FASTAPI_URL` env var stays server-side, and cookies can be forwarded
transparently.

The backend base URL is resolved in `src/shared/api/backend.ts`:
```
NEXT_PUBLIC_BACKEND_URL  →  FASTAPI_URL  →  http://localhost:8000
```

## Effector store layout

- `src/stores/*` — global stores shared across features: `auth.ts`, `userProfile.ts`
- `src/features/*/model/index.ts` — slice-local stores scoped to one feature

Effects (async operations) live next to their stores. They are called from container
components or from page.tsx directly.

## Container / view boundary (R3)

Each feature that has UI is split:

- `src/features/<Feature>/<Feature>.tsx` — **container**: imports stores, triggers effects, passes derived data down as props
- `src/features/<Feature>/ui/<FeatureView>.tsx` — **pure view**: no store imports, receives all data via props, testable in Storybook

## SSE streaming

The AI explanation for a parsed sentence is delivered as a Server-Sent Events stream:

1. `src/features/Sentence/api/fetchAIOverview.ts` — opens a `ReadableStream` fetch to `/api/ai-overview`
2. `src/app/api/ai-overview/route.ts` — BFF handler: calls OpenRouter with `stream: true`, re-emits `data: {"content":"…"}` chunks, terminates with `data: [DONE]`
3. `src/features/Sentence/ui/AIOverviewAccordion.tsx` — reads the stream chunk by chunk, accumulates markdown text, renders with `react-markdown`

If `OPENROUTER_KEY` is not set the handler returns a deterministic mock response so the
UI still works in dev without credentials.

## Auth cookies

The `refresh_token` lives in an **httpOnly cookie** set by FastAPI via the login
response's `set-cookie` header. The Next.js BFF proxies this header through to the
browser unchanged. The access token is held **in memory only** (`$accessToken` Effector
store, never written to localStorage or a cookie). On every page load `refreshFx` is
called (see `src/app/page.tsx:46`) to exchange the cookie for a fresh access token.
