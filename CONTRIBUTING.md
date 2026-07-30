# Contributing

Quick rules for working in this repo. For the full picture see [AGENTS.md](AGENTS.md)
and the [docs index](docs/README.md).

## Before you push

Run both and make sure they're green:

```bash
npm run verify
```

## Rules

- **Story per view component.** Every view component (`src/**/ui/*View.tsx`) ships with a
  `*.stories.tsx`. See [docs/COMPONENTS.md](docs/COMPONENTS.md).
- **No raw UI strings.** Use `t('category', 'key')` from `@/shared/i18n` and add the text
  to `src/shared/i18n/ru.json` + `en.json`. ESLint blocks Cyrillic literals in `.tsx`.
  See [docs/I18N.md](docs/I18N.md).
- **view = dumb / model = logic.** Views take props only — no `effector`,
  `effector-react`, or `@/stores/*`. Enforced by a container whitelist in
  `eslint.config.mjs`, a `max-lines` budget, and `npm run check:stories`. See
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#how-its-enforced).
- **Don't hand-edit generated types** (`src/shared/api/generatedTypes.d.ts`); run
  `npm run generate-types` against a running backend instead.
- Match formatting via Prettier (`npm run format`) and `.editorconfig`.
