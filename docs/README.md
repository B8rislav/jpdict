# Frontend Docs

One-stop index for the `jpdict` frontend. Each doc is skimmable in under five minutes.

## Cross-link convention

Reference code locations as plain text: `src/features/Search/Search.tsx:80`. No markdown
links — they rot as files move. Grep for the path if needed.

## Index

- [ARCHITECTURE.md](./ARCHITECTURE.md) — data flow from URL bar to FastAPI, RSC/client split, BFF pattern, SSE streaming
- [STRUCTURE.md](./STRUCTURE.md) — directory-by-directory walkthrough of `src/`
- [COMPONENTS.md](./COMPONENTS.md) — shared UI primitives and feature view components with key props
- [STATE.md](./STATE.md) — Effector store map: what each store holds, who writes/reads it, persistence
- [ROUTES.md](./ROUTES.md) — page routes under `src/app/`: RSC vs client, auth requirement, BFF calls
- [BFF.md](./BFF.md) — Next.js API route handlers: method, path, auth, upstream target, streaming
- [I18N.md](./I18N.md) — UI locale system (ru/en), `t()` usage, current status
- [STYLING.md](./STYLING.md) — CSS Modules, Gravity UI, CSS variable contract, font loading, theme switching
- [AUTH.md](./AUTH.md) — JWT flow, httpOnly cookie, access token in memory, middleware, threat model
- [TESTING.md](./TESTING.md) — Vitest unit tests, Storybook test runner, how to run locally and in CI
- [RUNBOOK.md](./RUNBOOK.md) — operational recipes: dev setup, env vars, type generation, debugging
- [UX.md](./UX.md) — design rationale: language profiling, progressive disclosure, color system, typography philosophy
