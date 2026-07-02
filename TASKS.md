# Tasks — Phase 2

> Phase 1 is complete and archived in [TASKS.archive.md](TASKS.archive.md) (build,
> redesign, refactor, docs, Anki, highlighting, SEO). This file tracks the next round.
> Same conventions: one slice per heading, a `Done when` line per slice, `path:line`
> references in prose, markdown links elsewhere. Stop and confirm between slices.

---

## 🧪 MOCK — Mockable dev backend (`npm run dev:mock`)

> **Goal:** run the entire frontend with **no FastAPI and no OpenRouter** behind it.
> `npm run dev:mock` boots Next.js exactly as `npm run dev` does, but every server-side
> call to the backend is served by in-repo mock handlers. Useful for UI work, demos,
> Storybook-adjacent manual testing, and onboarding without a Postgres/FastAPI stack.

**Key architecture fact (don't fight it):** the browser never calls FastAPI directly — it
only calls the BFF route handlers under `src/app/api/*`. Those handlers are the *only*
caller of the backend, and they all do it the same way: a server-side `fetch()` to
`` `${BACKEND_URL}/…` `` where `BACKEND_URL` comes from `src/shared/api/backend.ts`. So the
correct seam is the **server-side upstream `fetch`**, not the browser. Intercept there and
all the real BFF logic still runs: the refresh-token exchange in `src/shared/api/serverAuth.ts`,
the snake_case→camelCase mappers in `src/app/api/dictionary/route.ts` and
`src/features/Review/api/mappers.ts`, error/status mapping — only FastAPI itself is faked.

**Consequence:** mock handlers must speak the **backend's snake_case contract** (e.g.
`{ surface, dictionary_form, reading, pos, jlpt_level, hsk_level, pinyin }` for analyze;
`{ id, expression, reading, meaning, jlpt_level, status, added_at }` for vocabulary), **not**
the frontend's camelCase shape. The BFF does the translation.

**Decisions baked in:**
- **Tool:** [MSW](https://mswjs.io) (`msw/node` `setupServer`). Standard request-matching,
  no per-route edits. Add as a `devDependency`.
- **Toggle:** gate on `MOCK_BACKEND=1` so a stray import never leaks mocks into prod.
- **State model:** **in-memory store**, seeded from fixtures, mutated by POST/PATCH/DELETE,
  reset on server restart. More realistic than static fixtures for add/delete/grade flows.
  (Rejected: a standalone mock server process on `:8000` — more moving parts, and it
  wouldn't exercise the BFF's own fetch path the same way.)

### MOCK.1 — Wiring & toggle
- [x] Add `msw` to `devDependencies` (`npm i -D msw`).
- [x] Add script to `package.json`: `"dev:mock": "MOCK_BACKEND=1 next dev"`.
- [x] Create `instrumentation.ts` (Next runs it once at server startup). **Note:** this
  project uses a `src/` dir, so Next looks for `src/instrumentation.ts`, not the project
  root — the root copy is silently ignored (register never fires). Start the mock server
  only server-side and only when toggled:
  ```ts
  export async function register() {
    if (process.env.MOCK_BACKEND === '1' && process.env.NEXT_RUNTIME === 'nodejs') {
      const { server } = await import('./src/mocks/server');
      server.listen({ onUnhandledRequest: 'warn' });
    }
  }
  ```
  Verify `next.config.ts` doesn't need `experimental.instrumentationHook` on Next 15.2 (it's
  on by default in 15; confirm and note it). **Confirmed:** instrumentation is stable on
  Next 15 — no `experimental.instrumentationHook` flag added; `next.config.ts` unchanged.
- [x] `src/mocks/server.ts` — `import { setupServer } from 'msw/node'` + `export const server = setupServer(...handlers)`.
  (`src/mocks/handlers.ts` added as an empty `RequestHandler[]` placeholder so the import
  compiles; populated in MOCK.2.)

### MOCK.2 — Handlers (backend snake_case contract)
> Cover every upstream the BFF hits. Cross-check against `docs/BFF.md`'s route table and
> the `fetch(\`${BACKEND_URL}/…\`)` call sites (grep `BACKEND_URL` under `src/app/api`).

- [x] `src/mocks/handlers.ts` — handlers matched against `` `${BACKEND_URL}/api/*` ``:
  - **Auth** — `POST /api/auth/login`, `/api/auth/register`, `/api/auth/refresh`. This is
    the fiddly part: middleware (`src/middleware.ts`) verifies the `refresh_token` cookie
    with JOSE **before** protected handlers run, and the handlers then re-exchange it via
    `getAccessToken` in `src/shared/api/serverAuth.ts`. The mock must mint a `refresh_token`
    that actually verifies against `JWT_SECRET`, and `/api/auth/refresh` must return
    `{ access_token }`. Treat "log in against the mock, then load the dictionary" as the
    acceptance test for this handler.
  - **Analyze** — `POST /api/analyze` → `{ tokens: BackendToken[] }` in snake_case
    (`surface`, `dictionary_form`, `reading`, `pos`, `jlpt_level`, `hsk_level`, `pinyin`).
    Branch on the request body `language` (`jp` vs `cn`) so CN returns `pinyin`.
  - **Vocabulary** — `GET/POST /api/vocabulary`, `DELETE/PATCH /api/vocabulary/{id}`,
    backed by the in-memory array so add/delete/status persist across navigation.
  - **History** — `GET/POST/DELETE /api/history`, `DELETE /api/history/{id}`.
  - **Review** — `GET /api/review/queue` (honor `language`, `limit`), `GET /api/review/stats`
    (honor `language`), `POST /api/review/{id}` (body `{ grade }`), `.../suspend`,
    `.../unsuspend`. Each card must include `projected_intervals` (`{ grade: seconds }`) —
    the frontend does no SM-2 of its own (see `docs/BFF.md`).
  - **OpenRouter** (`POST https://openrouter.ai/api/v1/chat/completions`) — **optional.**
    `src/app/api/ai-overview/route.ts` already falls back to a deterministic mock when
    `OPENROUTER_KEY` is unset, so the simplest path is to leave `OPENROUTER_KEY` out of
    `.env.local` under `dev:mock` and skip this handler. If you want streamed output,
    stub an SSE response that emits a couple of `data: {...}` chunks then `data: [DONE]`.

### MOCK.3 — Fixtures & state
- [x] `src/mocks/db.ts` — the in-memory store (arrays of vocabulary, history, review cards)
  with helper mutators. Seed from `src/mocks/fixtures.ts` on module load.
- [x] `src/mocks/fixtures.ts` — a believable seed: ~8–10 saved words (mixed JLPT/HSK,
  mixed status), a few history entries, a small review queue with non-trivial
  `projected_intervals`, and at least one CN-language word so the hanzi path is exercisable.
  Reuse the snake_case shapes from the BFF route files as the source of truth.

### MOCK.4 — Docs & verify
- [x] Add a "Run with a mocked backend" recipe to `docs/RUNBOOK.md` (next to the existing
  "Spin up dev against a local backend" / "Point at a remote backend" sections): what
  `npm run dev:mock` does, the `MOCK_BACKEND` toggle, where handlers live, and the
  in-memory-resets-on-restart caveat.
- [x] Note the mock layer in `docs/BFF.md` (one line: "under `MOCK_BACKEND=1` the upstream
  `fetch` is intercepted by `src/mocks/*` — see RUNBOOK").
- [x] `git grep`-verify no mock module is imported outside `instrumentation.ts` /
  Storybook, so production bundles never pull in `msw`. (Only `src/instrumentation.ts`
  imports `src/mocks/*`, via a dynamic `import()` inside the `MOCK_BACKEND` guard.)
- [x] **Done when:** verified 2026-06-30 with nothing on `:8000` — `npm run dev:mock` parses
  a sentence (JP and CN), registers + logs in, adds a word that survives a reload, and
  grades a review card so the queue drains and the stats partition updates (due 2→1,
  learned 0→1) — all offline, while plain `npm run dev` still hits the real backend
  (ECONNREFUSED to `:8000`) exactly as before. Full `tsc --noEmit` clean.

### MOCK.5 — (Optional) share handlers with Storybook & tests
- [ ] `StrokeOrder` stories and any future network-touching stories already want stubbed
  requests (see archive S3). If the handler set generalizes, expose a browser entrypoint
  (`msw/browser` `setupWorker` + `public/mockServiceWorker.js`) and reuse `handlers.ts`
  in `.storybook/preview` and in Vitest setup. Keep this optional — don't block MOCK.1–4.

---

## ✨ A — Liveliness & Motion (carried over from Phase 1)

> Genuinely-open Phase 1 slice. Full spec — A0 foundation through A7 verify, with the
> per-task `Done when` lines and the reduced-motion non-negotiables — lives in
> [TASKS.archive.md](TASKS.archive.md) under "✨ A — Liveliness & Motion". Execution order
> is unchanged: **A0 → A1 → A2 → (A3, A4, A5, A6 any order) → A7.** A0 is mandatory-first
> (everything imports `src/shared/motion` and the reduced-motion guard).

- [ ] **A0** — Motion foundation: `src/shared/motion/index.ts` (durations/eases/variants),
  global `prefers-reduced-motion` guard in `globals.css`, fix `Card.tsx`'s re-firing
  `whileInView`.
- [ ] **A1** — Results breathe in: stagger + `AnimatePresence` swap-out + skeleton crossfade in `CardList`.
- [ ] **A2** — Review card flip + directional grade-fling (`src/features/Review/ui/ReviewCard.tsx`).
- [ ] **A3** — Count-up numbers in `StudyDashboard`.
- [ ] **A4** — Accordions animate `height: auto`; smooth AI-overview streaming growth.
- [ ] **A5** — Search-history dropdown enter/exit; sliding active-nav indicator.
- [ ] **A6** — Micro-interactions (save-word pop, button tap, token hover).
- [ ] **A7** — Stories for the moving parts + reduced-motion checks; `npm run test:storybook` green.

---

## 🧹 Carryover — small open items from Phase 1

- [x] **R7** — `src/shared/utils/logEffectFailures.ts` exists and no `fail.watch` call sites
  remain in `src/features/*` (verified 2026-06-30). Effectively done; kept here for the record.
- [ ] **R9 (optional)** — pre-commit hook via `husky` + `lint-staged` running `lint:fix` +
  `format`. Left out in Phase 1; pick up only if wanted.
