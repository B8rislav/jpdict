# State

Effector is used throughout. Stores are split into genuinely cross-feature
(`src/stores/`) and feature-local (`src/features/*/model/`).

Two things are deliberately **not** effector state:

- **The active locale** — React context (`src/shared/i18n/context.tsx`), read via
  `useT()` / `useLocale()`.
- **The active profile** — React context (`src/shared/profile/context.tsx`), read via
  `useProfile()`.

Both need to be correct during SSR, and effector stores can't carry per-request state
through SSR safely (module-level singletons are shared across concurrent requests). They
are seeded from a prop in `src/app/providers.tsx` and mirror the store after mount. See
[ARCHITECTURE.md](ARCHITECTURE.md#why-effector-stores-are-never-written-on-the-server).

Views may not import `effector`, `effector-react`, or `@/stores/*` — enforced by a
whitelist in `eslint.config.mjs`, not by folder name.

## Global stores (`src/stores/`)

### `$currentUser` → `$isAuthenticated`, `$user`, `$sessionResolved`

File: `src/stores/auth.ts`

Holds a `CurrentUser | null` — identity plus profile, as returned by
`GET /api/users/me`. The browser stores **no token**: the BFF authenticates with the
httpOnly `refresh_token` cookie, so "signed in" means "that endpoint returned a user".

**Derived:**
- `$isAuthenticated` — `user !== null`
- `$user` — the record itself (`id`, `email`, `name`, plus profile fields)
- `$sessionResolved` — whether the lookup has come back yet. Distinct from
  `$isAuthenticated`, which is false both *before* and *after* a negative answer;
  `AuthGate` uses it so gated pages don't flash a signed-out state on load.

**Writers:**
- `fetchCurrentUserFx.doneData` — replaces the user (a 401 resolves to `null`, which is
  an ordinary answer, not an error)
- `loginFx.done` — samples into `fetchCurrentUserFx`, since a token proves a session
  exists but says nothing about who owns it
- `logoutFx.done` / `loggedOut` — resets

**Readers:** `src/features/AppNav/AppNav.tsx`, `src/features/Auth/AuthGate.tsx`,
`src/features/Search/Search.tsx`, `src/app/page.tsx`

**Persistence:** none in the client — re-resolved once per load by `Providers`. This
replaced a `$accessToken` that was fetched on every load, never sent anywhere, and read
only as a boolean; `refreshFx` also fired from two places and raced itself. Reloading
while signed in used to blank the user's email, because `refreshFx` set only the token.

---

### `$userProfile`

File: `src/stores/userProfile.ts`

| Field | Type | Default |
|-------|------|---------|
| `selectedLanguage` | `'jp' \| 'cn' \| null` | `null` |
| `showFurigana` | `boolean` | `true` |
| `showPinyin` | `boolean` | `true` |
| `uiLocale` | `'ru' \| 'en'` | `'ru'` |

**Writers:** `setSelectedLanguage`, `setShowFurigana`, `setShowPinyin`, `setUiLocale`
events; `profileHydrated` (seeds from the server-resolved profile, once, before first
paint); `fetchCurrentUserFx.doneData` (a signed-in user's DB profile overrides whatever
the cookie carried into this device's render).

**Readers:** components read the profile from **context** (`useProfile()`), not from this
store — the store is the mutation surface. `Providers` is the one subscriber, bridging
store → context after hydration.

**Persistence:** two tiers.

- **Postgres** (`users` table) — durable, authoritative, syncs across devices. Written by
  `persistProfileFx` → `PATCH /api/users/me`, only when authenticated, and only the
  fields that changed.
- **`profile` cookie** — a cache of the above, written on every change so the *next*
  request can render the right language server-side. Not httpOnly: it holds no secret,
  and signed-out visitors have no row to PATCH.

Resolution order, implemented in `resolveProfile` (`src/shared/api/profile.ts`):

```
DB (authenticated)  →  cookie  →  Accept-Language  →  defaults
   authoritative       fast/SSR   first visit only    ru / null
```

`Accept-Language` is consulted **only** for a visitor with no stored preference — a
Russian speaker on an English OS must not be forced into an English UI.

**Not localStorage.** It used to be, which meant the server couldn't read it: SSR always
rendered Russian defaults, then localStorage flipped the UI after hydration — a visible
flash plus a React hydration mismatch.

---

### `$queue` → `$current`, `$stats` (review / SRS)

File: `src/features/Review/model/index.ts` (re-exported from `src/features/Review`)

| Store | Type | Description |
|-------|------|-------------|
| `$queue` | `ReviewCard[]` | Cards still to study this session (due first, then new) |
| `$stats` | `ReviewStats \| null` | Dashboard counts `{ new, due, learned, suspended }` for the active language |

**Derived:** `$current` (`$queue[0] ?? null`) — the card on screen.

**Language-aware:** `fetchQueueFx` / `fetchStatsFx` read `selectedLanguage` off `$userProfile` and no-op when unauthenticated.

**Writers:**
- `fetchQueueFx.doneData` → replaces `$queue`; `fetchStatsFx.doneData` → replaces `$stats`
- `gradeCurrent` event → sampled against `$current` into `gradeRequested`, which (a) fires `gradeFx` to the backend, (b) optimistically advances `$queue` (drops the head), and (c) optimistically moves the card out of `new`/`due` into `learned` in `$stats`
- `nextCard` event → drops the head without grading (skip)
- `suspendFx.done` → removes the card from `$queue`; `suspendFx.done` / `unsuspendFx.done` → refetch `$stats`
- `gradeFx.fail` → resync by refetching queue + stats (the optimistic advance was wrong)

**Readers:** `src/app/study/page.tsx`, `src/app/dictionary/page.tsx` (the "due" badge)

Moved out of `src/stores/` because only the Review feature uses it, and while it lived
there it imported from `src/features/Review/api` — a top-level module depending on a
feature slice.

**Persistence:** none — server is the source of truth; SM-2 + learning-step scheduling and per-grade interval projection (`projectedIntervals`, in seconds) all come from the backend

---

## Feature stores (`src/features/*/model/`)

### `$words`

File: `src/features/WordCard/model/index.ts`

Holds the array of `Word` objects returned by the last word search.

**Writers:** `fetchWordsFx.doneData`, `clearWords` event

**Readers:** `src/app/page.tsx` via `useUnit($words)`

**Persistence:** none

---

### `$kanji`

File: `src/features/KanjiCard/model/index.ts`

Holds the `Kanji` object returned by the last kanji lookup (single character).

**Writers:** `fetchKanjiFx.doneData`, `clearKanji` event

**Readers:** `src/app/page.tsx` via `useUnit($kanji)`

**Persistence:** none

---

### `$sentences`

File: `src/features/Sentence/model/index.ts` (re-exported from `src/features/Sentence/index.ts`)

Holds the array of parsed `SentenceToken[]` groups from the last sentence search.

**Writers:** `fetchSentenceFx.doneData`, `clearSentences` event

**Readers:** `src/app/page.tsx` via `useUnit($sentences)`

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

### `$items` / `$total` / `$deckSummaries`

File: `src/features/Dictionary/model/index.ts`

The dictionary page's current **page** of `SavedWord` rows, the count of everything
matching the filters, and the per-deck counts behind the two deck cards.

`$savedWords` — a single store holding the user's *entire* collection — was retired here.
It could not be both the page's list and the global "is this saved?" set once filtering
and paging moved to the backend: filtering one page client-side would have made
«Показано: N» disagree with the list. See `model/query.ts` for the URL-backed query that
drives it.

**Writers:** `loadPageFx.doneData` (replaces at `offset === 0`, appends otherwise),
`removeWordFx`, `updateStatusFx`, `toggleSuspendFx.doneData`, `fetchDeckSummariesFx.doneData`

**Readers:** `DictionaryPanel`, `src/app/dictionary/page.tsx` (header totals)

**Persistence:** BFF (`/api/dictionary`, `/api/review/stats`) when authenticated

---

### `$sessionSaved`

File: `src/features/Dictionary/model/index.ts`

Expressions saved during this session. With no store holding the whole collection,
"is this saved?" is answered by a **batched** backend call — `useSavedExpressions`
(`model/useSavedExpressions.ts`) asks `/api/dictionary/saved` once per rendered view
rather than once per word. This store unions in anything just saved, so a card flips
to "saved" without a refetch.

**Writers:** `addWordFx.doneData`

**Readers:** `useSavedExpressions`, consumed by `WordCard`, `WordInspector`, `KanjiCard`

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
