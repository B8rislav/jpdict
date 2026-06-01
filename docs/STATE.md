# State

Effector is used throughout. Stores are split into global (`src/stores/`) and
feature-local (`src/features/*/model/`).

## Global stores (`src/stores/`)

### `$auth` → `$isAuthenticated`, `$user`, `$accessToken`

File: `src/stores/auth.ts`

| Field | Type | Description |
|-------|------|-------------|
| `accessToken` | `string \| null` | Short-lived JWT; held in memory only |
| `user` | `{ email } \| null` | Currently logged-in user |

**Derived:** `$isAuthenticated` (`accessToken !== null`), `$user`, `$accessToken`.

**Writers:**
- `loginFx.doneData` — sets both `accessToken` and `user`
- `refreshFx.doneData` — updates `accessToken` (user unchanged)
- `logoutFx.done` / `loggedOut` event — resets to null

**Readers:** `src/app/page.tsx`, `src/shared/ui/AuthGate/AuthGate.tsx`, `src/features/Auth/AuthModal.tsx`

**Persistence:** none — lost on page reload; `refreshFx` re-hydrates from the httpOnly cookie on every mount

---

### `$userProfile`

File: `src/stores/userProfile.ts`

| Field | Type | Default |
|-------|------|---------|
| `selectedLanguage` | `'jp' \| 'cn' \| null` | `null` |
| `showFurigana` | `boolean` | `true` |
| `showPinyin` | `boolean` | `true` |
| `uiLocale` | `'ru' \| 'en'` | `'ru'` |

**Writers:** `setSelectedLanguage`, `setShowFurigana`, `setShowPinyin`, `setUiLocale` events; `loadUserProfile` event (reads localStorage on mount)

**Readers:** `src/app/page.tsx`, every feature container via `useUnit($userProfile)`

**Persistence:** `localStorage` key `userProfile`. Every update is saved synchronously via `$userProfile.updates.watch(saveToLocalStorage)`. Also watches `uiLocale` to call `setLocale()` on the i18n module.

---

## Feature stores (`src/features/*/model/`)

### `$words`

File: `src/features/WordCard/model/index.ts`

Holds the array of `Word` objects returned by the last word search.

**Writers:** `fetchWordsFx.doneData`, `clearWords` event

**Readers:** `src/app/page.tsx` via `useList($words, …)`

**Persistence:** none

---

### `$kanji`

File: `src/features/KanjiCard/model/index.ts`

Holds the `Kanji` object returned by the last kanji lookup (single character).

**Writers:** `fetchKanjiFx.doneData`, `clearKanji` event

**Readers:** `src/app/page.tsx` via `useList($kanji, …)`

**Persistence:** none

---

### `$sentences`

File: `src/features/Sentence/model/index.ts` (re-exported from `src/features/Sentence/index.ts`)

Holds the array of parsed `SentenceToken[]` groups from the last sentence search.

**Writers:** `fetchSentenceFx.doneData`, `clearSentences` event

**Readers:** `src/app/page.tsx` via `useList($sentences, …)`

**Persistence:** none

---

### `$inspectedWord`

File: `src/features/WordInspector/model/index.ts`

The single `Word` currently shown in the detail panel. Set when the user clicks a word
result, cleared by `clearInspectedWord`.

**Writers:** populated when `fetchWordsFx` succeeds (first result) or user clicks a word; `clearInspectedWord` event

**Readers:** `src/app/page.tsx`, `WordInspector` container

**Persistence:** none

---

### `$searchHistory`

File: `src/features/SearchHistory/model/index.ts`

Array of `{ id, query }` objects, capped at 20, filtered by active language.

**Writers:** `loadHistoryFx.doneData` (initial load), `addHistoryFx.doneData`, `removeHistoryFx`, `clearHistoryFx`

**Readers:** `Search` container → passed as prop to `SearchHistoryDropdown`

**Persistence:** BFF (`/api/history`) when authenticated; no localStorage fallback

---

### `$savedWords`

File: `src/features/Dictionary/model/index.ts`

Array of `SavedWord` objects from the user's vocabulary list.

**Writers:** `loadDictionaryFx.doneData`, `addWordFx.doneData`, `removeWordFx`, `updateStatusFx`

**Readers:** `WordCard` container (isSaved check), `DictionaryPanel`, `src/app/dictionary/page.tsx`

**Persistence:** BFF (`/api/dictionary`) when authenticated

---

## `resetSearchResults` orchestration (R6)

File: `src/features/Search/model/index.ts`

`resetSearchResults` is a single event that fans out to clear all four search result
stores simultaneously:

```
resetSearchResults
  ├─► clearWords
  ├─► clearKanji
  ├─► clearSentences
  └─► clearInspectedWord
```

Implemented with `sample({ clock: resetSearchResults, target: [clearWords, clearKanji, clearSentences, clearInspectedWord] })`. Called by `Search` when the input is cleared.
