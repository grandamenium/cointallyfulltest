# Repository Guidelines

CoinTally Frontend is a Next.js 14 App Router project that ships with mock data and production-grade UI. Follow these notes so changes remain consistent with the existing build.

## Project Structure & Module Organization
- `app/` hosts routed pages; use route groups `(auth)`, `(onboarding)`, `(dashboard)` to keep flows isolated.
- `components/` splits reusable UI under `ui/` (shadcn derivatives) and feature-specific widgets under `features/`.
- `lib/`, `hooks/`, and `stores/` centralize cross-cutting logic, React Query helpers, and Zustand slices.
- `@mock-database/` stores generated JSON fixtures; `assets/`, `public/`, and `types/` provide shared imagery, static files, and TypeScript contracts.
- Additional briefs and specs live in `DOCS/`; reference them before large architectural updates.

## Build, Test, and Development Commands
- `npm install` — sync dependencies (always rerun after pulling main).
- `npm run dev` — boot local dev server; auto-generates mock data if missing.
- `npm run build` / `npm run start` — production build and serve; ensure both pass before opening a PR.
- `npm run lint` — ESLint with Next config and Tailwind plugin; run prior to commits.
- `npm run generate:mocks` — regenerate fixture data (use `MOCK_SEED=<seed>` for deterministic runs).

## Coding Style & Naming Conventions
- TypeScript everywhere; keep strict mode clean. Prefer functional components and server components unless the UI requires client-only hooks.
- File names mirror routing (`page.tsx`, `layout.tsx`) and component exports (`PascalCase.tsx`). Zustand stores live under `stores/<feature>-store.ts`.
- Formatting is handled by Prettier + Tailwind plugin (2-space indent, sorted class lists). Do not hand-format; run editor integrations or `npx prettier --write`.
- Follow ESLint recommendations; resolve warnings instead of disabling rules. Centralize shared utilities in `lib/` rather than duplicating helpers.

## Testing Guidelines
- Automated testing is not wired yet; new features should include a test plan in the PR description and, where feasible, Jest + React Testing Library specs colocated as `<Component>.test.tsx`.
- Cover at least happy path plus one edge case per feature. Document manual verification steps when adding UI-wiring or data mutations.
- If adding a new test command, expose it via `npm test` and update this guide.

## Commit & Pull Request Guidelines
- Follow Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, etc.) as seen in project history; keep messages scoped to a single change.
- Branch from `main`, keep PRs focused, and include screenshots or screen recordings for visual updates.
- Link relevant issues or DOCS references, list environment changes, and confirm `npm run lint` + `npm run build` status in the PR body.
- Request at least one review; respond to feedback promptly and re-run lint/build after rebasing.

## Mock Data & Environment Tips
- Mock JSON lives under `@mock-database/transactions.json`; avoid hand-editing large diffs—regenerate via scripts instead.
- Store secrets in `.env.local`. At minimum define `NEXT_PUBLIC_API_URL` and future Supabase keys; never commit the file.
- When replacing placeholders with live services, annotate integration points with `TODO: BACKEND` or `TODO: AUTH` comments so future agents can find them quickly.
