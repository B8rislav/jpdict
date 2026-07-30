# Runbook

## Spin up dev against a local backend

```sh
cd frontend
npm install
npm run dev          # starts Next.js on http://localhost:3000
```

The frontend expects the FastAPI backend at `http://localhost:8000`. Start the backend
separately (see `backend/` readme). No env vars are required for the basic dev flow.

## Point at a remote backend

Set one of these env vars before running `npm run dev` (or in `.env.local`):

```sh
# Preferred: used server-side and in the browser (for direct client calls, if any)
NEXT_PUBLIC_BACKEND_URL=https://api.example.com

# Server-side only (not exposed to browser bundles)
FASTAPI_URL=https://api.example.com
```

Resolution order: `NEXT_PUBLIC_BACKEND_URL` → `FASTAPI_URL` → `http://localhost:8000`
(see `src/shared/api/backend.ts`).

## Run with a mocked backend

```sh
cd frontend
npm run dev:mock     # = MOCK_BACKEND=1 next dev, on http://localhost:3000
```

Runs the whole frontend with **no FastAPI and no OpenRouter** behind it — useful for UI
work, demos, and onboarding without a Postgres/FastAPI stack. The BFF route handlers under
`src/app/api/*` still run exactly as in real dev; only their server-side upstream `fetch`
(to `BACKEND_URL` and to OpenRouter) is intercepted, by [MSW](https://mswjs.io).

- **Toggle:** the `MOCK_BACKEND=1` env var. With it unset, `npm run dev` behaves exactly as
  before — the mock layer never loads.
- **Where it lives:** `src/instrumentation.ts` starts the mock server at startup (it lives
  in `src/`, not the project root, because this app uses a `src/` dir). Handlers are in
  `src/mocks/handlers.ts`; the seeded in-memory store and fixtures are in `src/mocks/db.ts`
  and `src/mocks/fixtures.ts`. Handlers speak the backend's snake_case contract — the BFF
  does the camelCase translation.
- **State:** in-memory, seeded from fixtures. Adds/deletes/grades persist across navigation
  but **reset on every server restart** — there's no database.
- Auth works against the mock: `register` then `log in`. Nothing on the frontend verifies
  the token's signature any more (the middleware that did is gone, along with
  `JWT_SECRET`), so the mock just has to mint something JWT-shaped. `GET /api/users/me`
  returns the mock user and profile.

## Enable AI explanations

```sh
OPENROUTER_KEY=sk-or-…  npm run dev
# Optional: override the default model
OPENROUTER_MODEL=anthropic/claude-3-haiku  npm run dev
```

Without `OPENROUTER_KEY`, the `/api/ai-overview` route returns a static mock.

## Regenerate API types from FastAPI

With the backend running on localhost:8000:

```sh
npm run generate-types
# writes to src/shared/api/generatedTypes.d.ts
```

Commit the result; do not edit `generatedTypes.d.ts` by hand.

## Clear localStorage to simulate a fresh user

Open browser DevTools → Application → Local Storage → `http://localhost:3000` → delete
the `userProfile` key. Reload. The store will reset to defaults (no language selected,
furigana on, UI locale ru).

## Simulate a logged-out session

Open DevTools → Application → Cookies → delete `refresh_token` **and** `access_token`
(the latter is a 15-minute cache and will keep working on its own otherwise). Reload:
`GET /api/users/me` returns 401, `$currentUser` resolves to `null`, `$isAuthenticated`
stays false, and `$sessionResolved` still flips to true so gated pages render their
sign-in prompt rather than hanging.

To reset preferences too, delete the `profile` cookie.

## Debug a stuck Effector chain

1. In the browser console, import the store you want to watch:
   ```js
   // (only works if the store is exported from a module loaded by the app)
   // Instead, add a temporary watch in the source file:
   ```
2. Add a temporary `store.watch(console.log)` or `effect.fail.watch(console.error)` in
   the relevant model file. Effector logs every update synchronously.
3. Use `logEffectFailures` from `src/shared/utils/logEffectFailures.ts` for a
   one-liner:
   ```ts
   import { logEffectFailures } from '@/shared/utils/logEffectFailures';
   logEffectFailures(myEffect); // logs to console on every .fail event
   ```
4. The Effector DevTools browser extension (`effector-devtools`) can visualise the
   whole graph if installed.

## Run tests

```sh
npm run test               # Vitest unit tests
npm run test:storybook     # Storybook component tests
npm run storybook          # dev server for visual inspection (http://localhost:6006)
```

## Build for production

```sh
npm run build
npm run start
```

Check for type errors before deploying:
```sh
npx tsc --noEmit
```
