# Directory Structure

All paths are relative to `frontend/src/`.

## `src/app/`

Next.js App Router root. Everything here maps to a URL.

- `layout.tsx` — root Server Component: loads Noto fonts, mounts `<Providers>` and `<HtmlLangSync>`
- `providers.tsx` — client-side provider wrapper (Gravity UI theme)
- `HtmlLangSync.tsx` — syncs `data-lang` attribute on `<html>` to `$userProfile.selectedLanguage`; drives the `--font-cjk` CSS variable switch
- `page.tsx` — home page (Client Component): nav bar, `<Search>`, two `<CardList>` columns for results
- `styles/globals.css` — CSS variables, body reset, ruby/rt rules
- `dictionary/page.tsx` — saved words management page
- `settings/page.tsx` — user settings page

### `src/app/api/`

BFF route handlers. See BFF.md for the full table.

- `auth/{login,register,refresh,logout}/route.ts` — proxy to FastAPI auth endpoints
- `ai-overview/route.ts` — call OpenRouter with SSE stream; falls back to mock if no API key
- `parse-sentence/route.ts` — morphological analysis proxy to FastAPI
- `dictionary/route.ts`, `dictionary/[id]/route.ts` — vocabulary CRUD (protected)
- `history/route.ts`, `history/[id]/route.ts` — search history CRUD (protected)

## `src/features/`

Feature modules following a container/view split. Each feature owns its API calls,
Effector model, and UI components.

### Pattern per feature

```
src/features/<Feature>/
  <Feature>.tsx          — container: connects to stores, passes props to view
  index.ts               — public re-exports
  constants.ts           — magic values (debounce ms, limits, etc.)
  api/
    fetch*.ts            — fetch functions called by Effector effects
    mappers.ts           — shape transformation (backend → frontend types)
  model/
    index.ts             — Effector stores, events, effects scoped to this feature
  ui/
    <Feature>View.tsx    — pure view component, no store imports
    *.module.css         — scoped styles
    *.stories.tsx        — Storybook stories
```

### Features

| Feature | Container | Purpose |
|---------|-----------|---------|
| `Auth/` | `AuthModal.tsx`, `AuthGate.tsx` | Login/register modal; protected-content wrapper |
| `Dictionary/` | `DictionaryPanel.tsx` | Saved words list with filtering and status management |
| `KanjiCard/` | `KanjiCard.tsx` | Character display with stroke order |
| `LanguageSelect/` | `LanguageSelect.tsx` | JP / CN mode picker |
| `Search/` | `Search.tsx` | Query classification, debounce, effect dispatch |
| `SearchHistory/` | `SearchHistoryDropdown.tsx` | Recent queries dropdown |
| `Sentence/` | `SentenceCard.tsx` | Tokenised sentence display + AI overview accordion |
| `WordCard/` | `WordCard.tsx` | Word search result card |
| `WordInspector/` | `WordInspector.tsx` | Detailed word panel with example sentences |

## `src/shared/`

Code that is feature-agnostic.

- `api/backend.ts` — `BACKEND_URL` resolution (env vars → localhost fallback)
- `api/types.ts` — shared TypeScript interfaces: `Word`, `Kanji`, `SentenceToken`, `SavedWord`, `Language`, `MasteryStatus`
- `api/generatedTypes.d.ts` — OpenAPI-generated types (regenerated via `npm run generate-types`)
- `i18n/index.ts` — `t(category, key)` translator; `ru.json` / `en.json` dictionaries
- `utils/cjk.ts` — Unicode range helpers for CJK detection
- `utils/isJapaneseText.ts` — heuristic for JP vs CN text
- `utils/logEffectFailures.ts` — attaches `.fail.watch` to an Effector effect for console logging

### `src/shared/ui/`

Reusable UI primitives. All have Storybook stories except `AuthGate`.

| Component | Purpose |
|-----------|---------|
| `Accordion/AccordionSection` | Expandable section wrapper |
| `AuthGate/AuthGate` | Renders children only when authenticated |
| `Card/Card` | Generic card container with border and padding |
| `CardList/CardList` | Virtualized list with loading skeleton |
| `DefinitionList/DefinitionList` | Renders definition entries |
| `FuriganaText/FuriganaText` | `<ruby>/<rt>` wrapper for readings |
| `MarkerList/MarkerList` | JLPT / HSK level badges |

## `src/stores/`

Global Effector stores shared across multiple features.

- `auth.ts` — `$auth` store holding `{ accessToken, user }`; four effects (login, register, refresh, logout)
- `userProfile.ts` — `$userProfile` holding language, toggles, UI locale; persists to `localStorage`

## `src/types/`

- `css.d.ts` — TypeScript declaration for CSS Module imports

## `src/middleware.ts`

Next.js middleware that guards `/api/dictionary/*` and `/api/history/*`. Verifies the
`refresh_token` cookie with JOSE before allowing the request through.
