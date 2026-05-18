# UX/UI Description — Web Platform for Learning Hieroglyphic Languages

## Overview

The web platform is a Progressive Web Application (PWA) built on Next.js 14 with TypeScript. It provides an integrated environment for studying Japanese and Chinese, combining morphological analysis, dictionary lookup, and AI-powered grammar explanations in a single Russian-language interface. The UI adapts its content and display depending on the active language profile selected by the user.

---

## 1. Information Architecture

### 1.1 Navigation Structure

The application is organized into distinct sections, each serving a focused purpose:

| Section | Purpose | Available Actions |
|---|---|---|
| **Language Selection Screen** | Initial language profile setup | Choose Japanese or Chinese; read language overviews; save selection to user profile |
| **Home Page** | Universal search and analysis entry point | Enter a query; view search type hints; navigate to analysis results |
| **Text Analysis Page** | Morphological breakdown of an entered sentence | View tokens with furigana/pinyin; open Token Inspector; save words to vocabulary |
| **Word Inspector** | Detailed word information | View translation, grammar, examples, and character breakdown; add to personal dictionary |
| **Kanji/Hanzi Inspector** | Character-level card | View readings, radical, stroke count, level, and example words |
| **Personal Dictionary** | Saved words with mastery tracking | Filter by JLPT/HSK level and status; update status; delete entries |
| **Search History** | Archive of past queries | Re-run past searches; delete records |
| **Settings** | Profile and display preferences | Switch language mode; toggle furigana/pinyin display; clear history |

### 1.2 Language Profiles

The application operates in one of two language modes — **Japanese** or **Chinese** — selected at first launch and stored in the user profile. Mode switching is available from Settings.

- **Japanese mode**: displays furigana (hiragana transcription above kanji), on-yomi and kun-yomi readings, JLPT difficulty levels (N5–N1).
- **Chinese mode**: displays pinyin with tonal diacritics or numeric tones, HSK difficulty levels (1–6), and traditional character variants.

English input is supported natively in both profiles. The system handles reverse searches (lookup by English translation) without any additional configuration.

---

## 2. Screen Descriptions

### 2.1 Language Selection Screen

Displayed on first launch or when no saved profile exists.

- Contains two cards: **"Japanese"** and **"Chinese"**.
- Each card shows a brief description of the language's characteristics:
  - Japanese: three writing systems (hiragana, katakana, kanji), JLPT scale.
  - Chinese: tonal system, HSK scale.
- English input (reverse lookups, romanji, pinyin) is noted as supported in both profiles.
- The selection is saved to the `language` field of the user profile.

### 2.2 Home Page

The primary entry point to the platform.

- Contains a **search bar** with a placeholder text adapted to the active language mode:
  - Japanese mode: example prompts in Japanese (single character, word, sentence).
  - Chinese mode: equivalent prompts in Chinese.
- Below the search bar, **short hint labels** explain that the system accepts a single character, a word, or a full sentence — no manual mode selection required.
- The system automatically classifies the query type (kanji, hanzi, sentence, reverse) using a heuristic classifier based on Unicode character ranges.

### 2.3 Text Analysis Page

Displays the morphological breakdown of the entered sentence or phrase.

- Text is split into **tokens**, displayed horizontally.
- In **Japanese mode**: furigana (hiragana in small font) is shown above each token using the HTML `<ruby>` element.
- In **Chinese mode**: pinyin with tonal diacritics is displayed above each token via CSS positioning.
- **Color-coded parts of speech**: nouns, verbs, adjectives, particles, and auxiliary words are each assigned a distinct color, serving as a didactic aid for learners.
- Tapping/clicking a token opens the **Word Inspector**.
- A **DifficultyMeter** component displays the overall complexity level of the text as a horizontal bar with color segments (JLPT N5–N1 or HSK 1–6).

### 2.4 Word Inspector

A hierarchical panel with detailed information about a selected word.

**Sections (progressively disclosed):**
1. **Translation** — primary meaning in Russian.
2. **Grammar** — part of speech, grammatical form, JLPT or HSK level (depending on active mode).
3. **Example sentences** — contextual usage examples.
4. **Character breakdown** — list of constituent kanji/hanzi, each interactive (tap opens Kanji Inspector).
5. **Add to dictionary** — button to save the word to the personal vocabulary.

### 2.5 Kanji / Hanzi Inspector

A character-level detail card. Content differs by language mode.

**Japanese mode:**
- On-yomi (Chinese-origin reading) and kun-yomi (native Japanese reading).
- Radical and stroke count.
- JLPT difficulty level.
- List of common words containing this character.
- Stroke order: displayed as a static sequence of thumbnail illustrations loaded from cache.

**Chinese mode:**
- Pinyin with tonal marking.
- Radical and stroke count.
- Traditional character variant.
- HSK difficulty level.
- List of common words containing this character.
- Stroke order illustrations.

### 2.6 Personal Dictionary

A filtered list of saved words.

- **Filtering** by JLPT level (N5–N1) or HSK level (1–6).
- **Filtering** by mastery status: `new` / `learning` / `known`.
- Each entry shows: written form, reading (furigana or pinyin), and Russian translation.
- Tapping an entry opens the Word Inspector.
- Status can be updated with a single tap.

### 2.7 Settings

- Language mode switcher (Japanese ↔ Chinese).
- Toggles for showing/hiding furigana (Japanese mode) or pinyin (Chinese mode).
- Button to clear search history.

---

## 3. UX Rationale

### 3.1 Language Profiling

The decision to split the interface into separate Japanese and Chinese modes — rather than a unified multilingual search — is based on cognitive load theory. A user studying one language does not need data from the other; simultaneously displaying on-yomi, pinyin, JLPT levels, and HSK levels for a single result creates information overload. According to Sweller's (1988) principle of minimizing irrelevant information in instructional interfaces, reducing the number of simultaneously displayed elements lowers working memory load and improves the speed of processing learning content.

### 3.2 Progressive Disclosure

Information is revealed across a hierarchy of inspectors:

- **Home page**: only the search bar and query type hints.
- **Analysis page**: tokens with minimal annotations.
- **Word Inspector**: detailed grammatical data.
- **Kanji Inspector**: stroke-level and radical data.

This multi-level structure mirrors the hierarchical nature of hieroglyphic languages (sentence → word → character → radical → stroke), making the interface readable even for beginners.

### 3.3 Context-Adaptive Navigation

The visible screen is chosen automatically based on the query classifier result:

- A single character → **Kanji/Hanzi Inspector** opens directly.
- A word → **Word Inspector** opens directly.
- A sentence → **Text Analysis Page** opens.

This eliminates the need for the user to explicitly select a search mode, fulfilling the "smart search" requirement.

### 3.4 Automatic Query Classification

A heuristic classifier analyzes the input string using Unicode character ranges:

| Input type | Classification | Condition |
|---|---|---|
| Single kanji (JP) | `kanji` | 1–2 CJK characters, Japanese profile |
| Single hanzi (CN) | `hanzi` | 1–2 CJK characters, Chinese profile |
| Connected text | `sentence` | More than 2 Japanese/Chinese characters |
| English/romaji/pinyin | `reverse` | No CJK or kana characters detected |

No user interaction is required for classification.

---

## 4. Visual Style and Typography

### 4.1 Color System

**Part-of-speech color marking** (Text Analysis Page):

| Part of Speech | Color Purpose |
|---|---|
| Nouns | Distinct color |
| Verbs | Distinct color |
| Adjectives | Distinct color |
| Particles | Distinct color |
| Auxiliary words | Distinct color |

The color encoding functions as a didactic tool, allowing beginners to identify grammatical roles without knowing traditional Japanese or Chinese grammatical terminology.

**Difficulty level color coding** (DifficultyMeter, word cards):

| Level | Color |
|---|---|
| Beginner (JLPT N5, HSK 1–2) | Green tones |
| Intermediate (JLPT N3–N4, HSK 3–4) | Yellow tones |
| Advanced (JLPT N1–N2, HSK 5–6) | Red tones |

The visual level code lets learners instantly assess the difficulty of an unfamiliar word without reading a numeric value, speeding up navigation through analysis results.

### 4.2 Typography

- **Japanese mode**: Noto Sans JP (`@fontsource/noto-sans-jp`).
- **Chinese mode**: Noto Sans SC (`@fontsource/noto-sans-sc`).

Both fonts provide correct rendering of CJK characters (Chinese-Japanese-Korean) in any modern browser via `@font-face`, eliminating dependency on local system fonts. Font switching is implemented via CSS custom properties on the root element (`data-*` attribute), enabling the entire font stack to change without a page reload.

**Furigana rendering**: implemented through the HTML `<ruby>` element — the character is wrapped in `<rb>`, the reading in `<rt>`.

### 4.3 Design Philosophy

The interface uses a **minimalist design without decorative background elements**. This is intentional: CJK characters are visually dense by nature, and decorative backgrounds compete with learning content, making it harder to recognize stroke forms. The visual focus remains on the characters and their annotations at all times.

---

## 5. Key UI Components

| Component | Description | Technologies |
|---|---|---|
| `UniversalSearch` | Search bar with debounce (300 ms) and local Unicode-based pre-classification before server submission | `useCallback`, Effector `searchStore` |
| `SentenceAnalyzer` | Token list with furigana (JP) or pinyin (CN) above each word; color-coded by part of speech; click opens Word Inspector | Framer Motion (layout animation), CSS `ruby` |
| `WordInspector` | Hierarchical panel: translation, grammar, JLPT/HSK level, example sentences, character breakdown | Progressive disclosure, Effector `vocabularyStore` |
| `KanjiInspector` | Character card: onyomi/kunyomi (JP) or pinyin (CN), radical, stroke count, level, example words, stroke order animation | SVG stroke-order animation, `/api/kanji/{char}` |
| `DifficultyMeter` | Complexity level visualization: horizontal bar with color segments N5–N1 / HSK 1–6 | SVG, `AnalyzeResponse.complexity_level` |
| `SavedWordsList` | Personal dictionary with level and status filtering; one-tap status update | Effector `vocabularyStore`, SWR |

---

## 6. PWA & Mobile Support

The platform is implemented as a Progressive Web Application (PWA):

- **Service worker** caches static assets (JS bundles, Noto Sans fonts) on first visit, enabling correct UI rendering offline.
- **Dynamic API requests** use a network-first strategy with a cached fallback when offline.
- **Web app manifest** (`manifest.json`) defines the app name, 192×192 and 512×512 icons, theme color, and `display: standalone` — allowing installation to the home screen on both iOS and Android.
- The adaptive layout supports all modern mobile browsers (iOS 15+, Android 10+) with correct CJK character rendering.

---

## 7. Internationalization

- The UI language is **Russian**.
- An English locale (`locale/en.json`) is prepared for future expansion.
- Localization is implemented as static strings compiled at build time (no i18n runtime library), keeping the client bundle size minimal.
- Japanese and Chinese linguistic terms (kanji, hanzi, furigana, pinyin, on/kun readings, tonal marking) are displayed in their original form, as they are established terms in the pedagogy of these languages.

---

## 8. Accessibility & Performance

- **Initial interface load**: ≤ 3 seconds on a standard connection (non-functional requirement NFT).
- **CJK character rendering** is guaranteed on all platforms through self-hosted Noto Sans fonts.
- **Server Components** (Next.js App Router) handle static and metadata sections, reducing the client-side JavaScript bundle and improving First Contentful Paint.
- **Client Components** handle all interactive logic: search bar, inspectors, result panels.
- AI explanations are streamed via Server-Sent Events (SSE), so the user sees the response text appearing progressively rather than waiting for the full response.
