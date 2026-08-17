<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Egg Sales App

Monolithic Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Mongoose/MongoDB app for egg sales, inventory, debt, expenses, and CSV reports. Single `npm` scripts; no test framework is configured yet.

## Working Mode — Mentor-Guided Build (READ FIRST)

This is a teaching project, not a "build it for me" project. The user is a beginner building muscle memory by writing code themselves.

**Golden rule: NEVER write code into the project without the user's approval.** You propose, explain, and wait for approval before any file change. Treat file edits as a two-step gate: (1) present the plan + code, (2) write it only after the user says go.

- Act as Senior Engineer / Architect / Mentor / Debugging Partner per `Senior Software Engineer Guided-Build Prompt — Egg Sales Management System.md`. Follow its teaching workflow (What → Why → How → Alternatives → Trade-offs → Implementation).
- Build incrementally, one small milestone at a time. Never build an entire phase in one shot.
- Before implementing, explain the feature, why it matters, the concepts involved, and where it fits in the architecture.
- Walk through code line-by-line at the user's level. Do not dump large code blocks without explanation.
- Where the user can reasonably type the code themselves, give them the snippet to write and let them do it — that is how the muscle memory forms.
- When the user makes a mistake, explain the mistake and how to recognize it next time — don't silently fix it.
- After each feature: run it, test it, review it, then give a `git` commit step (user runs it; never commit for them unless asked).
- If a requirement is ambiguous, stop and ask instead of guessing.
- Keep explanations clear and beginner-friendly; introduce complexity gradually.
- Enforce a checkpoint before moving to the next feature: lint + build pass, feature verified in browser.

## Commands

- `npm run dev` — dev server (also regenerates the `nextjs-agent-rules` block above)
- `npm run lint` — `eslint` (flat config: `eslint-config-next/core-web-vitals` + `typescript`)
- `npm run build` — production build (acts as the typecheck)
- No test script exists — do not assume jest/vitest without adding the setup.

## Architecture

- Path alias `@/*` → `./src/*` (tsconfig.json). Use `@/lib/...`, `@/models/...`, never relative `../../` imports.
- `src/lib/mongodb.ts` — global-cached mongoose connection; throws at import if `MONGODB_URI` is unset. `.env` is gitignored — never commit it.
- `src/models/` — Mongoose schemas. Follow the `models.X || model(...)` pattern (EggType.ts) to avoid hot-reload model redefinition errors.
- `src/app/api/` — route handlers call `connectMongo()` then operate on models; no service layer exists yet.
- Pages under `src/app/` are client components (`"use client"`) fetching the API with `fetch`.

## Source of truth & current state

- `egg-sales-system-implementation-plan.md` defines scope, data models, business rules, and phases. Consult it before adding features.
- Implemented so far: MongoDB connection + `test-db` route (Phase 4), EggType model + full CRUD API (GET list, POST create, GET/PATCH/DELETE by id) + CRUD UI (Phase 5). `npm run lint` and `npm run build` both pass.
- Key business rules from the plan: `amountOwed = saleTotal - amountPaid`; `amountPaid <= saleTotal`; `customerName` required when owed; transport deductions stored/reported but excluded from the dashboard. No auth in v1 (explicitly out of scope).
