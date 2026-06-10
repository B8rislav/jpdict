# Tasks

## 🎨 Redesign — Human, Complete & Multilingual

> Three orthogonal redesign slices. Do them in order: layout first (so reviews of i18n/CN
> aren't poisoned by scrollbar noise), then i18n, then Chinese parity.
> Each slice has a "Done when" line — finish only when that's true.

### D1 — Single scroll source (kill the 3-scrollbar pile-up)

**Symptom:** after sentence search, the page has three vertical scrollbars at once —
the `react-window` `List` inside `SentenceCardView`, the `CardList` column, and the
window itself. Tracking the scrollbar that owns the wheel event is impossible.

**Target model:** the **window** is the only scroll surface. Cards grow to fit their
content; the page below grows to fit the cards. `react-window` is kept only because
sentences can have hundreds of tokens — but its viewport must be the *only* internal
scroller in the document.

- [x] **`CardList` — remove the inner scroll container.**
  - [src/shared/ui/CardList/CardList.module.css:8](frontend/src/shared/ui/CardList/CardList.module.css#L8): delete `overflow-y: scroll` and the `::-webkit-scrollbar*` rules below it.
  - [src/shared/ui/CardList/CardList.tsx:23](frontend/src/shared/ui/CardList/CardList.tsx#L23): drop the inline `height: listHeight` (let it size to content). Remove `padding-right: 15px` in the CSS — that gutter only exists for the now-removed scrollbar.
  - [src/shared/ui/CardList/CardList.tsx:6-10](frontend/src/shared/ui/CardList/CardList.tsx#L6-L10): make `listHeight` / `listWidth` optional (skeleton sizing only). Then in [src/app/page.tsx:138,141](frontend/src/app/page.tsx#L138) drop `listHeight={800}` (keep `listWidth` for column width if still needed, or replace with a `max-width` CSS variable).
- [x] **`SentenceCardView` virtual list — don't reserve a fixed scrollable viewport for short sentences.**
  - [src/features/Sentence/ui/SentenceCardView.tsx:35](frontend/src/features/Sentence/ui/SentenceCardView.tsx#L35) computes `listHeight = min(tokens, MAX_VISIBLE_ITEMS) * ITEM_SIZE`. For sentences ≤ `MAX_VISIBLE_ITEMS` tokens (the common case), bypass `react-window` and render plain `<TokenRow>`s in a flex column — no virtualization, no inner scroll.
  - For longer sentences, keep `react-window` but ensure its internal scrollbar is the only one in that card (no parent scroller above it).
  - Extract a `useVirtualizeTokens(tokens)` hook (or a simple ternary in the view) that returns either `<List>` or `<TokenRow…>` rows.
- [x] **Page chrome — let the window scroll.**
  - [src/app/page.module.css:1-3](frontend/src/app/page.module.css#L1): the `.page` container is fine. Verify nothing in `globals.css` sets `html { overflow: hidden }` or similar that would suppress the window scrollbar.
  - [src/app/page.module.css:28-31](frontend/src/app/page.module.css#L28) `.lists`: keep `display: flex` but allow children to grow vertically. `align-items: flex-start` so unequal-height columns don't stretch each other.
- [x] **Audit other forced overflow rules.**
  - [src/features/SearchHistory/SearchHistoryDropdown.module.css](frontend/src/features/SearchHistory/SearchHistoryDropdown.module.css) — the dropdown popover is allowed to scroll internally (it's bounded). Keep, but verify it doesn't introduce a *page-level* scrollbar when open.
  - [src/features/Dictionary/DictionaryWordCard/DictionaryWordCard.module.css](frontend/src/features/Dictionary/DictionaryWordCard/DictionaryWordCard.module.css) — same check.
- [x] **Sticky search bar (optional, but pairs naturally with single-scroll).**
  Since the window now scrolls, the search input scrolls out of view on long result lists. Either wrap the nav + `<Search />` in a `position: sticky; top: 0` band, or accept the scroll and document it.
- [x] **Done when:** searching `この本はとても面白いです。` (or any long sentence) produces exactly **one** scrollbar in the viewport, mouse-wheel events scroll the window from anywhere on the page, and the sentence card grows to its natural height with the `react-window` inner scroll only kicking in past `MAX_VISIBLE_ITEMS` rows.

---

### D2 — Full i18n (RU, EN, and ready for CN/JP)

**State today:** [src/shared/i18n/index.ts](frontend/src/shared/i18n/index.ts) imports
`ru.json` directly and ignores `en.json`. Roughly 30+ UI strings are still hardcoded
in Russian inside components. There's no UI locale switcher and no `Intl.PluralRules`
usage (see `pluralize` in [src/app/dictionary/page.tsx:39-43](frontend/src/app/dictionary/page.tsx#L39-L43)).

> **Scope note:** "UI locale" ≠ "study language". `selectedLanguage` (jp/cn) drives
> *what the user is learning*; `uiLocale` (ru/en/…) drives *what tongue the interface speaks*.
> Don't conflate them.

**D2.1 — Wire a real locale loader.**
- [x] Rewrite [src/shared/i18n/index.ts](frontend/src/shared/i18n/index.ts) to support multiple dictionaries:
  ```ts
  import ru from './ru.json';
  import en from './en.json';
  type Dict = typeof ru;
  type Locale = 'ru' | 'en';
  const dicts: Record<Locale, Dict> = { ru, en: en as Dict };
  let currentLocale: Locale = 'ru';
  export const setLocale = (l: Locale) => { currentLocale = l; };
  export const t = <C extends keyof Dict>(category: C, key: string): string =>
    (dicts[currentLocale][category] as Record<string, string>)?.[key]
      ?? (dicts.ru[category] as Record<string, string>)?.[key] // RU fallback
      ?? key;
  ```
  (If you'd rather avoid the module-level mutable, lift `currentLocale` to an Effector store and have `t` read it via a React hook `useT()` — but the simple form above is fine.)
- [x] Sync the dictionary shape. [src/shared/i18n/en.json](frontend/src/shared/i18n/en.json) is missing the entire `ui.*` and `word_type.*` sections that `ru.json` has — add them. Future locales must extend the same shape; consider a quick `npm` script that diffs keys and fails CI on missing entries.

**D2.2 — Add a UI locale store + switcher.**
- [x] Add `uiLocale: 'ru' | 'en'` to [src/stores/userProfile.ts](frontend/src/stores/userProfile.ts) (next to `selectedLanguage`, `showFurigana`, `showPinyin`). Default to `'ru'`. Persist to `localStorage` like the other profile fields.
- [x] On profile load, call `setLocale(uiLocale)` so `t()` uses the right dict from the first render.
- [x] Wire `<html lang>` via [src/app/HtmlLangSync.tsx](frontend/src/app/HtmlLangSync.tsx) — it currently only writes `data-lang` for the *study* language; also write `lang={uiLocale}`. Remove the hardcoded `lang="ru"` in [src/app/layout.tsx:37](frontend/src/app/layout.tsx#L37).
- [x] Add a small locale picker (`RU | EN`) in the top nav of [src/app/page.tsx:70-131](frontend/src/app/page.tsx#L70-L131), to the right of the JP/CN switcher. Either two `<Button>`s or a tiny `<Select>` — match the existing nav style.

**D2.3 — Sweep hardcoded strings.**
Replace every literal Russian/English UI string with `t('ui', 'some_key')`. Add the keys to both `ru.json` and `en.json`. Files with confirmed offenders:

  - [src/app/page.tsx:30-31,87,97,109,124,129](frontend/src/app/page.tsx#L30-L31): `'Японский'`, `'Китайский'`, `'Фуригана'`, `'Пиньинь'`, `'Мой словарь'`, `'Выйти'`, `'Войти'`.
  - [src/app/settings/page.tsx:38](frontend/src/app/settings/page.tsx#L38): `'Японский' / 'Китайский'` ternary.
  - [src/app/dictionary/page.tsx:40-42](frontend/src/app/dictionary/page.tsx#L40-L42): the `pluralize` helper for `слово / слова / слов` — replace with `new Intl.PluralRules(uiLocale).select(n)` keyed lookups in the dict (e.g. `t('dict_count', 'one' | 'few' | 'many' | 'other')`).
  - [src/features/Search/Search.tsx:43](frontend/src/features/Search/Search.tsx#L43): `'Выберите язык для поиска'`.
  - [src/features/Search/ui/SearchView.tsx:114](frontend/src/features/Search/ui/SearchView.tsx#L114): inline fallback `'Одиночный иероглиф, слово или предложение'`.
  - [src/features/Auth/AuthModal.tsx:43,54,104](frontend/src/features/Auth/AuthModal.tsx#L43): `'Ошибка'`, `'Войти'/'Регистрация'`, `'Войти'/'Создать аккаунт'`. Plus all field labels in that modal.
  - [src/features/Sentence/ui/AIOverviewAccordion.tsx:41,69](frontend/src/features/Sentence/ui/AIOverviewAccordion.tsx#L41): `'Неизвестная ошибка'`, `'Свернуть обзор'/'Показать обзор'`.
  - [src/features/Dictionary/DictionaryPanel.tsx:71](frontend/src/features/Dictionary/DictionaryPanel.tsx#L71): `'Словарь пуст'/'Нет слов по фильтру'`. Sweep the rest of `DictionaryPanel` and `DictionaryWordCard` (status labels, level filters) in the same pass.
  - [src/features/WordCard/ui/WordCardView.tsx:44](frontend/src/features/WordCard/ui/WordCardView.tsx#L44): `'Сохранено'/'Сохранить'`.
  - [src/features/WordInspector/WordInspector.tsx:57,61,65,71,78,99,104,121](frontend/src/features/WordInspector/WordInspector.tsx#L57): `'Перевод'`, `'Грамматика'`, `'Часть речи'`, `'Pitch'`, `'Примеры'`, `'Примеры не найдены'`, `'Иероглифы'`, `'Сохранено'/'Добавить в словарь'`. Note the section title `'Иероглифы'` should be locale-aware *and* study-language-aware (see D3).
  - [src/app/layout.tsx:25-28](frontend/src/app/layout.tsx#L25-L28): `metadata.title` / `metadata.description` — these are SSR'd. Either localize via `generateMetadata` reading a cookie/header, or pick a neutral default. Lowest-effort: leave them in RU for now and add a TODO.

**D2.4 — Lint guard.**
- [x] Add a quick custom ESLint rule (or a `no-restricted-syntax` regex) that errors on Cyrillic string literals (`/[А-Яа-яёЁ]/`) in `.tsx` files outside `src/shared/i18n/**` and `**/*.stories.tsx`. Stops the rot from re-growing.

- [x] **Done when:** flipping the UI locale switcher swaps every visible string in the nav, search, cards, dictionary, auth modal, and settings page — and `git grep -nE "'[А-Яа-яёЁ]" src --include='*.tsx'` returns nothing outside i18n/stories.

---

### D3 — Chinese hanzi parity with Japanese kanji

**Symptom:** after a Chinese word query, the WordInspector renders the "Иероглифы"
grid but **clicking a character does nothing visible**. Root cause in
[src/features/KanjiCard/api/fetchKanji.ts:13](frontend/src/features/KanjiCard/api/fetchKanji.ts#L13):

```ts
if (language !== 'jp') return [];
```

So `fetchKanjiFx` resolves to `[]`, `$kanji` stays empty, and no card mounts.
Several adjacent gaps stack on top of that.

> "Hanzi" / "hangxi" in the user prompt = 漢字/汉字, i.e. Chinese single-character lookup
> with pinyin, radical, definition. Same shape as the Japanese kanji card.

**D3.1 — Backend / data path.**
- [x] Decide where Chinese character data comes from. Two viable paths:
  - **A.** Extend `backend/app/routers/kanji.py` to serve `/api/hanzi/{char}` (or accept a `?lang=cn` query) backed by a CC-CEDICT / Unihan dataset.
  - **B.** Add a new BFF route `src/app/api/hanzi/[char]/route.ts` that hits a public hanzi API and maps the response into `BackendKanjiCard`-shape.
  Pick one; document the choice in a one-paragraph note at the top of the slice.
- [x] If choosing A: add the migration / data load task to this slice's checklist (don't dump it on the backend phase).

**D3.2 — Frontend wiring.**
- [x] [src/features/KanjiCard/api/fetchKanji.ts:13](frontend/src/features/KanjiCard/api/fetchKanji.ts#L13): drop the `language !== 'jp'` early return. Branch on `language` to pick the endpoint (`kanji/…` vs `hanzi/…`) and map both into the existing `Kanji` shape.
- [x] [src/shared/api/types.ts:16-26](frontend/src/shared/api/types.ts#L16-L26): the `Kanji` type today carries `kunyomi` / `onyomi` (Japanese-only) and has no `pinyin` field. Today's workaround in [src/features/KanjiCard/ui/KanjiCardView.tsx:46](frontend/src/features/KanjiCard/ui/KanjiCardView.tsx#L46) crams pinyin into `radical_name`, which is **a bug** — `radical_name` is then *also* displayed in the radical block at line 53. Fix by adding `pinyin?: string` to `Kanji` and rendering from the right field.
- [x] [src/features/KanjiCard/ui/KanjiCardView.tsx:43-48](frontend/src/features/KanjiCard/ui/KanjiCardView.tsx#L43-L48): rewrite the `cn` branch to render `pinyin` from `pinyin` (not `radical_name`), and add a `Tone marks` line if useful.
- [x] Verify [src/features/WordInspector/WordInspector.tsx:29](frontend/src/features/WordInspector/WordInspector.tsx#L29): the `kanjiChars` extraction uses `word.kanji_full` and `CJK_REGEX`. For Chinese words the field is *also* called `kanji_full` today (see [types.ts:5-14](frontend/src/shared/api/types.ts#L5-L14)), which is a misnomer but works. Either rename `kanji_full → cjk_full` (or split into `kanji_full` + `hanzi_full`) — pick now, before more code accumulates.
- [x] Verify the click in [src/features/WordInspector/WordInspector.tsx:38-41](frontend/src/features/WordInspector/WordInspector.tsx#L38-L41) actually surfaces a card in CN mode: after the fetch unblocks, the `<KanjiCard>` (or hanzi card) must render in the same column as it does for JP. Today the only renderer is [src/app/page.tsx:142-150](frontend/src/app/page.tsx#L142-L150) — confirm it mounts.

**D3.3 — Locale-aware copy.**
- [x] Section title in WordInspector is `'Иероглифы'`. After D2 it'll come from `t('ui', 'inspector_chars_section')`. The *translation* of that key should also branch on `selectedLanguage` (study lang): RU/JP → "Кандзи", RU/CN → "Иероглифы", EN/JP → "Kanji", EN/CN → "Hanzi". Either pass `selectedLanguage` into `t()` or use composite keys (`inspector_chars_section_jp`, `inspector_chars_section_cn`).
- [x] Same treatment for the reading label in [src/features/WordCard/WordCard.tsx:18](frontend/src/features/WordCard/WordCard.tsx#L18) and [WordInspector.tsx:43](frontend/src/features/WordInspector/WordInspector.tsx#L43) — `'Hiragana' / 'Pinyin'` is already study-lang-conditional, but the *RU* user should see `'Хирагана' / 'Пиньинь'`.

**D3.4 — Test it end-to-end.**
- [x] Add a manual test checklist to the PR:
  - Search a Chinese word (e.g. `中国`), click each hanzi → card mounts with pinyin + radical + definition.
  - Switch to JP, search a Japanese word with kanji (e.g. `日本語`), click each → still works (no regression).
  - In CN mode, clicking a non-CJK char in a definition should not crash.
- [x] (Optional, recommended) Add a Vitest test for `fetchKanji` that asserts the `cn` branch hits the right endpoint and maps `pinyin` correctly.

- [x] **Done when:** in CN mode, clicking any hanzi inside `WordInspector`'s "Иероглифы/Hanzi" grid mounts a fully-populated hanzi card with **pinyin (not stuffed into `radical_name`)**, radical, and definition — matching the JP/kanji UX one-for-one.

---

### Execution order for this section
D1 → D2 → D3. D1 is invisible-but-foundational (no diff churn for the others).
D2 introduces a key-add discipline that D3 then *uses* for its hanzi-vs-kanji labels.
D3 depends on the type cleanup in D2.2/D2.3 only loosely — if D2 stalls, D3 can run
in parallel as long as it adds keys to both `ru.json` and `en.json` as it goes.

---

## ✨ A — Liveliness & Motion

> Goal: the app should feel **alive** — results breathe in instead of popping, the
> review card flips and flings, numbers tick up, sections expand smoothly. We already
> ship [`motion`](https://www.npmjs.com/package/motion) v12 (imported as `motion/react`),
> but it's used in exactly **one** place ([src/shared/ui/Card/Card.tsx](frontend/src/shared/ui/Card/Card.tsx))
> and that one usage has bugs (see A0). This section turns motion into a first-class,
> consistent layer — not a pile of ad-hoc `whileInView`s.
>
> **Non-negotiables for every task below:**
> - Animate **`transform` + `opacity` only** (and `height` via motion's layout where
>   called out). Never animate `top`/`left`/`width` in a hot path.
> - **Respect `prefers-reduced-motion`** — A0 builds the guard; every later task uses it.
>   "Alive" must never mean "unusable for someone who gets motion-sick."
> - Keep keyboard/focus flow intact. The review keyboard shortcuts
>   ([ReviewCard.tsx:46-62](frontend/src/features/Review/ui/ReviewCard.tsx#L46-L62)) must
>   still fire mid-animation.
> - No new animation library. `motion` + CSS only. The existing `@keyframes spin`
>   ([AIOverviewAccordion.module.css:65-72](frontend/src/features/Sentence/ui/AIOverviewAccordion.module.css#L65))
>   and `chevron` rotate ([AccordionSection.module.css:28-35](frontend/src/shared/ui/Accordion/AccordionSection.module.css#L28))
>   stay as-is unless a task says otherwise.

### A0 — Motion foundation (do this first)

The current [Card.tsx](frontend/src/shared/ui/Card/Card.tsx) is the whole motion story today, and it's subtly wrong:

```tsx
<motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
```

- `whileInView` **re-fires every time the card scrolls back into view** — no `viewport={{ once: true }}`, so cards flicker on every scroll-up. It should animate in **once**.
- There's no `AnimatePresence` wrapping the list, so cards never animate **out** — a new search hard-swaps the DOM.
- This wrapper is applied to **`ReviewCard` too** ([ReviewCard.tsx:64](frontend/src/features/Review/ui/ReviewCard.tsx#L64)), so the study card inherits a fade-up it shouldn't have (A2 gives it a purpose-built entrance).

- [ ] **Create `src/shared/motion/index.ts`** — the single source of truth for motion. Export:
  - `DURATION` (e.g. `{ fast: 0.15, base: 0.25, slow: 0.4 }`) and `EASE` (a shared cubic-bezier array, e.g. `[0.22, 1, 0.36, 1]` for the "settle" feel).
  - Reusable `Variants`: `fadeUp`, `staggerContainer` (with `staggerChildren`), `cardEnter`, `flip`.
  - A `useReducedMotion()` re-export (motion ships one) **and** a `springOrInstant(reduced)` helper so every component has one call to neuter itself.
- [ ] **Global reduced-motion guard.** Add to [src/app/styles/globals.css](frontend/src/app/styles/globals.css):
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
  This catches the CSS-side animations (spinner, chevron, accordion transitions) for free; motion components read the JS hook from `src/shared/motion`.
- [ ] **Fix the existing `Card.tsx`.** Add `viewport={{ once: true, margin: '-40px' }}`, pull `initial`/`whileInView`/`transition` from the shared `cardEnter` variant, and gate it on `useReducedMotion()`. Don't add exit here — exit belongs to the `AnimatePresence` in A1.
- [ ] **Done when:** `src/shared/motion/index.ts` exists and is the only place durations/eases are declared; scrolling a long result list up-and-down no longer re-triggers the card fade; toggling OS "reduce motion" makes every animation in the app collapse to an instant state.

### A1 — Results breathe in (list stagger + swap-out)

**Today:** [CardList.tsx](frontend/src/shared/ui/CardList/CardList.tsx) renders `props.children` (or skeletons) in a plain `<ul>`. Each `Card` independently fades up; there's no coordination, no exit, and the skeleton→content handoff is an instant cut.

- [ ] **Stagger the children.** In [CardList.tsx](frontend/src/shared/ui/CardList/CardList.tsx), wrap the `<ul>` in a `motion.ul` using the `staggerContainer` variant so cards cascade in (~50–70ms apart) instead of all at once. The per-`Card` `cardEnter` from A0 becomes the child variant — switch `Card` from `whileInView` to `variants`/`initial`/`animate` driven by the parent container so the stagger actually propagates.
- [ ] **Animate the swap.** When a new search replaces results, the old cards should leave (fade + slight `y`/scale-down) before/under the new set. Wrap the rendered children in `<AnimatePresence mode="popLayout">`. This requires **stable keys** — confirm the home page maps results with a domain id, not array index ([src/app/page.tsx:142-160](frontend/src/app/page.tsx#L142-L160) where `sentences`/`words`/`kanji` are built).
- [ ] **Skeleton → content crossfade.** The `loading ? skeletons : children` branch ([CardList.tsx:21-27](frontend/src/shared/ui/CardList/CardList.tsx#L21-L27)) is a hard cut. Give the two branches different `AnimatePresence` keys so the skeleton fades out as real cards fade in. Keep the Gravity `Skeleton` shimmer.
- [ ] **Done when:** submitting a search makes results cascade in top-to-bottom; submitting a *second* search animates the first set out and the second in (no instant DOM swap); the loading skeletons crossfade into real cards.

### A2 — The review card comes alive (flip + fling)

This is the centerpiece — the study loop should feel tactile. [ReviewCard.tsx](frontend/src/features/Review/ui/ReviewCard.tsx) today does instant conditional swaps: `revealed ? <back+grades> : <reveal button>`, and a *new* card just replaces the old via `setRevealed(false)`.

- [ ] **Card-to-card transition.** Wrap the card in `<AnimatePresence mode="wait">` keyed by `card.id` (the id is already tracked in [ReviewCard.tsx:28-35](frontend/src/features/Review/ui/ReviewCard.tsx#L28-L35)). The outgoing card flings off; the next slides/scales in. Do this at the session level in [src/app/study/page.tsx:60-66](frontend/src/app/study/page.tsx#L60-L66) (the `<ReviewCard … />` mount) so the *whole* card animates, not just its insides.
- [ ] **Reveal = 3D flip.** Replace the instant `revealed` swap with a Y-axis flip (front face → back face) using `rotateY` + `backface-visibility: hidden` on two stacked faces, or motion's `<AnimatePresence>` with a flip variant. The front holds `card.kanji_full`/`MarkerList`; the back holds the reading + `DefinitionList`. Keep `Space` as the trigger.
- [ ] **Grade = directional fling.** When the user grades, the card should leave in a direction that *means something*: `again` flings left/red, `easy` flings right/green (use `GRADE_VIEW`/the grade identity from [constants](frontend/src/features/Review/constants.ts)). Drive the exit variant from the chosen `Grade` before `onGrade` swaps in the next card. Grade buttons themselves spring in after the flip (stagger).
- [ ] **(Optional) drag to grade.** Make the revealed card draggable (`drag="x"`) with a snap-back; cross a threshold left/right to grade `again`/`good`. Power-user affordance — keep keyboard + buttons as the primary path.
- [ ] **Done when:** revealing flips the card in 3D; grading flings it off in a grade-appropriate direction and the next card animates in; spamming `Space`+`1–4` on the keyboard never desyncs the animation from the data; reduced-motion turns all of it into instant face-swaps.

### A3 — Numbers that count up (StudyDashboard)

[StudyDashboard.tsx](frontend/src/features/Review/ui/StudyDashboard.tsx) renders `due`/`new`/`learned` as static `<Text variant="display-2">`. Make them tick up on mount — small touch, big "alive" payoff on the first screen of the study flow.

- [ ] Build a tiny `<CountUp value={n} />` (or `useAnimatedNumber`) on `useMotionValue` + `animate()` + `useTransform(v => Math.round(v))`, easing 0→`n` over ~`DURATION.slow`. Use it for all three counts ([StudyDashboard.tsx:24-40](frontend/src/features/Review/ui/StudyDashboard.tsx#L24-L40)).
- [ ] When `due > 0`, give the **Start** button ([StudyDashboard.tsx:44-46](frontend/src/features/Review/ui/StudyDashboard.tsx#L44-L46)) a subtle attention pulse (one-shot scale breathe, or `whileHover`/`whileTap` scale). When `all_caught_up`, the empty-state text fades in gently — no pulse.
- [ ] Re-run the count-up when stats change (e.g. returning from a session via `endSession` → `fetchStatsFx` in [study/page.tsx:42-45](frontend/src/app/study/page.tsx#L42-L45)) by keying on the stats values.
- [ ] **Done when:** opening `/study` animates the three counters from 0 to their values; a due count > 0 visibly invites the user to the Start button; reduced-motion shows final numbers immediately.

### A4 — Sections that expand, not jump (accordions + streaming)

Two accordions snap open today. [AccordionSection.tsx](frontend/src/shared/ui/Accordion/AccordionSection.tsx) only rotates its chevron ([AccordionSection.module.css:28-35](frontend/src/shared/ui/Accordion/AccordionSection.module.css#L28)) — the content just appears. Used by `WordInspector` sections and (optionally) `AIOverviewAccordion`.

- [ ] **Animate `height: auto`.** Wrap the `.sectionContent` of [AccordionSection.tsx](frontend/src/shared/ui/Accordion/AccordionSection.tsx) in `<AnimatePresence>` + `motion.div` with `initial/animate/exit` on `height` (0 ↔ `auto`) and `opacity`. Motion handles `auto` height measurement — no manual `scrollHeight` math. This upgrades every `WordInspector` section ([WordInspector.tsx](frontend/src/features/WordInspector/WordInspector.tsx)) at once.
- [ ] **AI Overview reveal.** [AIOverviewAccordion.tsx](frontend/src/features/Sentence/ui/AIOverviewAccordion.tsx) expands the overview body on toggle — give the `.overviewContentContainer` the same height/opacity transition. Keep the existing spinner.
- [ ] **Streaming feel.** The overview text arrives in SSE chunks ([AIOverviewAccordion](frontend/src/features/Sentence/ui/AIOverviewAccordion.tsx) accumulates a growing string). Instead of the text box jumping in height on each chunk, let the container `layout`-animate its height, and optionally fade the most-recent chunk in. Don't animate per-character — that fights the stream rate.
- [ ] **Done when:** opening any `WordInspector` section glides its content open instead of snapping; the AI overview body expands smoothly and grows without jank as chunks stream; reduced-motion = instant open.

### A5 — Search & navigation polish

- [ ] **History dropdown enter/exit.** [SearchHistoryDropdown](frontend/src/features/SearchHistory/SearchHistoryDropdown.tsx) appears/disappears via CSS today. Wrap it in `<AnimatePresence>` for a fade+slide-down on open and a real exit on close (CSS can't animate unmount). Per-row delete should collapse the row (`layout` + exit), not pop it out.
- [ ] **Active-nav indicator.** The top nav in [src/app/page.tsx](frontend/src/app/page.tsx) and the JP/CN + locale switchers have no animated "selected" state. Use a shared `layoutId` pill that slides under the active language/locale button (motion's `layout` shared-element transition). Same trick for the `/`, `/dictionary`, `/study`, `/settings` nav if there's a persistent nav bar.
- [ ] **(Optional) route transitions.** With the App Router, wrap page content in a `motion.main` template (`src/app/template.tsx`) for a cross-route fade/slide. Keep it cheap — App Router re-mounts on navigation, so this is a per-page `initial`/`animate`, no `AnimatePresence` gymnastics needed.
- [ ] **Done when:** the search-history dropdown animates in and out (not just CSS-fades while mounted); deleting a history row collapses it; the active language/locale has a sliding indicator that follows the selection.

### A6 — Micro-interactions (the small alive moments)

- [ ] **Save-word success.** [WordCardView.tsx:44](frontend/src/features/WordCard/ui/WordCardView.tsx#L44) flips a label `'Сохранить' → 'Сохранено'` with no feedback. On save, pop the button (scale spring) and morph the icon/label — a quick checkmark or heart-fill that confirms the action. Mirror in [WordInspector.tsx](frontend/src/features/WordInspector/WordInspector.tsx)'s add-to-dictionary button.
- [ ] **Button press feedback.** Give the primary actions (`reveal`, `start`, grade buttons, search submit) a `whileTap={{ scale: 0.97 }}` via a tiny `motion`-wrapped button helper or a CSS `:active` transform. Keep it uniform — pull the scale value from `src/shared/motion`.
- [ ] **Token hover/select.** Sentence tokens ([TokenRow.tsx](frontend/src/features/Sentence/ui/TokenRow.tsx)) are clickable; a subtle hover lift / selected-token highlight makes the sentence feel interactive. Mind that `TokenRow` is a `react-window` row — animate the inner content, not the virtualized row wrapper whose `style` is owned by the list.
- [ ] **Done when:** saving a word gives a visible, satisfying confirmation; primary buttons depress on tap; hovering/selecting a sentence token reads as interactive — all of it off under reduced-motion.

### A7 — Verify & guard

- [ ] **Stories for the moving parts.** Add/extend stories so animations are eyeball-able offline (pairs with the **S** section): a `ReviewCard` story that flips and grades on a timer; a `CardList` story showing stagger + swap; a `StudyDashboard` story to watch the count-up. Reuse Storybook `action()` for callbacks.
- [ ] **Reduced-motion story/check.** Add a Storybook a11y check (the `@storybook/addon-a11y` is already a devDep) or a manual checklist confirming each animated component honors `prefers-reduced-motion`.
- [ ] **Perf sanity.** Spot-check in DevTools that animated frames stay on the compositor (no layout thrash): the only `height`-animated thing should be the accordions (A4), and those should still be smooth. No `console` warnings about non-animatable values.
- [ ] **Done when:** `npm run test:storybook` is green with the new stories; every animated component has a documented reduced-motion behavior; no animation animates a layout-triggering property outside A4's intentional height transitions.

### Execution order for this section
A0 → A1 → A2 → (A3, A4, A5, A6 in any order) → A7.
A0 is mandatory-first — everything else imports `src/shared/motion` and relies on the
reduced-motion guard. A2 (review flip) is the highest-impact single task; do it right
after A1 so the shared `AnimatePresence`/variant patterns from the card list carry over.

---

## 📚 S — Storybook coverage for view components

> Goal: every pure view component under `*/ui/*.tsx` has a `*.stories.tsx` next to it.
> Containers (files that import from `effector-react` or `@/stores/*`) are explicitly
> out of scope — Storybook is meant for the pure render layer. The R3 boundary already
> guarantees that split, so the test is mechanical.
>
> Pattern to follow (already used in [WordCard.stories.tsx](frontend/src/features/WordCard/WordCard.stories.tsx),
> [KanjiCard.stories.tsx](frontend/src/features/KanjiCard/KanjiCard.stories.tsx),
> [SentenceCard.stories.tsx](frontend/src/features/Sentence/SentenceCard.stories.tsx)):
> - import the `*View` component (not the container);
> - use `@storybook/nextjs-vite`;
> - wrap with a width decorator;
> - export at least one `Primary` story, plus one variant per meaningful prop axis
>   (e.g. `WithMarkers` / `NoMarkers`, `Saved` / `Unsaved`, `JP` / `CN`, `Loading` / `Empty`).

### S1 — Audit & checklist
- [x] Run `find src -path '*/ui/*.tsx' -not -name '*.stories.tsx' -not -name '*.test.tsx'` and cross-reference against existing `*.stories.tsx`. Confirmed current state at time of writing:
  - **Has stories:** `WordCardView`, `KanjiCardView`, `SentenceCardView`, `DictionaryWordCard`, `FuriganaText`.
  - **Missing — shared/ui:** `MarkerList`, `DefinitionList`, `AccordionSection`, `Card`, `CardList`.
  - **Missing — feature view layer:** `SearchView`, `AIOverviewAccordion`, `TokenRow`, `LanguageCard`, `StrokeOrder`.
  - **Maybe skip (judgement call):** `AuthGate` (logic-only wrapper, no visual surface), `HtmlLangSync` (no DOM output), `ThemeProvider` (effector + provider, no useful Story args).

### S2 — Shared UI primitives (`src/shared/ui/*`)
- [x] **`MarkerList`** ([src/shared/ui/MarkerList/MarkerList.tsx](frontend/src/shared/ui/MarkerList/MarkerList.tsx)). Stories: `Empty`, `OneMarker`, `ManyMarkers` (e.g. `['N1','common','音読み','形容詞']`).
- [x] **`DefinitionList`** ([src/shared/ui/DefinitionList/DefinitionList.tsx](frontend/src/shared/ui/DefinitionList/DefinitionList.tsx)). Stories: `SingleItem`, `MultipleItems`, `LongDefinitions` (line-wrap behavior).
- [x] **`AccordionSection`** ([src/shared/ui/Accordion/AccordionSection.tsx](frontend/src/shared/ui/Accordion/AccordionSection.tsx)). Stories: `Closed`, `OpenByDefault`, `WithOnFirstExpand` (use Storybook actions to log calls).
- [x] **`Card`** ([src/shared/ui/Card/Card.tsx](frontend/src/shared/ui/Card/Card.tsx)). One `Primary` story with placeholder children — mostly a visual regression target for the global card chrome.
- [x] **`CardList`** ([src/shared/ui/CardList/CardList.tsx](frontend/src/shared/ui/CardList/CardList.tsx)). Stories: `Loading` (skeleton variant), `WithChildren`, `Empty`. **Note:** after D1 the `listHeight` prop becomes optional/dead — bring the stories in line with whatever D1 lands.

### S3 — Feature view components
- [x] **`SearchView`** ([src/features/Search/ui/SearchView.tsx](frontend/src/features/Search/ui/SearchView.tsx)). Stories: `Empty`, `Typing`, `Submitting`, `WithHistory`, `QueryTypeKanji` / `QueryTypeSentence` / `QueryTypeWord`. Mock callbacks via Storybook `action()`.
- [x] **`AIOverviewAccordion`** ([src/features/Sentence/ui/AIOverviewAccordion.tsx](frontend/src/features/Sentence/ui/AIOverviewAccordion.tsx)). Stories: `Collapsed`, `Streaming` (pass a fake `onFetchOverview` that emits chunks on a setTimeout chain), `Loaded`, `Error`. The streaming story is the high-value one — it's the only way to eyeball chunk-flicker without a live OpenRouter key.
- [x] **`TokenRow`** ([src/features/Sentence/ui/TokenRow.tsx](frontend/src/features/Sentence/ui/TokenRow.tsx)). `TokenRow` is a `react-window` row component — render it standalone with a mocked `style`/`ariaAttributes` and a single-element `tokens` array. Stories: `JapaneseNoun`, `JapaneseVerb` (different `getPosClass` outcomes), `ChineseToken`, `FuriganaShown` / `FuriganaHidden`, `Selected`.
- [x] **`LanguageCard`** ([src/features/LanguageSelect/ui/LanguageCard.tsx](frontend/src/features/LanguageSelect/ui/LanguageCard.tsx)). Stories: `Japanese`, `Chinese`, `Selected`, `Disabled` (if applicable).
- [x] **`StrokeOrder`** ([src/features/KanjiCard/ui/StrokeOrder.tsx](frontend/src/features/KanjiCard/ui/StrokeOrder.tsx)). Stories: `WithSvg` (single common kanji like `日`), `MissingSvg` (synthetic char to exercise the fallback path), `Loading`. Be careful: this component fetches from a CDN — provide a Storybook decorator (or MSW handler) that stubs the network so stories are offline-reproducible.

### S4 — Refactors that *unblock* stories
Some view components today still close over store reads (R3 was thorough but not exhaustive). Before writing the Story, verify:
- [x] `WordInspector` ([src/features/WordInspector/WordInspector.tsx](frontend/src/features/WordInspector/WordInspector.tsx)) reads `$userProfile`, `$exampleSentences`, `$savedWords` and calls `fetchExampleSentencesFx`, `clearKanji`, `fetchKanjiFx`, `addWordFx`. To make it Story-friendly, extract a `WordInspectorView` taking everything as props (`onKanjiClick`, `onSave`, `onExpandExamples`, `exampleSentences`, `examplesPending`, `isSaved`, `selectedLanguage`). Then add `Primary`, `Saved`, `LoadingExamples`, `EmptyExamples` stories. This pairs naturally with D3.
- [x] `AuthModal` ([src/features/Auth/AuthModal.tsx](frontend/src/features/Auth/AuthModal.tsx)) similarly mixes state + side effects + view. Either split into `AuthModalView` first, or accept that this one stays story-less for now and document the skip.

### S5 — CI / hygiene
- [x] Confirm `npm run test:storybook` runs all stories without crashing — that's the cheapest regression test.
- [x] Add a `storybook:build` smoke test to CI if not already wired (`npm run build:storybook` exists).
- [x] (Optional) `@chromatic-com/storybook` is already a devDep — if anyone wants visual-regression coverage, this is the moment to wire it.

- [x] **Done when:** every file matching `src/**/ui/*.tsx` (excluding the explicit skip-list in S1) has a co-located `*.stories.tsx` with ≥ 2 stories, and `npm run test:storybook` is green.

---

## 📖 DOC — Frontend architecture & component documentation

> Mirror of `backend/TASKS.md` Phase 14. Goal: a self-contained `frontend/docs/` tree
> that lets a new contributor (or future me) navigate the codebase without re-reading
> every file. Keep prose tight: each doc should be skimmable in under five minutes.
>
> Existing artifacts to fold in (not delete blindly):
> [PLAN.md](frontend/PLAN.md), [README.md](frontend/README.md),
> [ux_ui_description_1.md](frontend/ux_ui_description_1.md). After this section,
> `PLAN.md` and `ux_ui_description_1.md` should either move into `docs/` or be deleted
> with a note in the commit.

### DOC.1 — Scaffold
- [x] Create `frontend/docs/` and `frontend/docs/README.md` — index linking every doc below with one-line descriptions. Pattern: `- [ARCHITECTURE.md](./ARCHITECTURE.md) — request lifecycle from URL bar to API`.
- [x] Decide a one-line convention for cross-links: `src/features/Search/Search.tsx:80` (no markdown link to avoid rotting). State it in the index.

### DOC.2 — Core docs (1 file each, ≤ 1 screen)
- [x] **`docs/ARCHITECTURE.md`** — high-level overview. Cover: Next.js App Router layout (RSC vs Client Components), the BFF pattern under `src/app/api/*` proxying FastAPI, Effector store layout (`stores/*` for global, `features/*/model` for slice-local), the R3 container/view boundary, where SSE streaming terminates ([src/app/api/ai-overview/route.ts](frontend/src/app/api/ai-overview/route.ts) → [AIOverviewAccordion](frontend/src/features/Sentence/ui/AIOverviewAccordion.tsx)), where auth cookies live. One ASCII diagram of the data flow is enough.
- [x] **`docs/STRUCTURE.md`** — directory-by-directory walkthrough of `src/app/`, `src/features/`, `src/shared/`, `src/stores/`, `src/types/`. For each folder list its purpose and the role of each subdirectory (e.g. `src/features/<Feature>/model/index.ts` — Effector stores + effects scoped to one feature; `src/features/<Feature>/ui/*.tsx` — pure view components, no store imports).
- [x] **`docs/COMPONENTS.md`** — table of every shared UI primitive and feature-level view component: name, purpose, key props, link to file and to Storybook story. Mark which components are container-only (no story). Generated by hand; refresh when adding new components. Cross-references S1's audit.
- [x] **`docs/STATE.md`** — Effector store map. For each store under `src/stores/*` and `src/features/*/model/*`: what it holds, who writes to it (events/effects), who reads it (containers), and the persistence path (none / localStorage / BFF). Include a one-line note on the `resetSearchResults` orchestration from R6.
- [x] **`docs/ROUTES.md`** — table of every route under `src/app/`: path, file, RSC vs client, auth required, what BFF endpoints it calls. Same shape as backend's `docs/API.md` but flipped — the consumer side.
- [x] **`docs/BFF.md`** — table of every Next route handler under `src/app/api/*`: method, path, auth, what backend endpoint it proxies, whether it streams. Link to [src/shared/api/backend.ts](frontend/src/shared/api/backend.ts) for the `BACKEND_URL` source of truth.
- [x] **`docs/I18N.md`** — locale system (post-D2): which dicts exist, how `t()` resolves, how `<html lang>` is set, the discipline for adding new strings, the lint guard from D2.4. Until D2 lands, write a "Status: not yet implemented; see TASKS.md D2" note.
- [x] **`docs/STYLING.md`** — CSS Modules + Gravity UI + custom CSS variables. List the CSS-variable contract (`--bg-light`, `--accent-red`, `--g-color-*`), where dark/light theme switching happens, and the font-loading strategy from [src/app/layout.tsx](frontend/src/app/layout.tsx). Mention the scrollbar rules post-D1.
- [x] **`docs/AUTH.md`** — JWT flow: login → BFF → FastAPI → httpOnly refresh cookie + access token in memory; the `refreshFx` boot path in [src/app/page.tsx:47](frontend/src/app/page.tsx#L47); the middleware in [src/middleware.ts](frontend/src/middleware.ts). Two paragraphs on threat model.
- [x] **`docs/TESTING.md`** — Vitest unit setup, Storybook test runner, Playwright if/when added; how to run each locally and in CI; the test-name convention from R7's `logEffectFailures` etc.
- [x] **`docs/RUNBOOK.md`** — operational recipes: spin up `npm run dev` against a local backend, point at a remote backend (env var pattern), regenerate API types via `npm run generate-types`, clear `localStorage` to simulate a fresh user, debug a stuck Effector chain.

### DOC.3 — Migrate legacy docs
- [x] Read [PLAN.md](frontend/PLAN.md) — fold any still-relevant content into the new docs (probably ARCHITECTURE, STATE). Delete `PLAN.md` once everything is migrated.
- [x] Read [ux_ui_description_1.md](frontend/ux_ui_description_1.md) — extract the design rationale into `docs/UX.md` (or fold into ARCHITECTURE), then delete the source file.
- [x] Update [README.md](frontend/README.md) — add a `## Documentation` section linking `docs/README.md`, `docs/ARCHITECTURE.md`, `docs/RUNBOOK.md`. Trim duplicate content from README that now lives in docs.

### DOC.4 — Verify
- [x] Every Markdown link in `docs/` resolves (no 404s).
- [x] Every file path mentioned in `docs/STRUCTURE.md` actually exists.
- [x] Every component listed in `docs/COMPONENTS.md` actually exports under the listed name.
- [x] Every store listed in `docs/STATE.md` is grep-able with `git grep -nE 'createStore|createEvent|createEffect' src/...`.

- [x] **Done when:** `docs/README.md` lists all of the above, every linked file exists, and a new contributor can clone the repo, read three docs (`ARCHITECTURE`, `STRUCTURE`, `RUNBOOK`), and start work without asking anyone questions.

---

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
- [x] `src/features/Sentence/ui/AIOverviewAccordion.tsx:6-13` declares `AIToken` — remove after R2.
- [x] Verify after each slice: `npm run build` and `npm run test` are clean.

### R8 — Extract inline constants into `constants.ts` files
> Follow the pattern already established by `src/features/Dictionary/constants.ts`.
> Rule: if a `const` is uppercase, primitive/literal, and lives at module top-level, it belongs in a sibling `constants.ts` (not a component file).

- [x] **Backend URL** (`FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000'`) is duplicated in 7 route files:
  - `src/app/api/history/route.ts:3`
  - `src/app/api/history/[id]/route.ts:3`
  - `src/app/api/dictionary/route.ts:3`
  - `src/app/api/dictionary/[id]/route.ts:3`
  - `src/app/api/parse-sentence/route.ts:3`
  - `src/app/api/auth/login/route.ts:3`
  - `src/app/api/auth/refresh/route.ts:3`
  - `src/app/api/auth/register/route.ts:3`
  Move to `src/shared/api/backend.ts` exporting `BACKEND_URL`. (Also covers the existing `BACKEND_URL` in `src/shared/api/fetchData.ts:1`.)
- [x] **Sentence virtual-list sizing** — move `ITEM_SIZE` and `MAX_VISIBLE_ITEMS` (`src/features/Sentence/ui/SentenceCardView.tsx:13-14`) → `src/features/Sentence/constants.ts`.
- [x] **KanjiVG CDN base** — move `CDN_BASE` (`src/features/KanjiCard/ui/StrokeOrder.tsx:10`) → `src/features/KanjiCard/constants.ts`.
- [x] **SSE headers** — move `SSE_HEADERS` (`src/app/api/ai-overview/route.ts:3`) → `src/app/api/ai-overview/constants.ts` (or `src/shared/api/sse.ts` if reused later).
- [x] **`CJK_REGEX`** — already covered in R4 (single export from `src/shared/utils/cjk.ts`); just verify it's a named constant, not inline.
- [x] Sweep for remaining inline magic numbers in components (e.g. `setTimeout(..., 400)` in `Search.tsx:104`, `slice(0, 60)` in `AIOverviewAccordion.tsx:63`, debounce delays). Promote any that have semantic meaning to named constants in the feature's `constants.ts`. Leave purely-cosmetic numbers (`gap: 8`, `paddingBottom: 16`) inline.

### R9 — ESLint hardening + Prettier
> Project already has `eslint.config.mjs` extending `next/core-web-vitals` + `next/typescript` + storybook. No Prettier yet.

**ESLint**
- [x] Add rules to `eslint.config.mjs` to enforce the refactor's invariants going forward:
  - `no-restricted-imports` — forbid `effector-react` and `@/stores/*` from any file matching `**/ui/**` (enforces the R3 boundary).
  - `@typescript-eslint/no-unused-vars` with `{ argsIgnorePattern: '^_' }` (Next default already errors; tighten if needed).
  - `@typescript-eslint/consistent-type-imports` with `prefer: 'type-imports'`.
  - `no-console` with `{ allow: ['warn', 'error'] }` to flag stray `console.log` (we already use `console.error` in fail.watch handlers — those stay).
- [x] Add `lint:fix` script to `package.json`: `"lint:fix": "next lint --fix"`.
- [x] Run `npm run lint` and resolve any new violations.

**Prettier**
- [x] `npm install -D prettier eslint-config-prettier`.
- [x] Create `.prettierrc.json` matching current code style (observed: single quotes, semicolons, 2-space indent, trailing commas):
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
- [x] Create `.prettierignore`: `node_modules`, `.next`, `storybook-static`, `*.d.ts` (especially `src/shared/api/generatedTypes.d.ts`), `public`.
- [x] Append `eslint-config-prettier` to the `eslintConfig` array in `eslint.config.mjs` so Prettier wins formatting conflicts.
- [x] Add scripts to `package.json`:
  - `"format": "prettier --write \"src/**/*.{ts,tsx,css,json,md}\""`
  - `"format:check": "prettier --check \"src/**/*.{ts,tsx,css,json,md}\""`
- [x] Run `npm run format` once for a one-shot codebase reformat. Commit separately so the diff is a pure format pass.
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

---

## 🤖 AI — Agent Comprehension & Repo Onboarding

> Goal: a coding agent (Claude Code, Cursor, Copilot) or new contributor opens this repo and
> is productive without guessing. We already keep `docs/`, Storybook, and a detailed README —
> this adds the *machine-facing* entry points. Documentation/metadata only, no behaviour change.

### AI.1 — Agent entry-point files

- [x] Add `AGENTS.md` at the frontend root (the cross-tool standard; copy or symlink to `CLAUDE.md` so Claude Code reads it too). Keep it ≤ 1 screen, link out to `docs/` instead of duplicating. Must contain:
  - **One-paragraph overview** — Next.js 15 App Router frontend (React 19), Effector for state, Gravity UI components, Storybook, Vitest. Talks to a separate FastAPI backend.
  - **Commands** — `npm run dev`, `npm run build`, `npm test` (Vitest unit), `npm run test:storybook`, `npm run lint`, `npm run format`, `npm run storybook`, `npm run generate-types` (regenerates `src/shared/api/generatedTypes.d.ts` from the backend's live OpenAPI at `:8000/docs` — backend must be running).
  - **Architecture map** — FSD-ish layout: `src/app` (routes), `src/features/*` (each feature owns `ui/`, `model/`, `api/`, `lib/`), `src/shared` (`ui/`, `api/types.ts`, `i18n/`), `src/stores` (Effector). Note the `view = dumb / model = logic` split (see Refactor R3).
  - **Conventions** — no hardcoded UI strings (use `t('category','key')`, see D2; there's an ESLint guard against Cyrillic literals), file references as markdown links, CSS Modules, Storybook story per view component (see section S).
  - **Gotchas** — `uiLocale` (interface language) ≠ `selectedLanguage` (jp/cn study language); window is the only scroll surface (D1); types are generated, don't hand-edit `generatedTypes.d.ts`.
- [x] Add a `## For AI agents / contributors` section to `README.md` pointing at `AGENTS.md` and the `docs/` index.

### AI.2 — Tooling baseline & doc hygiene

- [x] Add `.editorconfig` at the repo root (UTF-8, LF, 2-space indent for ts/tsx/css/json, trim trailing whitespace) — consistent with Prettier, auto-picked-up by editors/agents.
- [x] Ensure `docs/` has an index (`docs/README.md`, one line per doc) so an agent can fan out from a single file; cross-link it from `AGENTS.md`. (Pairs with the DOC section below.) — index already existed; cross-linked from `AGENTS.md`.
- [x] Add a short `CONTRIBUTING.md` — run `npm run lint && npm test` before pushing, story-per-view-component rule, i18n rule (no raw strings). Link from `AGENTS.md`.
- [x] Verify: all relative links in `AGENTS.md`/`README.md`/`CONTRIBUTING.md` resolve; every documented npm script exists in `package.json`. (Skipped a full `npm ci` rebuild — docs/config-only changes, build graph unchanged.)

---

## 🃏 ANKI — Spaced-Repetition Study Mode (Anki-style cards)

> Turn the personal dictionary into a study deck. Each saved word becomes a flashcard with
> SRS scheduling; the user reviews due cards and grades recall. Depends on the personal
> dictionary (Phase 8) and the backend SRS endpoints (backend Phase 17 — build against that
> contract; mock it if the backend isn't ready). Reuse existing card UI where possible.

### ANKI.1 — Data & store

- [x] Add `src/features/Review/api/` — typed clients for `GET /api/review/queue`, `POST /api/review/{id}` (body `{grade}`), `GET /api/review/stats`, suspend/unsuspend. Use generated types (`npm run generate-types`) once the backend ships them.
- [x] Add `src/stores/review.ts` (Effector) — `$queue`, `$current`, `$stats`, `fetchQueueFx`, `gradeFx`, `nextCard`. Grade optimistically advances to the next card; reconcile `due_at`/stats from the response. Language-aware (reads `selectedLanguage`).
- [x] Define the grade scale once in `src/features/Review/constants.ts` (`again | hard | good | easy`) and map to the backend's numeric grades in the api layer only.

### ANKI.2 — UI

- [x] Add route `src/app/study/page.tsx` — the review session screen: shows the front (word/sentence), reveal button flips to the back (reading, meaning, POS, examples — reuse `WordInspector`/`WordCardView` fragments rather than re-implementing).
- [x] Add `src/features/Review/ui/ReviewCard.tsx` (+ `.module.css`, + story) — front/back flip, four grade buttons with the projected next interval shown on each (e.g. "Good · 1d"), keyboard shortcuts (`Space` reveal; `1–4` grade).
- [x] Add `src/features/Review/ui/StudyDashboard.tsx` — due / new / learned counts from `$stats`, a "Start review" button, empty state ("All caught up 🎉") when the queue is empty.
- [x] Add a "Study" entry point: a nav link in `src/app/page.tsx` (auth-gated, next to "My dictionary") and a "Review N due" badge on the dictionary page.
- [x] Add a per-word "Add to deck / suspend" affordance in `DictionaryPanel` / `DictionaryWordCard` (saving already creates the card server-side; expose suspend/unsuspend here).

### ANKI.3 — Tests & polish

- [x] Vitest: store reducers (grade advances queue, stats update), grade→interval label mapping. Storybook: `ReviewCard` (front, revealed, each grade state), `StudyDashboard` (with cards / empty).
- [x] Done when: a logged-in user opens `/study`, sees due cards, reveals + grades with mouse or keyboard, the queue drains, and the dashboard reflects new counts after a session.

---

## 🖍️ HL — Inline Sentence Highlighting + Click-to-Scroll

> After a sentence search, the **sentence text itself** (the string in the left/blue column
> header) currently renders as plain `<Text>`. Make each word a span tinted by its
> part-of-speech (reusing `getPosColorClass`), and clicking a word scrolls the token list
> below to the matching `TokenRow` and selects it. Bidirectional: hovering/selecting a row
> can also highlight the word in the sentence.

**Where:** [src/features/Sentence/ui/SentenceCardView.tsx](frontend/src/features/Sentence/ui/SentenceCardView.tsx),
[src/features/Sentence/ui/TokenRow.tsx](frontend/src/features/Sentence/ui/TokenRow.tsx),
[src/features/Sentence/lib/posColor.ts](frontend/src/features/Sentence/lib/posColor.ts),
[src/features/Sentence/ui/SentenceCardView.module.css](frontend/src/features/Sentence/ui/SentenceCardView.module.css).

- [x] **Render the sentence header as colored token spans.** Replace the plain `<Text variant="body-2">{sentence}</Text>` in `SentenceCardView`'s header with a `SentenceHighlight` sub-component that maps over `tokens` and renders each `token.surface_form` as a `<span>` with `getPosColorClass(token.pos, selectedLanguage, styles)` applied as a **background tint** (not just the left marker). Render any non-token characters (punctuation/whitespace between surfaces) verbatim so the original sentence reads naturally.
  - Note: the sentence string may not be a simple concatenation of surfaces (spacing/punctuation). Walk the sentence and consume each `surface_form` in order; fall back to plain text for anything that doesn't line up, so a mismatch never drops characters.
- [x] **Add a `study/legend`-friendly POS color background.** `posColor.ts` currently returns classes used for a thin marker + selected state. Add background-tint variants in `SentenceCardView.module.css` (or reuse the existing per-POS classes with a softened `background-color`) so inline spans are readable. Ensure contrast for furigana/pinyin text on the tint.
- [x] **Lift selection state so clicking a word scrolls to its row.** `selectedTokenIndex` already lives in `SentenceCardView` — pass it (and a setter) down to both the highlight spans and the token rows.
  - Clicking a highlighted span sets `selectedTokenIndex` to that token's index and calls `onTokenClick(token)` (same as clicking the row), so the right-column word lookup also fires.
  - Scroll the row into view: for the **virtualized** path (`tokens.length > MAX_VISIBLE_ITEMS`), use the `react-window` `List` imperative API / ref to scroll to the index; for the **plain** path, keep a `ref` array (or `data-token-index` + `querySelector`) and call `scrollIntoView({ block: 'nearest', behavior: 'smooth' })`.
- [x] **Two-way highlight (nice-to-have).** When a `TokenRow` is hovered/selected, give the corresponding sentence span a `selected`/outline style so the eye connects sentence ↔ row.
- [x] **Tests & stories.** Vitest: the sentence→span mapping preserves the full original sentence (no dropped/duplicated chars) and assigns the right POS class per token. Storybook: a `SentenceHighlight` story (JP and CN samples) showing the colored spans; interaction test that clicking a span selects the matching row.
- [x] Done when: searching `この本はとても面白いです。` shows the sentence with each word tinted by POS; clicking 面白い (or any word) scrolls the token list to that row, selects it, and triggers the right-column word lookup — for both short (plain) and long (virtualized) sentences.

---

## 🔍 SEO — Search Engine Optimization

> The app currently ships one hardcoded `metadata` block in `layout.tsx` and no robots/sitemap/
> structured data/OG images. Add the standard Next.js App Router SEO surface. Coordinate with
> D2 (i18n) — metadata should respect `uiLocale` where it's SSR-able. Most of this is static
> config + small route handlers; no backend changes required for the baseline.

### SEO.1 — Crawl & indexing basics

- [x] Add `src/app/robots.ts` (Next `MetadataRoute.Robots`) — allow indexing of public pages (`/`, search result pages), disallow `/api/*`, `/settings`, `/dictionary`, `/study` (private/auth-only). Point at the sitemap.
- [x] Add `src/app/sitemap.ts` (Next `MetadataRoute.Sitemap`) — list the public, indexable routes with `changeFrequency`/`priority`. If word/kanji detail pages become server-rendered (see SEO.4), generate their URLs here.
- [x] Set `metadataBase` in `src/app/layout.tsx` (e.g. `new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')`) so all relative OG/canonical URLs resolve. Add `NEXT_PUBLIC_SITE_URL` to `.env`/`.env.example`.

### SEO.2 — Metadata, Open Graph, canonical

- [x] Replace the static `metadata` in `layout.tsx` with `generateMetadata` (ties off the existing D2 TODO at [src/app/layout.tsx:24](frontend/src/app/layout.tsx#L24)): localized `title` (with a `title.template` like `%s · JapChin Dict`) and `description` read from i18n by `uiLocale` (cookie/`Accept-Language`), plus `alternates.canonical` and `alternates.languages` (`ru`/`en`), and `openGraph` + `twitter` card fields.
- [x] Add per-route metadata where pages exist (`dictionary`, `settings`, `study`) — even if `noindex`, set a sensible title. Mark private routes `robots: { index: false }`.
- [x] Add an Open Graph image: `src/app/opengraph-image.tsx` (Next `ImageResponse`) for a branded default card; optionally a Twitter variant.

### SEO.3 — Icons, manifest, structured data

- [x] Add the icon set Next expects in `src/app/`: `icon.png`/`apple-icon.png` (and keep `favicon.ico`). Pairs with the PWA `manifest.json` task in Phase 11 — make `theme-color` and manifest consistent.
- [x] Add JSON-LD structured data: a `WebSite` + `SearchAction` (sitelinks search box) in `layout.tsx`, and `DefinedTerm`/`DefinedTermSet` on word/kanji detail content so dictionary entries are eligible for rich results. Inject via a `<script type="application/ld+json">` helper component.
- [x] Ensure language signals are correct: `<html lang={uiLocale}>` is already handled by D2/`HtmlLangSync` — verify it's SSR'd (not only set client-side) for crawlers, or accept the documented trade-off.

### SEO.4 — Indexable content (the real SEO win)

- [x] **Decide & document the indexing model.** Today the app is a client-driven SPA-ish search box — there are no crawlable, linkable result URLs, so there's effectively nothing for Google to index beyond the home page. To get organic dictionary traffic, add **server-rendered, linkable detail pages**, e.g. `src/app/[lang]/word/[query]/page.tsx` and `.../kanji/[char]/page.tsx`, that fetch from the backend in a Server Component and render the definition with full metadata + JSON-LD. Wire the sitemap (SEO.1) to these.
  - If full detail pages are out of scope now, at minimum make the search reflect the query in the URL (`/?q=…&lang=…`) and emit canonical + metadata for that state, and record this as the documented limitation.
- [x] Add `next-sitemap` or keep the native `sitemap.ts` — pick one and document it; don't run both.
- [x] Done when: `/robots.txt` and `/sitemap.xml` serve correctly, the home page and any detail pages return localized `<title>`/`<meta description>`/canonical/OG tags in **view-source** (SSR, not just hydrated), an OG image renders in a link-preview test, and structured data passes Google's Rich Results test.
