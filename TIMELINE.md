# Egg Sales Management System — Build Timeline

Day-by-day working plan from the current point to the end of v1.
Companion to `egg-sales-system-implementation-plan.md` (scope, model, rules).

Legend: `[x]` done · `[~]` in progress · `[ ]` upcoming

---

## Current state

| Phase | Deliverable | Status |
|---|---|---|
| 0–3 | Requirements, environment, project init, architecture | [x] |
| 4 | MongoDB connection + `test-db` | [x] |
| 5 | Egg type CRUD (model, API, UI) | [x] |
| 6 | Inventory (StockTransaction model, APIs, stock, UI) | [x] |
| 7 | Sales form + persistence + list | [~] form + POST/GET API working; list UI pending |
| 8 | Daily calculation logic | [ ] |
| 9 | Dashboard (Bento UI) | [ ] |
| 10 | Adjustments/expenses incl. transport + audit trail | [ ] |
| 11 | Daily + weekly CSV reports | [ ] |
| 12 | Testing + code review | [ ] |
| 13 | Production prep | [ ] |
| 14 | Deployment (Vercel + Atlas) | [ ] |

---

## Day-by-day plan

Each "day" = one focused build session (~1–3 hrs). Pace adjustable.

### Day 1 — Close out Phase 7 (current thread)
- Fix the Recent Sales list bugs: relative fetch URL (`/api/sales`), missing `eggTypeId` in `Sale` type, pending table JSX.
- Verify in browser, `npm run lint` + `npm run build`, commit.
- Done when: recording a sale makes it appear in the table AND drops inventory.

### Day 2 — Phase 8a: Daily totals service
- One endpoint returning a day's numbers: total sold, total GH₵, paid, owed, transaction count.
- Done when: API numbers match hand-calculated math on a sample day.

### Day 3 — Phase 8b: Weekly totals + zero states
- Aggregate 7 days into one summary; empty days return 0s instead of errors.
- Done when: an empty day renders gracefully (plan edge case).

### Day 4 — Phase 9: Dashboard (Bento UI)
- Home page becomes a card dashboard: today's sales GH₵, eggs sold, amount owed, remaining stock.
- Transport figures excluded (per plan).
- Done when: every card matches the Day-2 endpoint output.

### Day 5 — Phase 10a: Adjustments backend
- `Adjustment` model + POST/GET API with full audit trail (reason, person, date). Never modifies the original Sale.
- Done when: API validates input and every entry keeps its trail.

### Day 6 — Phase 10b: Adjustments UI + transport
- Adjustments page (income/expense form + list) and transport-category handling.
- Done when: a transport expense is recorded AND stays out of the dashboard.

### Day 7 — Phase 11a: Daily CSV report
- Server-generated CSV + download button for a chosen date.
- Done when: the CSV opens clean in Excel and matches the DB.

### Day 8 — Phase 11b: Weekly CSV report
- 7-day CSV with per-day rows + week totals.
- Done when: the numbers add up across all 7 days.

### Day 9 — Phase 12: Testing + code review
- Add a test framework; unit-test business rules (owed = total − paid, overpayment blocked, stock cap); run plan edge-case checklist; review every commit.
- Done when: all edge cases pass.

### Day 10 — Phase 13: Production prep
- Env validation, error-handling polish, secret scan (no console.log of URIs), final lint + build.
- Done when: clean build, no secrets in logs.

### Day 11 — Phase 14: Deployment
- Push to GitHub, connect Vercel + Atlas, wire env vars, deploy.
- Done when: app is live and a real sale lands in the production DB.

### Day 12 — Final review
- Walk the plan's full Definition of Done checklist, fix stragglers, retro.
- Done when: every v1 checkbox is ticked.

---

## Standing rule
Checkpoint before moving to the next day: `npm run lint` + `npm run build` pass, feature verified in browser, committed.