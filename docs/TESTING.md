# Testing

## Vitest — unit tests

Config: `vitest.config.ts` (project name `unit`)

Run:
```sh
npm run test
# expands to: vitest run --project unit
```

Unit tests live next to their subject files with the `.test.ts` or `.test.tsx` suffix:

| Test file | What it covers |
|-----------|---------------|
| `src/features/Search/utils.test.ts` | `classifySearchQuery` edge cases |
| `src/features/Sentence/lib/segmentSentence.test.ts` | sentence→span mapping preserves every character, correct token indices |
| `src/features/KanjiCard/api/fetchKanji.test.ts` | kanji fetch and mapper |
| `src/shared/utils/isJapaneseText.test.ts` | Unicode heuristics |
| `src/app/api/ai-overview/route.test.ts` | SSE route handler |
| `src/app/api/parse-sentence/route.test.ts` | parse-sentence route |
| `src/stores/userProfile.test.ts` | store updates and localStorage |

### Naming convention

Effect failure tests use `logEffectFailures` (from `src/shared/utils/logEffectFailures.ts`)
to attach a `.fail.watch` handler. Test names follow the pattern:
`"<effectName> — <failure scenario>"`, e.g. `"fetchWordsFx — network error"`.

## Storybook — visual and interaction tests

Config: `.storybook/` directory; Vitest project name `storybook`.

Run Storybook dev server:
```sh
npm run storybook
# opens http://localhost:6006
```

Run Storybook tests (headless, via Vitest):
```sh
npm run test:storybook
# expands to: vitest run --project storybook
```

Stories exist for 15 components. See COMPONENTS.md for the full list. Stories that
exercise the AI overview stream or auth state use MSW (Mock Service Worker) for fetch
interception — check `.storybook/` for the MSW setup if you need to add new network
mocks.

## Playwright — E2E

Not yet added. When it lands, the runbook entry in RUNBOOK.md should cover:
- `npx playwright test` for local run
- `npx playwright show-report` to inspect results
- The CI step in `.github/workflows/`

## CI

Tests run in the GitHub Actions workflow on every push. Both `npm run test` and
`npm run test:storybook` are required to pass before merge.
