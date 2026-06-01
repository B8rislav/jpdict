# Styling

## Stack

- **CSS Modules** — scoped styles for every component (`*.module.css` co-located with the component)
- **Gravity UI** (`@gravity-ui/uikit`) — design-system component library; provides its own `--g-color-*` design tokens and resets
- **Global CSS** — `src/app/styles/globals.css` for CSS variables, body defaults, and element resets

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
| `--font-primary` | `'Inter', 'Noto Sans JP', 'Zen Kaku Gothic', sans-serif` | Fallback font stack |
| `--font-cjk` | `var(--font-noto-jp), sans-serif` | CJK body font; overridden for CN below |

Gravity UI adds its own `--g-color-*` tokens (e.g. `--g-color-text-secondary`,
`--g-color-base-brand`) via its stylesheet import in `src/app/layout.tsx`.

## CJK font switching

Two fonts are loaded by `src/app/layout.tsx` using `next/font/google` with
`display: 'swap'`:

- `Noto_Sans_JP` — weights 400/500/700 → CSS variable `--font-noto-jp`
- `Noto_Sans_SC` — weights 400/500/700 → CSS variable `--font-noto-sc`

The active CJK font is selected by `data-lang` on `<html>`:

```css
/* globals.css */
:root           { --font-cjk: var(--font-noto-jp), sans-serif; }
[data-lang='cn']{ --font-cjk: var(--font-noto-sc), sans-serif; }
```

`src/app/HtmlLangSync.tsx` sets `document.documentElement.dataset.lang` in response to
`$userProfile.selectedLanguage` changes. The body uses `font-family: var(--font-cjk)`.

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
