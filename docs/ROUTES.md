# Routes

Page routes under `src/app/`. All pages are Client Components (`'use client'`).

| Path | File | RSC / Client | Auth required | BFF endpoints called |
|------|------|-------------|---------------|---------------------|
| `/` | `src/app/page.tsx` | Client | No (content adapts) | `/api/auth/refresh` on mount; search effects call `/api/parse-sentence`, word/kanji fetch (direct backend proxied via features); `/api/history` and `/api/dictionary` when authenticated |
| `/dictionary` | `src/app/dictionary/page.tsx` | Client | Soft (redirects or shows empty if not auth) | `/api/dictionary` (GET, DELETE, PATCH) |
| `/settings` | `src/app/settings/page.tsx` | Client | No | none |

## Layout

`src/app/layout.tsx` is the only **Server Component**. It:

- Loads `Noto_Sans_JP` and `Noto_Sans_SC` via `next/font/google` with `display: 'swap'`
- Sets CSS variables `--font-noto-jp` and `--font-noto-sc` on `<html>`
- Imports Gravity UI font and style sheets
- Wraps `children` in `<Providers>` (Gravity UI theme) and renders `<HtmlLangSync>`

## Notes

- There is no per-route auth guard at the page level. The middleware only guards
  `/api/dictionary/*` and `/api/history/*` (the BFF routes). Page-level auth awareness
  is handled by `$isAuthenticated` store state and the `AuthGate` component.
- The `/settings` page exists but is minimal; no BFF calls at time of writing.
