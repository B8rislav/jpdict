# Components

Refresh this table when adding new shared UI primitives or feature view components.
Container components (store-connected) are noted separately below.

## Shared UI primitives (`src/shared/ui/`)

| Component | File | Purpose | Key props | Storybook story |
|-----------|------|---------|-----------|----------------|
| `AccordionSection` | `Accordion/AccordionSection.tsx` | Expand/collapse wrapper with animated panel | `title`, `children`, `defaultOpen?` | `AccordionSection.stories.tsx` |
| `AuthGate` | `AuthGate/AuthGate.tsx` | Renders children only when `$isAuthenticated`; shows login prompt otherwise | `children` | none (container-only) |
| `Card` | `Card/Card.tsx` | Generic card with border, padding, and optional shadow | `children`, `className?` | `Card.stories.tsx` |
| `CardList` | `CardList/CardList.tsx` | Virtualized list with a loading skeleton overlay | `children`, `loading`, `listWidth` | `CardList.stories.tsx` |
| `DefinitionList` | `DefinitionList/DefinitionList.tsx` | Renders an array of definition strings with numbering | `items?: string[]` | `DefinitionList.stories.tsx` |
| `FuriganaText` | `FuriganaText/FuriganaText.tsx` | Wraps kanji/kana pairs in `<ruby><rt>` | `surface`, `reading`, `show?: boolean` | `FuriganaText.stories.tsx` |
| `MarkerList` | `MarkerList/MarkerList.tsx` | Horizontal list of JLPT / HSK badge chips | `markers: string[]` | `MarkerList.stories.tsx` |

## Feature view components (`src/features/*/ui/`)

Pure components — no store imports. All data arrives via props from the container above.

| Component | File | Purpose | Key props | Storybook story |
|-----------|------|---------|-----------|----------------|
| `SearchView` | `Search/ui/SearchView.tsx` | Search input with type buttons and history dropdown | `inputValue`, `setInputValue`, `onButtonClick`, `queryType?`, `historyEntries?` | `SearchView.stories.tsx` |
| `WordCardView` | `WordCard/ui/WordCardView.tsx` | Single word result: kanji, reading, definitions, markers, save button | `word: Word`, `isSaved`, `onSave`, `onRemove`, `showFurigana` | none |
| `KanjiCardView` | `KanjiCard/ui/KanjiCardView.tsx` | Character card: readings, meaning, stroke order | `kanji: Kanji`, `language` | none |
| `StrokeOrder` | `KanjiCard/ui/StrokeOrder.tsx` | SVG stroke-order animation from KanjiVG CDN | `character: string` | `StrokeOrder.stories.tsx` |
| `SentenceCardView` | `Sentence/ui/SentenceCardView.tsx` | POS-highlighted sentence header + token grid; owns `selectedTokenIndex` and scrolls the matching row into view on header-span click | `sentence`, `tokens: SentenceToken[]`, `onTokenClick` | `SentenceCard.stories.tsx` |
| `SentenceHighlight` | `Sentence/ui/SentenceHighlight.tsx` | Renders the sentence header as POS-tinted, clickable spans; clicking a word selects its token | `sentence`, `tokens`, `selectedLanguage`, `selectedTokenIndex`, `onTokenSelect` | `SentenceHighlight.stories.tsx` |
| `AIOverviewAccordion` | `Sentence/ui/AIOverviewAccordion.tsx` | Expandable AI explanation panel; renders SSE stream as markdown | `sentence`, `tokens`, `onFetchOverview` | `AIOverviewAccordion.stories.tsx` |
| `TokenRow` | `Sentence/ui/TokenRow.tsx` | Single token with POS-coloured label; carries `data-token-index` for scroll targeting | `token: SentenceToken`, `onClick` | `TokenRow.stories.tsx` |
| `DeckSwitcherView` | `Dictionary/ui/DeckSwitcherView.tsx` | The two deck cards (Кандзи / Слова) with today's workload, progress and a study CTA | `decks: DeckSummary[]`, `openDeck`, `onOpenDeck`, `onStudy` | `DeckSwitcherView.stories.tsx` |
| `DictionaryFiltersView` | `Dictionary/ui/DictionaryFiltersView.tsx` | Search box plus level and status pills; level scale follows the study language | `deck`, `language`, `level`, `status`, `q`, `shown`, `on*Change` | `DictionaryFiltersView.stories.tsx` |
| `DictionaryPanelView` | `Dictionary/ui/DictionaryPanelView.tsx` | The open deck's collection: a virtualized row list for words, a virtualized tile grid for kanji | `deck`, `items`, `total`, `loading`, `canSpeak`, `onSpeak`, `onDelete`, `onAdvanceStatus`, `onEndReached` | `DictionaryPanelView.stories.tsx` |
| `ReviewCard` | `Review/ui/ReviewCard.tsx` | Flashcard: front shows the word, reveal flips to reading/meaning/markers; four grade buttons each label the backend-projected next interval; `Space` reveals, `1–4` grade | `card: ReviewCard`, `readingLabel`, `onGrade`, `initiallyRevealed?` | `ReviewCard.stories.tsx` |
| `StudyDashboard` | `Review/ui/StudyDashboard.tsx` | Due / new / learned counts with a "Start review" button; empty state when nothing is due | `stats: ReviewStats \| null`, `onStart` | `StudyDashboard.stories.tsx` |
| `LanguageCard` | `LanguageSelect/ui/LanguageCard.tsx` | JP / CN selection card | `language`, `selected`, `onClick` | `LanguageCard.stories.tsx` |

## Container components (store-connected, no story)

These components import from Effector stores directly and should not be imported into
Storybook stories without mocking.

| Component | File | Stores used |
|-----------|------|------------|
| `Search` | `Search/Search.tsx` | `$userProfile`, search/history effects |
| `WordCard` | `WordCard/WordCard.tsx` | `$userProfile`, `useSavedExpressions` (batched saved-check), dictionary effects |
| `SentenceCard` | `Sentence/SentenceCard.tsx` | `$userProfile` |
| `KanjiCard` | `KanjiCard/KanjiCard.tsx` | `$userProfile` |
| `WordInspector` | `WordInspector/WordInspector.tsx` | `$inspectedWord`, example sentence effect |
| `DictionaryPanel` | `Dictionary/DictionaryPanel.tsx` | `$items`, `$total`, `$deckSummaries`, dictionary effects; owns the URL-backed query via `useDictionaryFilters` |
| `AuthModal` | `Auth/AuthModal.tsx` | `loginFx`, `registerFx` |
| `AuthGate` | `features/Auth/AuthGate.tsx` | `$isAuthenticated`, `$sessionResolved` |
| Home page | `app/page.tsx` | all global stores |
| Study page | `app/study/page.tsx` | `$current`, `$queue`, `$stats`, review effects; `$userProfile`, `$isAuthenticated` |
