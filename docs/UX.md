# UX Design Rationale

Extracted from `ux_ui_description_1.md` (deleted after DOC.3). Describes the design
decisions behind the interface — the *why*, not the *how* (see ARCHITECTURE.md for that).

## Information architecture

| Section | Purpose | Available actions |
|---------|---------|------------------|
| Home | Universal search entry point | Enter query; view type hints; navigate to results |
| Text Analysis | Morphological sentence breakdown | View tokens with furigana/pinyin; open Word Inspector; save words |
| Word Inspector | Detailed word information | Translation, grammar, examples, character breakdown; add to dictionary |
| Kanji/Hanzi Inspector | Character-level card | Readings, radical, stroke count, level, example words, stroke order |
| Personal Dictionary | Saved words with mastery tracking | Filter by JLPT/HSK and status; update status; delete entries |
| Search History | Archive of past queries | Re-run searches; delete records |
| Settings | Profile and display preferences | Switch language mode; toggle furigana/pinyin; clear history |

## Language profiling

The UI operates in one of two modes — **Japanese** or **Chinese**. The decision to
separate them rather than unify is grounded in cognitive load theory (Sweller 1988):
simultaneously displaying on-yomi, pinyin, JLPT levels, and HSK levels for a single
result creates information overload. Splitting the modes reduces the number of
simultaneously displayed elements and lowers working memory load.

- **JP mode**: furigana above kanji, on-yomi/kun-yomi readings, JLPT N5–N1 levels
- **CN mode**: pinyin with tonal marks, HSK 1–6 levels, traditional character variants

English/romaji/pinyin input is supported in both modes via the reverse-lookup path.

## Progressive disclosure

Information is revealed in a hierarchy that mirrors the structure of hieroglyphic
languages (sentence → word → character → radical):

1. **Home**: only the search bar and query type hints
2. **Analysis**: tokens with minimal annotations
3. **Word Inspector**: detailed grammatical data
4. **Kanji Inspector**: stroke-level and radical data

This makes the interface readable for beginners without burying advanced data.

## Context-adaptive navigation

The visible screen is chosen automatically by the query classifier
(`src/features/Search/utils.ts:classifySearchQuery`):

- Single character → Kanji/Hanzi Inspector
- Word → WordCard + WordInspector
- Sentence → SentenceCard with token grid

No explicit mode selection required from the user.

## Query classification heuristic

| Input | Classification | Condition |
|-------|---------------|-----------|
| 1 CJK character, JP mode | `kanji` | Unicode range + mode |
| 1 CJK character, CN mode | `kanji` | Unicode range + mode |
| Multiple CJK / >6 chars | `sentence` | length / space heuristic |
| English / romaji / pinyin | `word` (reverse lookup) | no CJK/kana detected |

## Color system

**Part-of-speech colors** on the Text Analysis page are a didactic tool: learners
identify grammatical roles without knowing grammatical terminology. Each POS category
(noun, verb, adjective, particle, auxiliary) receives a distinct color. The mapping is
language-aware (JP MeCab tags vs CN POS codes) and lives in
`src/features/Sentence/lib/posColor.ts`.

The same color drives two places, so the eye connects them:

- the thin left marker + selected border on each `TokenRow`, and
- a soft background tint on each word in the **sentence header**, where every token's
  surface is rendered as its own span (`SentenceHighlight`). The tint reuses the POS
  `color` via `currentColor` + `color-mix`; a nested label resets text color to
  `--g-color-text-primary` so furigana/pinyin stay readable on any hue.

The header spans and the token rows share `selectedTokenIndex` (owned by
`SentenceCardView`), making the link **bidirectional**: clicking a word in the sentence
selects its row, scrolls it into view, and fires the right-column word lookup; hovering a
row outlines the matching word in the sentence. Characters that sit between surfaces
(punctuation, spacing) are emitted verbatim — see `src/features/Sentence/lib/segmentSentence.ts`,
which walks the sentence consuming each `surface_form` so no characters are ever dropped
even when the sentence is not a plain concatenation of surfaces.

**Difficulty level colors** (DifficultyMeter, planned):

| Level | Color tone |
|-------|-----------|
| Beginner — JLPT N5 / HSK 1–2 | Green |
| Intermediate — JLPT N3–N4 / HSK 3–4 | Yellow |
| Advanced — JLPT N1–N2 / HSK 5–6 | Red |

## Typography and design philosophy

- **Noto Sans JP / SC** via `next/font/google` — guarantees correct CJK rendering on all
  platforms without relying on local system fonts (see STYLING.md for the CSS variable
  switching mechanism)
- **Minimalist layout, no decorative backgrounds** — intentional: CJK characters are
  visually dense; decorative backgrounds compete with learning content and make stroke
  recognition harder

## Furigana and pinyin rendering

Both use the HTML `<ruby>/<rt>` element. The CSS rules (`ruby-align: center`,
`rt { font-size: 0.55em }`) are in `src/app/styles/globals.css`. The `FuriganaText`
shared component wraps the element; the `showFurigana` / `showPinyin` toggles in
`$userProfile` control visibility (a `false` toggle renders a plain `<span>`).

## PWA targets (planned — not yet implemented)

- Service worker caches JS bundles and Noto fonts for offline rendering
- Network-first strategy with cached fallback for API calls
- `manifest.json` for home-screen installation (iOS 15+, Android 10+)
- Target: Lighthouse PWA score ≥ 92 (noted in PLAN.md; implementation tracked in TASKS.md)

## Performance targets (per NFT)

- Initial load ≤ 3 s on standard connection
- AI explanation streamed via SSE so the user sees progressive output rather than waiting
  for the full response (already implemented — see ARCHITECTURE.md SSE section)
