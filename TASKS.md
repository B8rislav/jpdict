# Tasks

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
