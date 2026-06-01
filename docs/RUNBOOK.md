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

Open DevTools → Application → Cookies → delete `refresh_token`. Reload. `refreshFx`
will fail silently, `$isAuthenticated` stays false.

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
