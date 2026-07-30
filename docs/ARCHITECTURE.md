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

All page-level components are **Client Components** (`'use client'`): they use Effector
hooks (`useUnit`) which require a browser runtime. The root layout
(`src/app/layout.tsx`) is a Server Component — it loads fonts, resolves the visitor's
profile from the cookie, sets `<html lang>`, and renders `<Providers>`.

There are no RSC data-fetching patterns in use today. All data flows through Effector
effects in the client.

### Why effector stores are never written on the server

Effector stores are module-level singletons, so in a Node server process they are shared
by every concurrent request. Writing one during SSR would leak one visitor's state into
another's HTML. The app therefore uses **no `fork()` in application code** (only in
tests, for isolation) and instead passes anything the server needs to render as props:

```
cookie ──► readProfile()  (src/shared/api/serverProfile.ts, server)
             │
             └─► <Providers initialProfile={…}>   (src/app/providers.tsx, client)
                   ├─► <ProfileProvider>  →  useProfile()
                   └─► <LocaleProvider>   →  useT() / useLocale()
```

First client render reads the same prop the server did, so the markup matches; after
mount the effector store takes over so preference changes propagate. If RSC data
fetching is ever introduced, this needs revisiting — see `docs/STATE.md`.

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

- `src/stores/*` — genuinely cross-feature state only: `auth.ts`, `userProfile.ts`
- `src/features/*/model/index.ts` — slice-local stores scoped to one feature

Effects (async operations) live next to their stores. They are called from container
components.

A store that only one feature uses belongs in that feature, not in `src/stores`. The
review/SRS store used to sit in `src/stores/review.ts` while importing from
`src/features/Review/api` — a top-level module depending on a feature. It now lives at
`src/features/Review/model/index.ts` and is re-exported from the feature barrel.

## Container / view boundary

Each feature that has UI is split:

- `src/features/<Feature>/<Feature>.tsx` — **container**: reads stores, triggers effects,
  passes derived data down as props
- `src/features/<Feature>/ui/<Feature>View.tsx` — **pure view**: no store imports,
  everything via props, renderable in Storybook

### How it's enforced

Three mechanisms, because none alone is sufficient:

1. **`no-restricted-imports` on a whitelist** (`eslint.config.mjs`). Every `.tsx` under
   `src/features` and `src/shared` is banned from importing `effector`,
   `effector-react`, or `@/stores/*` — *except* the container files named in
   `STATEFUL_FILES`. This replaced a rule that denied those imports inside `**/ui/**`,
   which any component could escape by not living in a `ui/` folder. Five did.
2. **`max-lines: 100`** on containers, pages, and layouts. Logic files earn a size
   budget instead of a purity rule; over budget means a view is waiting to come out.
3. **`npm run check:stories`** (`scripts/check-view-stories.mjs`) fails if any component
   under a `ui/` folder has no sibling `*.stories.tsx`. A view nobody can render in
   isolation isn't a view. Deliberate exceptions live in that script's `EXEMPT` set.

`npm run verify` runs all three plus `tsc` and the unit tests.

## SSE streaming

The AI explanation for a parsed sentence is delivered as a Server-Sent Events stream:

1. `src/features/Sentence/api/fetchAIOverview.ts` — opens a `ReadableStream` fetch to `/api/ai-overview`
2. `src/app/api/ai-overview/route.ts` — BFF handler: calls OpenRouter with `stream: true`, re-emits `data: {"content":"…"}` chunks, terminates with `data: [DONE]`
3. `src/features/Sentence/ui/AIOverviewAccordion.tsx` — reads the stream chunk by chunk, accumulates markdown text, renders with `react-markdown`

If `OPENROUTER_KEY` is not set the handler returns a deterministic mock response so the
UI still works in dev without credentials.

## Auth cookies

Three cookies, each with one job:

| Cookie | Set by | httpOnly | Purpose |
|--------|--------|----------|---------|
| `refresh_token` | FastAPI, proxied through the BFF | yes | The session. 7-day lifetime |
| `access_token` | the BFF (`src/shared/api/serverAuth.ts`) | yes | Cache of the 15-minute backend token, so protected routes stop re-minting one per request |
| `profile` | the client, and re-stamped by `/api/users/me` | no | Cache of the DB profile, readable during SSR |

**The browser holds no token of its own.** Every browser→backend call goes through the
BFF, which authenticates with the `refresh_token` cookie and forwards
`Authorization: Bearer` upstream. "Am I signed in?" is answered by whether
`GET /api/users/me` returns a user — the same request that supplies the nav's user label
and the stored profile.

This replaced a `$accessToken` effector store that was fetched on every page load, held
in memory, never sent anywhere, and read only to compute a boolean. `refreshFx` fired
from two places (`page.tsx` and `AuthGate`) and raced itself.

There is **no Next.js middleware**. It used to verify the refresh JWT before protected
handlers ran, which duplicated the check the handler then made anyway and required
`JWT_SECRET` to be byte-identical to the backend's `SECRET_KEY` across two repos — with
no validation on the frontend side. `requireAccessToken` returns its own 401.

### Round-trip cost

Loading `/dictionary` costs 2 backend calls (vocabulary + stats). It was 4: each
protected route re-minted a 15-minute access token, at the cost of a FastAPI call plus a
`SELECT` on `users`, then discarded it. `backendFetch` re-mints once and retries if a
*cached* token is rejected, so a stale cookie degrades to one extra round trip rather
than a spurious logout.
