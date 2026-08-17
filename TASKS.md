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

---

## 📚 DICT — Dictionary page redesign (decks, filters, virtualized lists)

> **Goal:** rebuild `/dictionary` to the approved mock — a `辞書 Словарь` heading with a
> totals line, two **deck cards** (Кандзи 漢字 / Слова 単語) showing today's workload and
> progress, a filter bar (search + level + status + «Показано: N»), and the open deck's
> collection below: virtualized rows for words, a virtualized grid of tiles for kanji.
> Backend counterpart: `backend` Phase 20.
>
> **Key architecture fact (don't fight it):** `designoslav` is installed **from GitHub**,
> not from the local checkout at `~/Documents/designoslav`. DICT.0–DICT.3 must all land
> and be pushed (DICT.4) before DICT.5+ can compile.
>
> **Decisions baked in** (from the design review — don't relitigate without saying so):
> - **▶ is browser TTS** — `window.speechSynthesis` with a `ja-JP`/`zh-CN` voice. No
>   backend, no audio files. The button must degrade honestly when no voice exists (it
>   commonly doesn't on Linux), not fail silently.
> - **Decks are `card_type` on the backend**, not a client-side heuristic. The kanji deck
>   is real saved data, added from two places: the `action` slot designoslav's `KanjiCard`
>   already exposes, and the constituent-kanji rows in `WordInspector`.
> - **The open deck lives in the URL** (`/dictionary?deck=kanji`), so it survives reload
>   and is linkable. Filters, search and paging join it there.
> - **Search, filters and paging are server-side.** `useDictionaryFilters`
>   (`src/features/Dictionary/model/useDictionaryFilters.ts`) stops being a client filter
>   and becomes query-param state — filtering one page client-side would make
>   «Показано: N» lie.
> - **`$savedWords` is retired.** It cannot be both the page's paged list and the global
>   saved-set. The "saved ✓" checks in `WordCard`/`WordInspector` move to a batched
>   backend call (`GET /api/vocabulary/saved`).
> - **Virtualization lives in designoslav**, via the already-installed but so-far-unused
>   `react-window@2.2.7` (`List` + `Grid`). Note this makes react-window the lib's **first
>   runtime dependency** — it has had react peer-only until now.
> - **Row actions are ▶ and ✕ only**, per the mock. The status pill keeps today's
>   click-to-advance behaviour (Новое → Учу → Знаю), so nothing is lost; **suspend leaves
>   this page** — `toggleSuspendFx` and its routes stay for `/study`, so no dead code.
> - **`SectionHeading`, `SearchField`, `ToggleGroup`, `Button`, `DashboardCard` are reused
>   as-is.** «Все N5 N4 N3 N2 N1» is exactly `ToggleGroup`'s required-single-select model
>   with an `all` option — no new filter component, and no nullable-value variant needed.

### DICT.0 — Designoslav: `Badge` primitive

- [x] `Badge` — the one primitive behind the JLPT tag, the status pill, «ОТКРЫТА» and the
  «7 черт» stroke pill. Variants keyed to the palette (`neutral` / `learning` / `known` /
  `accent`), sizes `s`/`m`, optional `as="button"` for the click-to-advance status pill.
  Export from `src/index.ts` + story.

**Done when:** `Badge` covers all four mock usages with no per-call-site CSS, and the
app's `MarkerList` (`src/shared/ui/MarkerList/MarkerList.tsx`) can drop Gravity's `Label`
for it — one more step off Gravity.

### DICT.1 — Designoslav: `DeckCard`

- [x] `DeckCard` on top of `DashboardCard`: glyph badge (漢/語), title + native subtitle,
  deck size caption, an `open` state (celadon border + «ОТКРЫТА» `Badge`), a
  «НА СЕГОДНЯ n» / «x из n сделано» row, a progress bar, a legend of dotted counts
  (Повторить · n / Новых · n), and a **footer action slot**.
- [x] Nested-interactive trap: the card is selectable *and* contains a CTA. The card body
  gets the click affordance and the CTA is a **sibling**, not a descendant — never a
  `<button>` inside a `<button>`/`<a>`.

**Done when:** both mock states render from props alone (open + partial progress, closed +
zero progress), story covers both, and the component holds no state.

### DICT.2 — Designoslav: `VocabRow` + virtualized `VocabList`

- [x] `VocabRow` — status-coloured left accent, headword + reading, gloss line, a `badges`
  slot and an `actions` slot. Presentational; it does not know what ▶ or ✕ do.
- [x] `VocabList` — `react-window` `List` over `VocabRow`. Owns its scroll container,
  takes `onEndReached` for infinite loading, and renders a footer slot for the loading row.

**Done when:** 1000 fixture rows scroll without jank in Storybook, and `VocabRow` renders
standalone (unvirtualized) so stories and tests don't need a sized parent.

### DICT.3 — Designoslav: `CardTile` + virtualized `CardGrid`

- [x] `CardTile` — the compact kanji tile: status dot, large glyph, meaning, reading, and
  a footer of `Badge`s (JLPT · strokes · status). Distinct from the existing `KanjiCard`,
  which is the full detail card and stays untouched.
- [x] `CardGrid` — `react-window` `Grid` with a responsive column count.

**Done when:** the grid reflows from 5 columns to 1 without a horizontal scrollbar and
tiles keep a stable aspect at every width.

### DICT.4 — Publish the lib

- [x] `npm run verify` in designoslav, commit, push, then `npm update designoslav` here.
  Nothing in DICT.5+ compiles until this lands.

### DICT.5 — jpdict: types + API layer

- [x] `CardType`, `DeckSummary`, `VocabularyPage`, and `SavedWord` gaining `cardType` /
  `strokeCount` in `src/shared/api/types.ts`.
- [x] `src/shared/api/mappers/vocabulary.ts`: map the new columns, and **send both glosses**
  in `toVocabularyPayload` (`meaning` + `meaning_ru`) — line 32 currently discards one.
- [x] BFF: `src/app/api/dictionary/route.ts` forwards the new query params and the
  envelope; new `src/app/api/dictionary/saved/route.ts`; `src/app/api/review/stats/route.ts`
  passes the deck summary through.

### DICT.6 — jpdict: model

- [x] Deck / filters / search / paging as URL state (`?deck=&level=&status=&q=`), debounced
  into a paged Effector store; `useDictionaryFilters` rewritten as the query-param reader.
- [x] `loadDictionaryFx` becomes page-aware (append, not replace); `$deckSummaries` +
  `fetchDeckSummariesFx`.

### DICT.7 — jpdict: page assembly

- [x] `src/app/dictionary/page.tsx` → heading + totals, `DeckCard` pair, filter bar,
  and the deck's collection. Watch `max-lines: 100` on the page and the container; new
  container files need adding to `STATEFUL_FILES` in `eslint.config.mjs`.
- [x] Retire `DictionaryWordCard` and `DictionaryPanelView`'s filter markup in favour of
  the lib components; drop the Gravity `Text`/`Label` imports from this route.

### DICT.8 — jpdict: pronunciation

- [x] `useSpeech` hook in `src/shared/` (not a feature — `/study` will want it too):
  picks a voice for the study language, exposes `speak(text)` and a `supported` flag.
  The ▶ button renders disabled with a title when `supported` is false.

### DICT.9 — jpdict: adding kanji

- [x] Fill designoslav `KanjiCard`'s `action` slot in `src/features/KanjiCard/` with a
  save/saved button wired to a new `addKanjiFx` (`card_type: 'kanji'`, carrying
  `stroke_count` and both glosses from the lookup already on screen).
- [x] Same affordance on the constituent-kanji rows in `WordInspector`
  (`src/features/WordInspector/WordInspector.tsx:76` is the existing word-save precedent);
  needs a save slot threaded through designoslav's `WordCard` `KanjiInWord` type.

### DICT.10 — jpdict: retire `$savedWords`

- [x] Replace the store with a batched `fetchSavedFx` per rendered view; update
  `WordCard.tsx:6` and `WordInspector.tsx:37` (which today compares
  `saved.kanji_full ?? saved.hiragana_full` against the expression).
- [x] Remove the now-dead full-list load from `src/app/page.tsx:17`.

### DICT.11 — i18n, stories, docs, verify

- [x] `ru.json` / `en.json`: `deck_*`, `dict_*`, `tts_*`, «Показано», «Показать ещё»,
  deck titles and native subtitles. No Cyrillic literals in `.tsx` (ESLint enforces it).
- [x] Stories for every new `ui/` component (`npm run check:stories`).
- [x] Docs: `docs/COMPONENTS.md` rows for the new lib components, `docs/STATE.md` for the
  store split, `docs/BFF.md` for the new routes — and **amend the "window is the only
  scroll surface" rule** in `CLAUDE.md` + `docs/UX.md`, which DICT.2/DICT.3 deliberately
  break. Leaving it unamended makes the doc lie.
- [x] `npm run verify` green in both repos.

**Done when:** both decks render from real backend data, the filter bar drives server-side
queries, the URL fully describes the view, and no page fetches the whole vocabulary.

---

## 🔁 REVIEW — Study page redesign (dashboard, activity, session)

> **Goal:** rebuild `/study` to the approved mocks — a `復習 Повторение` heading, a daily-goal
> ring and a streak badge, three stat tiles, a 7×7 activity heatmap whose days open a detail
> panel, and one CTA into the session; then the session itself — header (back · deck badge ·
> progress · n/N), the bracketed flashcard, the four-grade ramp, and a completion screen.
> Backend counterpart: `backend` Phase 21.
>
> **Key architecture fact (don't fight it):** `designoslav` is installed **from GitHub**, not
> from the local checkout at `~/Documents/designoslav`. REVIEW.0–REVIEW.6 must all land and be
> pushed (REVIEW.7) before REVIEW.8+ can compile. The lib still has react-window as its only
> runtime dependency — no `motion`, no `next/link`.
>
> **Decisions baked in** (from the design review — don't relitigate without saying so):
> - **The streak and the heatmap have no data source today.** `saved_words.last_reviewed_at` is
>   overwritten on every grade, so the DB retains only "today" and history cannot be
>   reconstructed. Backend Phase 21 adds an append-only `review_logs` table; nothing on this
>   page renders fabricated data.
> - **A "day" is the client's IANA timezone**, sent as a query param and bucketed server-side
>   with `AT TIME ZONE` (UTC fallback). It applies to the heatmap, the streak, the goal ring
>   **and the daily new-card cap** — otherwise the ring and the grid's "today" disagree between
>   midnight and the UTC offset.
> - **Streak = ≥1 review that day**, counting back from today when today has reviews and from
>   yesterday when it doesn't. Deliberately *not* coupled to `daily_goal`: the goal is now
>   user-editable, and a streak that reshapes itself when you move a slider means nothing.
> - **Heatmap shades are absolute**, not relative to the range max — a good day must look the
>   same in a busy month and a quiet one, or the legend stops meaning anything.
> - **The heatmap is a fixed 7 Monday-aligned weeks**; days after today render as inert
>   placeholders so the grid stays a 7×7 rectangle instead of reflowing daily.
> - **Sessions are mixed by default**, `?deck=` scopes them. This fixes a live dead end:
>   `src/features/Dictionary/DictionaryPanel.tsx:59` already pushes `/study?deck=kanji`, and
>   `/study` never reads `searchParams` — «Учить →» on a deck card silently studies everything.
> - **The deck badge is per-card, not per-session**, so mixed and scoped sessions share one
>   code path. Needs `card_type` on the backend's `ReviewCard`, which it doesn't send today.
> - **Time on card is measured by the client** and capped (~60s), because nothing server-side
>   can distinguish studying from a tab left open. Rows predating Phase 21 carry `NULL`, and
>   «ВРЕМЯ» renders «—» for them rather than a plausible-looking zero.
> - **No «Пройти заново»** on the completion screen — its only CTA is «К словарю». Getting back
>   to the dashboard is the session header's «← Назад».
> - **The session keeps its current behaviour**: 3D flip, drag-to-grade, Space to reveal,
>   1–4 to grade. Only the visual layer is rebuilt.
> - **The grade ramp needs new palette colours.** The mock's rose → amber → pale-green →
>   celadon has no source: the palette holds neutrals, celadon, terracotta and four POS colours,
>   and today's `GRADE_VARIANT` (`src/features/Review/constants.ts:14`) maps grades onto generic
>   button variants, which renders nothing like it.

### REVIEW.0 — Designoslav: tokens

- [x] Rose and amber ramps in `src/tokens/colors.css`; `--do-color-grade-again/hard/good/easy`
  roles over them. Promote the existing plum (`--do-pos-pronoun`) to a real `--do-color-info`
  role — the day-detail «ВРЕМЯ» dot and the deck badge both want it, and a part-of-speech
  token meaning "time spent" is a name that lies at one of its call sites.

### REVIEW.1 — Designoslav: `StatTile` tone + `MetricTile`

- [x] `StatTile` gains `tone` (`primary` | `accent` | `neutral` | `muted` | `info`) — the mock
  colours the three dashboard figures differently and the component has no way to say so.
- [x] New `MetricTile`: coloured dot + caps label above a large value, left-aligned. A different
  shape from `StatTile` (which centres value-over-label), not a variant of it.

### REVIEW.2 — Designoslav: `ActivityCalendar`

- [x] `DashboardCard` + title/range line + «меньше ▫▪▪▪ больше» legend + ПН–ВС header + the
  7×7 grid. `days: {date, count}[]`, absolute `thresholds` prop (default 1/5/10/20), controlled
  `selectedDate` / `onSelectDate`, `detail` slot, today outlined, future cells inert.
- [x] Zero-activity past days stay selectable — the panel showing zeros is information; a dead
  cell is a bug report waiting to happen.

### REVIEW.3 — Designoslav: `ProgressBar`

- [x] Extract the progress bar `DeckCard` draws inline into a `ProgressBar` primitive and
  refactor `DeckCard` onto it — the session header needs the same bar, and a second copy is
  how two bars drift apart.

### REVIEW.4 — Designoslav: `GradeButton`

- [x] Label over an interval sub-label, toned by grade off the REVIEW.0 roles. Keeps study
  semantics out of `Button`'s generic variant list and the label stacking out of per-call-site
  CSS; retires `GRADE_VARIANT` app-side.

### REVIEW.5 — Designoslav: `StudyCard` + `SessionComplete`

- [x] `StudyCard` — the bracketed white card with front/back faces and a `revealed` prop,
  flipping in **pure CSS** (`rotateY`); the lib can't import `motion` and doesn't need to.
  jpdict keeps its `motion` wrapper outside for entrance/exit and drag.
- [x] `SessionComplete` — 完 glyph slot, title, caption, single action slot.
- [x] Not reusing `KanjiCard`: that's the full lookup card (on/kun rows, radical, parts,
  stroke-order box); the session card is a compact badge → glyph → readings → meaning → chip
  stack. Different density, not a variant.

### REVIEW.6 — Designoslav: stories & verify

- [x] Story per new component; `npm run typecheck`, `npm run lint`, `npm run format` green.
- [x] Story suite: **34 files / 158 tests passing**, run as
  `npx vitest run --no-file-parallelism --maxWorkers=1` (parallel workers OOM on this box,
  per HOME.3).
- [ ] **Pre-existing blocker, not from this phase:** `src/VocabList` hangs the runner —
  a Chromium renderer pins one core at 100% and never returns, so a whole-suite
  `npm run test` never terminates. Confirmed against **clean `HEAD` with this phase's work
  stashed**, so it is not caused by the `ProgressBar` refactor or anything else here.
  Everything else was verified by running the suite with that one directory excluded.
  `VocabList` is the react-window virtualized list — the prime suspect is its story
  rendering a large collection under a headless browser on a 7.4GB box. Worth its own
  slice; until then designoslav's stated verification surface can't be run in one command.

### REVIEW.7 — Publish the lib

- [x] Push, then `npm update designoslav` here. REVIEW.8+ cannot compile before this.

### REVIEW.8 — jpdict: types + API layer

- [x] `DayActivity`, `ActivitySeries`, `daily_goal` on `ReviewStats`, `cardType` + `components`
  on `ReviewCard` in `src/features/Review/api/types.ts`; mappers in
  `src/shared/api/mappers/review.ts`.
- [x] BFF: new `src/app/api/review/activity/route.ts`; `stats` route forwards `tz`;
  `[id]` route forwards `elapsed_ms`; `queue` route forwards `card_type`.

### REVIEW.9 — jpdict: model

- [x] `$activity`, `$dailyGoal`, `fetchActivityFx` (sends `Intl.DateTimeFormat().resolvedOptions().timeZone`);
  `fetchQueueFx` takes the deck from `?deck=`. Selected day stays `useState` in the view —
  ephemeral selection with no other subscriber has no business in a store.

### REVIEW.10 — jpdict: dashboard

- [x] `src/features/Review/StudyPanel.tsx` + `ui/StudyDashboardView.tsx` + `ui/ActivityView.tsx`;
  `page.tsx` shrinks to `AuthGate` + a mode switch (it is at ~95 of its 100-line budget today).
- [x] Loading renders `Skeleton`s in each card's shape; an empty account still renders every
  widget (streak 0, goal 0/N, empty grid) — the page's shape is what teaches the app's model.
  The CTA renders **disabled** with «Всё повторено» rather than vanishing and reflowing.

**Done when:** the dashboard matches the mock against real backend data. **Stop and confirm.**

### REVIEW.11 — jpdict: session

- [x] `src/features/Review/SessionPanel.tsx` + `ui/SessionView.tsx`: header (← Назад · deck
  `Badge` · `ProgressBar` · n/N), `StudyCard` faces for word and kanji cards incl. the
  component chip, `GradeButton` row, `SessionComplete`. Card timing feeds `elapsed_ms`.

### REVIEW.12 — jpdict: settings, i18n, docs, verify

- [x] Daily-goal control in `src/app/settings/page.tsx`.
- [x] `ru.json` / `en.json`: `activity_*`, `streak_*`, `goal_*`, `session_*`, weekday and month
  abbreviations. No Cyrillic literals in `.tsx` (ESLint enforces it).
- [x] MSW: `/api/review/activity` handler + a fixture history in `src/mocks/db.ts`, so
  `npm run dev:mock` shows a populated heatmap.
- [x] Stories for every new `ui/` component (`npm run check:stories`); docs rows in
  `docs/COMPONENTS.md`, `docs/STATE.md`, `docs/BFF.md`.
- [x] `npm run verify` green in both repos.

**Done when:** `/study` matches all four mocks on real data, «Учить →» from a deck card opens a
deck-scoped session, and no widget on the page renders a number the backend didn't produce.

### REVIEW.13 — Follow-up: counting, «Снова», and the session's loading state

Three defects found by using the finished page, fixed together because they share a
cause: a card graded «Снова» was both rescheduled a minute out *and* counted as done.

- [x] **Progress counted incoherently.** The deck card read «12 из 6» — its numerator was
  reviews already done while its denominator was work *remaining*, so `due` shrank as
  `done_today` grew. `done_today` now means **cards finished for today** (reviewed *and*
  scheduled past today), and the target is `done + due + new_today` — the day's whole
  workload. Both numbers now move monotonically and the bar cannot overfill.
  A card graded «Снова» is deliberately in neither count: it isn't finished.
- [x] **«Снова» no longer schedules a 1-minute interval.** `srs.schedule` leaves the card
  due *now* (learning step and lapse path both), so it stays in today's stack; the session
  moves it to the tail of the queue. Its `projected_intervals` entry is `0`, which the
  client renders as «в конец» rather than as a duration — keyed off the value, not the
  grade, so it stays honest if scheduling changes again.
- [x] **Entering a session flashed «Колода пройдена».** An empty queue mid-flight is not a
  finished deck. Added `$queueLoaded`, deliberately *not* `fetchQueueFx.pending` — pending
  is still false on the first paint, before the container's effect fires, which is exactly
  the frame that flashed.
- [x] Mock fixtures updated (`again: 0`) and `db.reviewStats` now emits per-deck rows, so
  `/dictionary`'s deck cards stop rendering all-zero under `npm run dev:mock` — that read
  as a bug in the page rather than as missing fixture data.
- [x] `make check` green in `backend` (281 tests), `npm run verify` green here (108), and
  all four behaviours confirmed in a headless browser against the mock backend.

**Done when:** progress never exceeds its target, «Снова» returns a card to the end of
today's stack instead of scheduling it, and no session shows a completion screen it hasn't
earned.
