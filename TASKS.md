# Tasks

## 🟣 Refactor — Clean Architecture

> Each slice below is independently shippable. Do one, review, then move on.
> No new features — only structural moves, dedup, and view/logic separation.

### R1 — Shared i18n helper (kill 6 copies of `getTranslation`)
- [x] Create `src/shared/i18n/index.ts` exporting:
  ```ts
  import ru from './ru.json';
  type Dict = typeof ru;
  export const t = <C extends keyof Dict>(category: C, key: string): string =>
    (ru[category] as Record<string, string>)?.[key] ?? key;
  ```
- [x] Replace local `getTranslation` definitions with `import { t } from '@/shared/i18n'` and rename call-sites in:
  - `src/features/LanguageSelect/LanguageSelect.tsx:10`
  - `src/features/LanguageSelect/ui/LanguageCard.tsx:7`
  - `src/features/Search/Search.tsx:23`
  - `src/features/Search/ui/SearchView.tsx:10`
  - `src/features/Sentence/SentenceCard.tsx:20`
  - `src/features/KanjiCard/KanjiCard.tsx:14`
- [x] Remove the now-unused `import ruTranslations from '@/shared/i18n/ru.json'` in each file.

### R2 — Unify domain types in `shared/api/types.ts`
- [x] Move `Word` (currently `src/features/WordCard/model/index.ts:4`) → `shared/api/types.ts`.
- [x] Move `Kanji` (currently `src/features/KanjiCard/model/index.ts:4`) → `shared/api/types.ts`.
- [x] Pick a single `SentenceToken` definition. Today it's declared in:
  - `src/features/Sentence/model/index.ts:4` (with `jlpt_level`, `hsk_level`)
  - `src/features/Sentence/api/fetchSentence.ts` (separate copy)
  Keep one in `shared/api/types.ts`, delete both copies.
- [x] Move `Language` (currently re-exported from `src/stores/userProfile.ts`) → `shared/api/types.ts`; have the store re-export from there.
- [x] Delete the dead alias `export type WordEntry = Word` at `src/shared/api/types.ts:5` (or, if preferred, rename `Word` → `WordEntry` everywhere and drop the alias).
- [x] Replace ad-hoc `AIToken` interface in `src/features/Sentence/ui/AIOverviewAccordion.tsx:6` with the canonical `SentenceToken`.
- [x] Update all imports; verify `npm run build` is clean.

### R3 — Split view from business logic in cards
> Match the container/view pattern already used by `Search` / `SearchView`.

- [x] **WordCard**: extract presentation into `src/features/WordCard/ui/WordCardView.tsx`. Props: word fields + `readingLabel`, `isSaved`, `onSave`. `WordCard.tsx` becomes a thin container that reads `$userProfile`, `$savedWords` and dispatches `addWordFx`.
- [x] **KanjiCard**: same — `ui/KanjiCardView.tsx` takes plain props + `selectedLanguage`; container reads `$userProfile`.
- [x] **SentenceCard**: extract `TokenRow` (currently inline `SentenceCard.tsx:57-126`) → `src/features/Sentence/ui/TokenRow.tsx`. Container stays responsible for store reads and fetch coordination; `ui/SentenceCardView.tsx` receives all data via props.
- [x] **DictionaryWordCard**: already mostly a view; pull `removeWordFx` / `updateStatusFx` callers up into `DictionaryPanel` and accept `onDelete`, `onAdvanceStatus` as props. Keeps the leaf component pure.
- [x] After this slice, no file under `*/ui/*` should import from `effector-react` or `@/stores/*`.

### R4 — Extract supporting fns out of component files
- [x] Move `getPosColorClass` (45 LOC inside `src/features/Sentence/SentenceCard.tsx:24-44`) → `src/features/Sentence/lib/posColor.ts`. Keep the dependence on `styles.*` by passing the styles object in, or accept the color class names as string constants.
- [x] Move `dictEntryToWord` (`src/features/WordCard/api/fetchWords.ts:22`) → `src/features/WordCard/api/mappers.ts`.
- [x] Move `backendCardToKanji` (`src/features/KanjiCard/api/fetchKanji.ts:9`) → `src/features/KanjiCard/api/mappers.ts`.
- [x] Dedup `CJK_REGEX` (defined in `src/features/KanjiCard/api/fetchKanji.ts:7` and `src/features/WordInspector/WordInspector.tsx:14`) → single export from `src/shared/utils/cjk.ts`.
- [x] Move the DictionaryPanel filter math (`src/features/Dictionary/DictionaryPanel.tsx:18-29`) into `useDictionaryFilters(words)` in `src/features/Dictionary/model/useDictionaryFilters.ts` (returns `{ filtered, levelFilter, statusFilter, toggleLevel, toggleStatus, hasJlpt, hasHsk }`).

### R5 — Promote generic UI to `shared/ui`
- [x] **`MarkerList`** — replace these repeated chunks with one component:
  - `src/features/WordCard/WordCard.tsx:37-43`
  - `src/features/KanjiCard/KanjiCard.tsx:37-43`
  - `src/features/WordInspector/WordInspector.tsx:88-94`
  - `src/features/Dictionary/DictionaryWordCard/DictionaryWordCard.tsx:38-40`
  Signature: `<MarkerList markers={string[]} />`.
- [x] **`DefinitionList`** — replace numbered definition lists in `WordCard.tsx:53-59` and `WordInspector.tsx:97-105`. Signature: `<DefinitionList items={string[]} />`.
- [x] **`AccordionSection`** — `src/features/WordInspector/WordInspector.tsx:23-50` is generic; move to `src/shared/ui/Accordion/AccordionSection.tsx` and reuse from `WordInspector`. Optionally use it as the chrome for `AIOverviewAccordion`.
- [x] Delete `formatOverview` wrapper in `src/features/Sentence/ui/AIOverviewAccordion.tsx:55-60` — it just wraps `<Markdown>`. Inline it.

### R6 — Centralise “clear other results before fetching”
- [x] In `src/features/Search/Search.tsx:80-106`, every branch enumerates which result stores to clear. Add a single event `resetSearchResults` (in e.g. `src/features/Search/model/index.ts`) and wire each result store (`$words`, `$kanji`, `$sentences`, `$inspectedWord`) to reset on it.
- [x] Replace the per-branch `clearWords/clearKanji/clearSentences/clearInspectedWord` calls in `Search.tsx` and `SentenceCard.tsx:142-143` with `resetSearchResults()` immediately before the relevant `fetchXFx`.
- [x] Keep the individual `clear*` events available for cases where only one store needs clearing (`KanjiCard` rerouting from a token click, etc.) but stop calling them from `Search`.

### R7 — Minor tidy
- [ ] `src/features/WordCard/model/index.ts:23-25` and `KanjiCard/model/index.ts:24-26` log via `fetchXFx.fail.watch` — same pattern repeats 3+ times. Add `src/shared/utils/logEffectFailures.ts` `(fx, label) => fx.fail.watch(...)` and use it.
- [ ] `src/features/Sentence/ui/AIOverviewAccordion.tsx:6-13` declares `AIToken` — remove after R2.
- [ ] Verify after each slice: `npm run build` and `npm run test` are clean.

### R8 — Extract inline constants into `constants.ts` files
> Follow the pattern already established by `src/features/Dictionary/constants.ts`.
> Rule: if a `const` is uppercase, primitive/literal, and lives at module top-level, it belongs in a sibling `constants.ts` (not a component file).

- [ ] **Backend URL** (`FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000'`) is duplicated in 7 route files:
  - `src/app/api/history/route.ts:3`
  - `src/app/api/history/[id]/route.ts:3`
  - `src/app/api/dictionary/route.ts:3`
  - `src/app/api/dictionary/[id]/route.ts:3`
  - `src/app/api/parse-sentence/route.ts:3`
  - `src/app/api/auth/login/route.ts:3`
  - `src/app/api/auth/refresh/route.ts:3`
  - `src/app/api/auth/register/route.ts:3`
  Move to `src/shared/api/backend.ts` exporting `BACKEND_URL`. (Also covers the existing `BACKEND_URL` in `src/shared/api/fetchData.ts:1`.)
- [ ] **Sentence virtual-list sizing** — move `ITEM_SIZE` and `MAX_VISIBLE_ITEMS` (`src/features/Sentence/ui/SentenceCardView.tsx:13-14`) → `src/features/Sentence/constants.ts`.
- [ ] **KanjiVG CDN base** — move `CDN_BASE` (`src/features/KanjiCard/ui/StrokeOrder.tsx:10`) → `src/features/KanjiCard/constants.ts`.
- [ ] **SSE headers** — move `SSE_HEADERS` (`src/app/api/ai-overview/route.ts:3`) → `src/app/api/ai-overview/constants.ts` (or `src/shared/api/sse.ts` if reused later).
- [ ] **`CJK_REGEX`** — already covered in R4 (single export from `src/shared/utils/cjk.ts`); just verify it's a named constant, not inline.
- [ ] Sweep for remaining inline magic numbers in components (e.g. `setTimeout(..., 400)` in `Search.tsx:104`, `slice(0, 60)` in `AIOverviewAccordion.tsx:63`, debounce delays). Promote any that have semantic meaning to named constants in the feature's `constants.ts`. Leave purely-cosmetic numbers (`gap: 8`, `paddingBottom: 16`) inline.

### R9 — ESLint hardening + Prettier
> Project already has `eslint.config.mjs` extending `next/core-web-vitals` + `next/typescript` + storybook. No Prettier yet.

**ESLint**
- [ ] Add rules to `eslint.config.mjs` to enforce the refactor's invariants going forward:
  - `no-restricted-imports` — forbid `effector-react` and `@/stores/*` from any file matching `**/ui/**` (enforces the R3 boundary).
  - `@typescript-eslint/no-unused-vars` with `{ argsIgnorePattern: '^_' }` (Next default already errors; tighten if needed).
  - `@typescript-eslint/consistent-type-imports` with `prefer: 'type-imports'`.
  - `no-console` with `{ allow: ['warn', 'error'] }` to flag stray `console.log` (we already use `console.error` in fail.watch handlers — those stay).
- [ ] Add `lint:fix` script to `package.json`: `"lint:fix": "next lint --fix"`.
- [ ] Run `npm run lint` and resolve any new violations.

**Prettier**
- [ ] `npm install -D prettier eslint-config-prettier`.
- [ ] Create `.prettierrc.json` matching current code style (observed: single quotes, semicolons, 2-space indent, trailing commas):
  ```json
  {
    "singleQuote": true,
    "semi": true,
    "trailingComma": "all",
    "printWidth": 100,
    "tabWidth": 2,
    "arrowParens": "always"
  }
  ```
- [ ] Create `.prettierignore`: `node_modules`, `.next`, `storybook-static`, `*.d.ts` (especially `src/shared/api/generatedTypes.d.ts`), `public`.
- [ ] Append `eslint-config-prettier` to the `eslintConfig` array in `eslint.config.mjs` so Prettier wins formatting conflicts.
- [ ] Add scripts to `package.json`:
  - `"format": "prettier --write \"src/**/*.{ts,tsx,css,json,md}\""`
  - `"format:check": "prettier --check \"src/**/*.{ts,tsx,css,json,md}\""`
- [ ] Run `npm run format` once for a one-shot codebase reformat. Commit separately so the diff is a pure format pass.
- [ ] (Optional) Add a pre-commit hook via `husky` + `lint-staged` — leave out unless requested.

### Execution order
R1 → R2 → R3 → R4 → R5 → R6 → R7 → R8 → R9.
Run R9 last so the bulk format pass doesn't churn the diffs of earlier slices.
Stop and confirm between slices.

---

## 🔴 P0 — Phase 1: Cleanup & Bug Fixes

### 1.1 Fix AI Overview Route
- [ ] Replace `process.env.NEXT_PUBLIC_GPT_KEY` → `process.env.OPENROUTER_KEY` in `src/app/api/ai-overview/route.ts`
- [ ] Move hardcoded model `deepseek/deepseek-v4-flash` to `process.env.OPENROUTER_MODEL`
- [ ] Add Chinese language support to the prompt (detect language from tokens)

### 1.2 Remove Renshuu API Dependency
- [ ] Delete or replace `src/shared/api/fetchData.ts`
- [ ] Delete `src/shared/api/generatedTypes.d.ts`

### 1.3 Deduplicate SentenceToken Type
- [ ] Keep `SentenceToken` only in `src/features/Sentence/api/fetchSentence.ts`
- [ ] Import it in `src/features/Sentence/model/index.ts` instead of redeclaring

### 1.4 Remove Commented-Out JSX
- [ ] Delete commented `<div>` tags at lines 75 and 89 in `src/features/KanjiCard/KanjiCard.tsx`

### 1.5 Update Layout Metadata
- [ ] Set title to `"JapChin Dict — Изучение японского и китайского"` in `src/app/layout.tsx`
- [ ] Set description to `"Платформа для изучения иероглифического письма с AI-анализом"`
- [ ] Add `lang="ru"` to `<html>`
- [ ] Create Client Component that subscribes to `$userProfile` and sets `data-lang="jp"` / `data-lang="cn"` on `<html>`

### 1.6 CSS Font Switching via data-lang
- [ ] Add to `src/app/styles/globals.css`:
  ```css
  :root { --font-cjk: var(--font-noto-jp), sans-serif; }
  [data-lang="cn"] { --font-cjk: var(--font-noto-sc), sans-serif; }
  body { font-family: var(--font-cjk); }
  ```

### 1.7 Fix Debounce in Search
- [ ] Change debounce from 350ms → 300ms in `src/features/Search/Search.tsx`

### 1.8 Fix WordCard Chinese Label
- [ ] Conditionally render `"Pinyin"` label instead of `"hiragana_full"` when language is CN in `src/features/WordCard/WordCard.tsx`

---

## 🔴 P0 — Phase 2: Shared Types

- [ ] Create `src/shared/api/types.ts` with:
  - `Language`, `WordEntry`, `KanjiEntry`, `SentenceToken`, `SentenceResult`
- [ ] Update `src/features/WordCard/model/index.ts` to use `WordEntry` from shared types
- [ ] Update `src/features/KanjiCard/model/index.ts` to use `KanjiEntry` from shared types
- [ ] Update `src/features/Sentence/model/index.ts` to use `SentenceToken`, `SentenceResult` from shared types
- [ ] Delete `src/shared/api/generatedTypes.d.ts` after migration

---

## 🟠 P1 — Phase 3: Real API Data (Japanese)

### 3.1 Jisho API — Words
- [ ] Rewrite `src/features/WordCard/api/fetchWords.ts` to call `https://jisho.org/api/v1/search/words?keyword=<query>`
- [ ] Map response fields to `WordEntry`: `slug→id`, `japanese[0].word→written`, `japanese[0].reading→reading`, `senses[0].english_definitions→definitions`, `jlpt→markers`

### 3.2 kanjiapi.dev — Kanji
- [ ] Rewrite `src/features/KanjiCard/api/fetchKanji.ts` to call `https://kanjiapi.dev/v1/kanji/<char>`
- [ ] Map response to `KanjiEntry`: `kun_readings`, `on_readings`, `meanings`, `stroke_count`, `jlpt`

### 3.3 BFF Route for Words (if needed)
- [ ] Create `src/app/api/words/route.ts` to proxy Jisho if browser CORS blocks direct requests

---

## 🟠 P1 — Phase 5: Furigana / Pinyin as Ruby

### 5.1 FuriganaText Component
- [ ] Create `src/shared/ui/FuriganaText/FuriganaText.tsx`
  - Props: `{ surface: string; reading?: string }`
  - Renders `<ruby>surface<rt>reading</rt></ruby>` or plain `<span>` if no reading / surface === reading

### 5.2 Apply in SentenceCard
- [ ] Replace current reading display in `src/features/Sentence/SentenceCard.tsx` with `<FuriganaText surface={token.surface_form} reading={token.reading} />`

### 5.3 Ruby CSS
- [ ] Add to `src/app/styles/globals.css`:
  ```css
  ruby { ruby-align: center; }
  rt { font-size: 0.55em; color: var(--text-secondary); }
  ```

---

## 🟠 P1 — Phase 6: DifficultyMeter

### 6.1 Utility
- [ ] Create `src/shared/utils/calculateDifficulty.ts`
  - Takes `markers: string[]` and `lang: 'jp' | 'cn'`
  - Returns median JLPT (N5–N1) or HSK (1–6) score, or `null`

### 6.2 Component
- [ ] Create `src/features/DifficultyMeter/DifficultyMeter.tsx`
  - 5–6 segments filled to current level
  - Color scale: green (easy) → red (hard)

### 6.3 Integration
- [ ] Add `DifficultyMeter` to `src/features/WordCard/WordCard.tsx`
- [ ] Add `DifficultyMeter` to `src/features/Sentence/SentenceCard.tsx`

---

## 🟠 P1 — Phase 14: Settings Screen

### 14.1 Page
- [ ] Create `src/app/settings/page.tsx`

### 14.2 Controls
- [ ] Language switcher (JP ↔ CN) — calls `setSelectedLanguage` from `userProfile` store
- [ ] Furigana toggle (JP) / Pinyin toggle (CN) — reads/writes `showFurigana` / `showPinyin` from store
- [ ] "Clear search history" button — triggers clear event from `$searchHistory` store

### 14.3 Extend userProfile Store
- [ ] Add `showFurigana: boolean` and `showPinyin: boolean` to `UserProfile` type in `src/stores/userProfile.ts`
- [ ] Pass `showFurigana` / `showPinyin` into `FuriganaText` — render plain `<span>` when false

---

## 🟡 P2 — Phase 15: Word Inspector

- [ ] Create `src/features/WordInspector/WordInspector.tsx` with accordion sections:
  1. Translation (`definitions`)
  2. Grammar — part of speech, form, JLPT/HSK level
  3. Example sentences — from Jisho or separate endpoint
  4. Kanji breakdown — each character clickable → opens KanjiCard
  5. "Add to dictionary" button — calls `addWordFx` (Phase 8)
- [ ] Open WordInspector on token click in `SentenceCard` instead of direct WordCard
- [ ] Open WordInspector via context-adaptive routing for word queries

---

## 🟡 P2 — Phase 7: AI Overview SSE Streaming

### 7.1 Update API Route
- [ ] Update `src/app/api/ai-overview/route.ts` to pass `stream: true` to OpenRouter and pipe `stream.body` back as `text/event-stream`

### 7.2 Update Client
- [ ] Create/update `src/features/Sentence/api/fetchAIOverview.ts` to read SSE via `ReadableStream` and call `onChunk(chunk)` per chunk

### 7.3 Update AIOverviewAccordion
- [ ] Update `src/features/Sentence/AIOverviewAccordion.tsx` to accumulate chunks into a growing string and re-render on each update

---

## 🟡 P2 — Phase 9: Search History

### 9.1 Effector Store
- [ ] Create `src/features/SearchHistory/model/index.ts`
  - `$searchHistory: Store<string[]>`, `addToHistory` event, deduplication, max 20 entries

### 9.2 Persistence
- [ ] Sync `$searchHistory` to `localStorage`
- [ ] If user is authenticated, also persist to DB via BFF

### 9.3 UI
- [ ] Add dropdown under search input showing recent queries
- [ ] Click on entry → repeat search
- [ ] Per-entry delete button
- [ ] "Clear all" button (reused in Settings Phase 14)

---

## 🟡 P2 — Phase 13: Tests

### 13.1 Unit Tests (Vitest)
- [ ] `src/features/Search/utils.test.ts` — 12 scenarios for `classifySearchQuery`
- [ ] `src/shared/utils/calculateDifficulty.test.ts` — median JLPT/HSK
- [ ] `src/shared/utils/isJapaneseText.test.ts` — Japanese text detector
- [ ] `src/stores/userProfile.test.ts` — `setSelectedLanguage`, `loadUserProfile` events

### 13.2 Storybook Stories
- [ ] `src/features/Sentence/SentenceCard.stories.tsx`
- [ ] `src/features/DifficultyMeter/DifficultyMeter.stories.tsx`
- [ ] `src/shared/ui/FuriganaText/FuriganaText.stories.tsx`

### 13.3 Integration Tests
- [ ] `src/app/api/parse-sentence` — kuromoji tokenization
- [ ] `src/app/api/ai-overview` — mock OpenRouter response

---

## 🟢 P3 — Phase 8: Personal Dictionary

### 8.1 BFF Routes
- [ ] Create `src/app/api/dictionary/route.ts` — `GET` (list) + `POST` (add word)
- [ ] Create `src/app/api/dictionary/[id]/route.ts` — `DELETE`

### 8.2 Types
- [ ] Add `MasteryStatus = 'new' | 'learning' | 'known'` to `src/shared/api/types.ts`
- [ ] Add `SavedWord = WordEntry & { savedAt: string; status: MasteryStatus }`

### 8.3 Effector Store
- [ ] Create `src/features/Dictionary/model/index.ts`
  - `$savedWords`, `addWordFx`, `removeWordFx`, `loadDictionaryFx`, `updateStatusFx`

### 8.4 UI
- [ ] Create `src/features/Dictionary/DictionaryPanel.tsx`
- [ ] "Save word" button on WordCard
- [ ] Dictionary panel/page with saved words list
- [ ] Filter by JLPT level (N5–N1) / HSK level (1–6)
- [ ] Filter by mastery status: `new` / `learning` / `known`
- [ ] Inline status update with single tap
- [ ] Delete button per entry

---

## 🟢 P3 — Phase 16: Stroke Order

### 16.1 StrokeOrder Component
- [ ] Create `src/features/KanjiCard/ui/StrokeOrder.tsx`
  - Load SVG from KanjiVG CDN: `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/<codepoint>.svg`
  - Codepoint: `char.codePointAt(0).toString(16).padStart(5, '0')`
  - Cache in `sessionStorage` (or `kanji_cache` DB table if available)
  - Graceful fallback: hide section if SVG not found

### 16.2 Integration
- [ ] Add "Stroke order" section to `src/features/KanjiCard/KanjiCard.tsx` below example words

---

## 🟢 P3 — Phase 10: JWT Authentication

### 10.1 BFF Routes
- [ ] Create `src/app/api/auth/login/route.ts` — POST, get JWT from FastAPI
- [ ] Create `src/app/api/auth/refresh/route.ts` — POST, refresh access token
- [ ] Create `src/app/api/auth/logout/route.ts` — POST, clear httpOnly cookie

### 10.2 Middleware
- [ ] Create `src/middleware.ts` — protect `/api/dictionary/*` and `/api/history/*` routes, check Authorization header

### 10.3 Effector Store
- [ ] Create `src/stores/auth.ts`
  - `$isAuthenticated`, `$user`, `loginFx`, `logoutFx`

### 10.4 UI
- [ ] Login/Logout button in header
- [ ] Modal login/register form

---

## 🟢 P3 — Phase 11: PWA

- [ ] Install `next-pwa`: `npm install next-pwa`
- [ ] Wrap `next.config.ts` with `withPWA({ dest: 'public', disable: process.env.NODE_ENV === 'development' })`
- [ ] Create `public/manifest.json` with name, icons, `display: "standalone"`, theme color
- [ ] Add `<link rel="manifest">` and `<meta name="theme-color">` to `src/app/layout.tsx`

---

## 🟢 P3 — Phase 4: FastAPI NLP Backend

- [ ] Set up `backend/` directory structure: `main.py`, `routers/`, `nlp/`, `db/`, `auth/`
- [ ] Implement `routers/parse.py` — `POST /parse` tokenization endpoint
- [ ] Implement `routers/search.py` — `GET /search` PostgreSQL search
- [ ] Implement `nlp/japanese.py` — SudachiPy + UniDic tokenizer
- [ ] Implement `nlp/chinese.py` — HanLP + pypinyin tokenizer
- [ ] Implement `db/models.py` — SQLAlchemy models: `users`, `saved_words`, `search_history`, `kanji_cache`
- [ ] Implement `auth/jwt.py` — JWT access (15 min) + httpOnly refresh cookie (7 days)
- [ ] Create `backend/requirements.txt`
- [ ] Create `backend/Dockerfile`
- [ ] Update `src/app/api/parse-sentence/route.ts` to proxy to `POST http://backend:8000/parse`; keep kuromoji as fallback

---

## 🔵 P4 — Phase 12: Docker Compose

- [ ] Create `docker-compose.yml` with services: `frontend`, `backend`, `db` (postgres:15)
- [ ] Create `backend/migrations/init.sql` with schema:
  - Tables: `users`, `saved_words`, `search_history`, `kanji_cache`
  - Extensions: `pg_trgm`
  - Indexes: gin trigram on `saved_words.written`, btree on `search_history(user_id, searched_at DESC)`
- [ ] Add `pgdata` named volume
- [ ] Wire env vars: `BACKEND_URL`, `OPENROUTER_KEY`, `DATABASE_URL`
