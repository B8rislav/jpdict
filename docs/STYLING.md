# Styling

## Stack

- **CSS Modules** — scoped styles for every component (`*.module.css` co-located with the component)
- **Designoslav** (`designoslav`) — the in-house design system we are migrating to;
  provides `--do-*` design tokens and presentational React components. See
  "Designoslav migration" below.
- **Gravity UI** (`@gravity-ui/uikit`) — legacy design-system component library, being
  phased out; provides its own `--g-color-*` design tokens and resets
- **Global CSS** — `src/app/styles/globals.css` for CSS variables, body defaults, and element resets

## Designoslav migration

[Designoslav](https://github.com/B8rislav/designoslav) is the in-house design system
(theme **Celadon Zen** — soft warm neutrals, celadon green + terracotta accents),
built to replace Gravity UI. It lives in its own repo (local checkout:
`~/Documents/designoslav`) and is installed from GitHub — after changing it, push and
run `npm update designoslav` here.

Rules while both systems coexist:

- New or touched UI uses the Designoslav component when one exists (currently:
  `Button`); otherwise Gravity UI stays until Designoslav grows the equivalent.
- Don't introduce *new* Gravity usage in code that doesn't already have it.
- Components read Designoslav's **semantic** tokens (`--do-color-primary`,
  `--do-color-surface`, …), never the raw palette (`--do-celadon-500`, …).

Usage:

```tsx
import { Button } from 'designoslav';
import 'designoslav/tokens.css'; // once, in src/app/layout.tsx
```

## CSS variable contract

Defined in `src/app/styles/globals.css` under `:root`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-light` | `#ffffff` | Page and card backgrounds |
| `--bg-dark` | `#1a1a1a` | Dark-mode surfaces (not yet wired to a theme toggle) |
| `--text-dark` | `#1a1a1a` | Primary text |
| `--text-white` | `#ffffff` | Text on dark surfaces |
| `--text-secondary` | `#888888` | Muted labels, furigana readings |
| `--accent-red` | `#e63946` | Accent highlights (e.g. POS colour chips) |
| `--border-gray` | `#e0e0e0` | Card and input borders |
| `--font-cjk` | `var(--font-noto-jp), sans-serif` | CJK body font; overridden for CN below |

Gravity UI adds its own `--g-color-*` tokens (e.g. `--g-color-text-secondary`,
`--g-color-base-brand`) via its stylesheet import in `src/app/layout.tsx`.

## Typography

Three faces, three jobs. Designoslav *names* them in its `--do-font-*` tokens but never
fetches them — loading is this app's job. `src/app/fonts.ts` declares every face via
`next/font/google`, and `globals.css` binds the generated variables onto the tokens.

| Token | Face | Used for |
|-------|------|----------|
| `--do-font-sans` | Golos Text (latin + cyrillic) | The UI voice: nav, buttons, labels, glosses, body |
| `--do-font-serif` | Noto Serif JP (latin + cyrillic + CJK) | **Display only** — `SectionHeading`, WordCard/KanjiCard headwords, the brand lockup |
| `--do-font-cjk` | Noto Sans JP / SC | Japanese and Chinese body text |

Two rules worth keeping:

- **Don't widen the serif's role.** Mincho at list sizes is harder to read than gothic, so
  `SentenceView` tokens and `EntryCard` headwords stay in the CJK sans.
- **Load what you name.** The `--do-font-sans` token used to lead with `'Inter'`, which
  nothing in either repo ever loaded — so every Cyrillic string in the app was silently
  drawn with Noto Sans JP's Cyrillic glyphs. A token naming an unloaded face fails quietly.
- **Keep CJK weight lists short.** Google splits a CJK family into ~100 unicode-range files
  *per weight*. Requesting 400/500/600/700 of Noto Serif JP + SC reliably hit `ETIMEDOUT`
  during the build, and `next/font` handles that by falling back to Georgia and carrying on —
  a green build with a broken serif. The serifs ask for 400 and 600 only, which is all the
  display roles use. If you add a weight, confirm `.next/static/media` still holds the
  family afterwards.

Note `subsets` does **not** restrict CJK coverage: Google returns the full unicode-range set
for these families regardless, so `subsets: ['latin']` on Noto Sans JP still ships kanji.
The option only governs which *named* subsets are preloaded.

## CJK font switching

The active CJK font — and the serif's glyph forms — follow `data-lang` on `<html>`, which
`src/app/layout.tsx` sets server-side from the profile:

```css
/* globals.css */
:root           { --font-cjk: var(--font-noto-jp), sans-serif; }
[data-lang='cn']{ --font-cjk: var(--font-noto-sc), sans-serif; }

/* Noto Serif JP has no Simplified Chinese glyph forms, so CN mode swaps the serif too,
   or Chinese headwords render in Japanese shapes. */
[data-lang='cn']{ --do-font-serif: var(--font-serif-sc), Georgia, serif; }
```

## Dark / light theme switching

Gravity UI's `ThemeProvider` (in `src/app/ui/ThemeProvider.tsx`, mounted in
`src/app/providers.tsx`) manages the Gravity UI theme. The custom CSS variables do not
yet have a dark-mode variant wired to a user toggle — `--bg-dark` is defined but unused
in the current UI. This is tracked in TASKS.md D1 (scrollbar rules) and planned for a
future phase.

## Ruby / furigana

```css
ruby { ruby-align: center; }
rt   { font-size: 0.55em; color: var(--text-secondary); }
```

Applied globally. The `FuriganaText` component (`src/shared/ui/FuriganaText/`) renders
`<ruby>` elements and relies on these rules.

## Scrollbar rules

Not yet implemented. Tracked in TASKS.md D1.
