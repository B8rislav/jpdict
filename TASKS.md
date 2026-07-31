# Tasks — Phase 2

> Phase 1 is complete and archived in [TASKS.archive.md](TASKS.archive.md) (build,
> redesign, refactor, docs, Anki, highlighting, SEO). This file tracks the next round.
> Same conventions: one slice per heading, a `Done when` line per slice, `path:line`
> references in prose, markdown links elsewhere. Stop and confirm between slices.

---

## 🎨 HOME — Home page redesign (Celadon Zen)

> **Goal:** rebuild the home page to the approved mock — a pinned app header (brand ·
> 日本語/中文 · nav · actions), a tinted search band, and a two-column results area
> (breakdown | detail). The visual layer lands in **Designoslav**; jpdict only wires
> state into slots and owns the page grid.
>
> **Key architecture fact (don't fight it):** `designoslav` is installed **from GitHub**,
> not from the local checkout at `~/Documents/designoslav`. Lib changes reach this repo
> only after a push + `npm update designoslav` — so HOME.0–HOME.3 must all land and be
> pushed (HOME.4) before any of HOME.5+ can compile. The lib also has **zero runtime
> dependencies** (react peer only): no `motion`, no `next/link`. Anything needing those
> stays app-side or is exposed through a slot / an `as` prop.
>
> **Decisions baked in** (from the design review — don't relitigate without saying so):
> - **Scope:** header mounts in `src/app/layout.tsx`, so all four routes get it. Only the
>   **home body** is restyled; `/dictionary`, `/study`, `/settings` keep their bodies.
> - **Type:** `--do-font-sans` = Golos Text · `--do-font-serif` = Noto Serif JP (its
>   `cyrillic` subset is confirmed present in next/font's `font-data.json`) ·
>   `--do-font-cjk` = Noto Sans JP/SC. Serif is **display-only**: `SectionHeading`, the
>   WordCard/KanjiCard headwords, the brand lockup. CN mode overrides serif to Noto Serif SC.
> - **Name:** the lockup renders 言葉ラボ / KOTOBA LAB, but **metadata stays JapChin Dict** —
>   the rename is deliberately deferred. `Brand` takes every string as a prop so it's a
>   one-line change later.
> - **Locale switch:** the mock has none, so a ⚙ action links to `/settings`, which gains
>   the RU/EN switcher it never had. (`/settings` is currently linked from nowhere.)
> - **Modes:** sentence → breakdown | word detail. word → matches | word detail.
>   kanji → single centered `KanjiCard`, no left column (undesigned case, kept minimal).
> - **Motion:** card entrance becomes **CSS stagger inside the lib's `EntryList`**, because
>   `EntryList` owns its own `<ul>/<li>` and the lib can't depend on `motion`. This
>   supersedes the `CardList` half of **A1** below.
> - **Pinning:** header pins; **neither column pins** — a `position: sticky` WordCard taller
>   than the viewport makes its own footer unreachable.
> - **Gravity:** removed from touched files only. The global imports in
>   `src/app/layout.tsx` stay for the three unmigrated routes.

### HOME.0 — Designoslav: type tokens
- [x] `--do-font-serif` added to `src/tokens/tokens.css` (display-only; doc comment states
  the CN-override contract). `--do-font-sans` switched from the never-loaded `'Inter'` to
  `'Golos Text'` — the old stack was a latent bug: nothing in either repo ever loaded Inter,
  so all Cyrillic UI text was rendering in Noto Sans JP's Cyrillic glyphs.

### HOME.1 — Designoslav: new primitives
- [x] **`Switch`** — `role="switch"` button, label and track as one hit target and one tab
  stop; `m`/`l`; controlled. Not a `SegmentedControl`: that one is a `radiogroup` picking one
  of N *values*, and can't draw a thumb-on-track. Also unblocks the two Gravity `Switch`es in
  `src/app/settings/page.tsx:46`.
- [x] **`Skeleton`** — `text`/`block`/`circle`, `lines` for a stacked paragraph,
  `aria-hidden` (the pending state belongs to the caller's live region), shimmer suppressed
  under `prefers-reduced-motion`. Replaces Gravity `Skeleton` in the touched files.
- [x] **`Brand`** — tile mark + wordmark + caps subtitle, all props; polymorphic `as` so the
  lockup can be a router link.
- [x] **`NavLink`** — nav item with the active underline; `active` drives
  `aria-current="page"`; polymorphic `as` so jpdict passes `as={Link}` and keeps client-side
  navigation (the lib can't import `next/link`). `Brand` and `NavLink` both extend
  `AnchorHTMLAttributes` rather than `HTMLAttributes`, so `href` typechecks under `as`.

### HOME.2 — Designoslav: slotted shells
- [x] **`AppHeader`** — the bar: background, height, bottom border, horizontal rhythm.
  Slots: `brand`, `center`, `nav`, `actions`. `sticky` is a prop, not a hardcode; when set it
  takes `z-index: 20`, deliberately under jpdict's search popover at 30.
- [x] **`SearchBand`** — the tinted band behind search: `eyebrow`, `children` (the field),
  `hint`, `aside` (the furigana toggle). Diagonal texture from a tokenised
  `repeating-linear-gradient` on a `::before` layer. The field is capped at 840px while the
  footer runs the full 1120px measure, which is what puts the hint and the toggle at
  opposite edges as drawn.
- [x] Stories for both, composed with the real `SearchField` / `SegmentedControl` / `Brand`
  so the review surface is the actual header and band, not boxes.

### HOME.3 — Designoslav: apply the new type + entrance
- [x] `EntryList` items get a CSS fade+lift with `nth-child` `animation-delay`, capped
  at the 8th item, zeroed under `prefers-reduced-motion`.
- [x] Serif applied to exactly four places: `SectionHeading`, `WordCard`'s `.word`,
  `KanjiCard`'s `.kanji`, and `Brand`. `SentenceView` tokens and `EntryCard` headwords stay
  in the CJK sans — mincho at list sizes is harder to read.
- [x] `.storybook/preview-head.html` loads the four faces from Google Fonts. Storybook-only:
  the package names fonts in tokens but never fetches them, so without this every story
  reviews in a fallback — which is where type problems hide.
- [x] Export everything from `src/index.ts`; `npm run typecheck`, `npm run lint`,
  `npm run format` and the story suite green (**94 tests / 23 files**). Note: `npm run test`
  OOMs (exit 137) on a 8GB box with parallel browser workers — run
  `npx vitest run --no-file-parallelism --maxWorkers=1`.
- [x] **Done when:** reviewed in Designoslav's Storybook and approved 2026-07-30.

### HOME.4 — Publish the lib
- [x] Pushed by hand (`0b53273 prepared lib to main page redesign`) + `npm update designoslav`.
  Verified all six components and the new tokens are present in `node_modules/designoslav`.

### HOME.5 — jpdict: fonts & layout shell
- [x] Fonts declared in a new `src/app/fonts.ts` (five faces incl. Noto Serif SC) rather than
  in `layout.tsx` — that file is capped at `max-lines: 100` and was already at 86.
- [x] **Trap worth remembering:** the serifs are loaded at **two weights (400/600), not four**.
  Google splits a CJK family into ~100 unicode-range files *per weight*; four weights of
  Noto Serif JP + SC hit `ETIMEDOUT`, and `next/font` answers that by silently falling back
  to Georgia — the build stays green while the serif is fake. Verified the real fix by
  counting `.next/static/media` (454 woff2, 23MB). Documented in `docs/STYLING.md`.
- [x] `globals.css` binds `--do-font-sans/serif/cjk` to the loaded faces and adds the
  `[data-lang='cn']` serif override. `body` now reads in the sans, not the CJK face.
- [x] `<AppNav />` mounted in `layout.tsx` above `{children}` — all four routes inherit it.

### HOME.6 — jpdict: header container
- [x] `AppNavView` rebuilt onto `AppHeader` + `Brand` + `SegmentedControl` + `NavLink`;
  active link from `usePathname()`. Brand strings in `src/features/AppNav/constants.ts`.
- [x] Furigana/pinyin `Switch` moved out of the nav into the band.
- [x] RU/EN switcher added to `src/app/settings/page.tsx` (function only).
  `AppNavView.stories.tsx` rewritten around the new props.

### HOME.7 — jpdict: search band
- [x] `SearchView` wraps its field in `SearchBand`; popover keeps its `AnimatePresence`.
- [x] **Unplanned but required:** the lib update renamed `SearchOptionList`'s `selectedId`
  to `activeId` and moved the combobox keyboard contract into `SearchField`
  (`listboxId`/`expanded`/`optionIds`/`activeOptionId`/`onOptionCommit`/`onDismiss`), plus a
  built-in `hints` footer. `SearchView` now delegates ↑↓/Home/End/Enter/Escape instead of
  hand-rolling them — this also closes the `SearchOptionList` footer item in **SS.7**.
  The field is `role="combobox"` now, not `searchbox`; its story had to follow.

### HOME.8 — jpdict: results
- [x] New `src/features/SearchResults/` — container derives the mode from *which store has
  results* rather than tracking it, so there's nothing to keep in sync; sentence wins over
  word because clicking a token also fills `$words`.
- [x] Auto-select lives in `SentenceCard` (it owns `selectedId`), via
  `src/features/Sentence/lib/firstContentToken.ts`.
- [x] Word mode needed a new `inspectWord` event in the WordInspector model — `$inspectedWord`
  could previously only be set by `fetchWordsFx.doneData`, so the other paginated matches
  were unreachable once the list stopped rendering them all.
- [x] `EmptyState` + `useExamples`; `src/app/page.tsx` down to 25 lines from ~95.

### HOME.9 — jpdict: sentence column
- [x] `SentenceCardView` restyled: `SectionHeading` → `SentenceView` → AI accordion →
  `EntryList`. Dropped the `Card` wrapper and Gravity `Text`.

### HOME.10 — Cleanup
- [x] Deleted `src/shared/ui/CardList/`, `src/app/page.module.css`, and the `--column-bg-*`
  tokens. `src/shared/ui/Card/` kept for `ReviewCard`.
- [x] Gravity out of `AppNavView`, `SentenceCardView`, `AIOverviewAccordion` and
  `WordInspectorView`. The raw `rgba()` literals in `AIOverviewAccordion.module.css` that
  `<Text>` used to sit on became `--do-*` tokens.
- [x] **Pre-existing bug fixed in passing:** `LanguageCard.tsx` imported
  `../LanguageSelect.module.css`, deleted in an earlier refactor. `css-modules.d.ts` declares
  `*.module.css` as a wildcard, so it type-checked and only failed at runtime — both
  LanguageSelect stories had been failing to load. Repointed at `./LanguageSelectView.module.css`,
  which already holds the four classes.

### HOME.11 — Docs & verify
- [x] `docs/UX.md` — empty-state rewritten; added the results|detail table, the auto-select
  rule and the no-sticky-columns rationale.
- [x] `docs/STYLING.md` — new Typography section (three tokens, display-serif rule, the
  "load what you name" lesson from the Inter bug); CJK section covers the CN serif override.
- [x] `npm run verify` green (lint + check:stories + tsc + 105 unit tests),
  `npm run build` succeeds, storybook suite **26 files / 107 tests** green.
- [ ] **Done when:** the running app matches the mock in `ru`/`en` × `jp`/`cn`, signed in and
  signed out. **Awaiting your review in the browser.**

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
  **Superseded by HOME.3/HOME.10** — `CardList` is deleted and the stagger moves into
  Designoslav's `EntryList` as CSS, since the lib can't depend on `motion`.
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

---

## 🔎 SEARCH-SUGGEST — Search «варианты разбора» + unified history

> Rebuild search onto the Designoslav `SearchField` + `SearchOptionList`. A typed query
> shows backend parse options («Варианты разбора»); an empty focused field shows recent
> searches («История поиска») in the same list. Backend counterpart: `backend` Phase 18.

- [x] **SS.1** `SuggestOption`/`SuggestKind` type in `src/shared/api/types.ts`; suggestions
  Effector model `src/features/Search/model/suggest.ts` (`$suggestions`, `fetchSuggestFx`,
  `clearSuggestions`) hitting the BFF `/api/search/suggest`.
- [x] **SS.2** BFF proxy `src/app/api/search/suggest/route.ts` (public — mirrors
  `parse-sentence`), forwarding `q`/`lang`/`def_lang` to FastAPI.
- [x] **SS.3** `optionMapping.ts` (+ test): `suggestionToItem` / `historyToItem` →
  `SearchOptionItem`, composing the hint from `kind`/`gloss`/`level` + i18n (`HINT_BY_KIND`
  map). Extend `HistoryItem` with a narrowed `query_type` (`HistoryQueryType`).
- [x] **SS.4** `SearchView` rewrite onto `SearchField` + `SearchOptionList`: absolutely
  positioned popover, ↑↓ selection / Enter parses / Esc closes, «↑↓ выбрать · ↵ разобрать»
  caption, «Очистить всё» in the history heading. `Search` container: debounced
  `fetchSuggestFx`, empty→history / typing→suggestions, run option by `query_type`.
- [x] **SS.5** i18n keys (`suggest_*`, `history_*`, `unit_label_*`, `search_kbd_*`,
  `search_aria_label`, `search_clear`) in `ru.json` + `en.json`; reuse existing `pos_verb`.
- [x] **SS.6** Retire `SearchHistoryDropdown` (+ css); keep the history model. Rewrite
  `SearchView.stories.tsx` (Empty / ParseOptions / WithHistory / Submitting).
- [ ] **SS.7** (follow-up) Regenerate `src/shared/api/generatedTypes.d.ts` against the live
  backend once it's running; optional Designoslav `SearchOptionList` `footer` prop so the
  keyboard caption sits inside the card; per-row history delete needs a `SearchOption`
  affordance (dropped for now — `removeHistoryFx` retained in the model).
