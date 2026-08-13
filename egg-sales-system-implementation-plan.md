# Egg Sales Management System — Implementation Plan

## 1. Overview

A simple, monolithic web application for recording daily egg sales, tracking customer debt, managing inventory, logging expenses, and generating daily/weekly reports.

**Guiding principle:** keep it simple. No microservices, no unnecessary abstraction, no premature scaling.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend + Backend | Next.js (App Router) + TypeScript + React | Single framework for UI, API routes, and server logic — fits a monolith |
| Database | MongoDB | Flexible schema, good fit for a small evolving app |
| Data access | Mongoose | Schema validation, built-in typing support, easier for a learner than raw driver |
| UI style | Bento UI (card-based dashboard) | Clear hierarchy, easy to scan, responsive |
| Reports | CSV first (PDF later if needed) | Simple to generate, no extra dependencies for MVP |
| Hosting | Vercel (app) + MongoDB Atlas (DB) | Native fit for Next.js, free tier available |

---

## 3. MVP Scope

**In scope (v1):**
- Configurable egg types
- Record daily sales (qty, type, paid, owed, customer)
- Auto-calculated daily totals
- Inventory tracking (opening stock, additions, deductions via sales)
- Manual income/expense adjustments (with audit trail) — includes transport deductions
- Dashboard (Bento layout) — excludes transport deductions from view
- Daily + weekly reports (CSV export)
- Client + server-side validation
- Basic error handling

**Out of scope (v1, revisit later):**
- Authentication/authorization
- Customer debt repayment history / partial repayment tracking UI
- PDF/Excel report formats
- Multi-user roles

---

## 4. Data Model

### `EggType`
| Field | Type | Required |
|---|---|---|
| name | string | yes |
| unitPrice | number | optional |
| isActive | boolean | yes (default true) |

### `Sale`
| Field | Type | Required |
|---|---|---|
| eggTypeId | ObjectId ref EggType | yes |
| quantity | number | yes |
| saleTotal | number | yes |
| amountPaid | number | yes |
| amountOwed | number | yes (derived: saleTotal − amountPaid) |
| customerName | string | required if amountOwed > 0 |
| date | Date | yes |

### `StockTransaction`
| Field | Type | Required |
|---|---|---|
| eggTypeId | ObjectId ref EggType | yes |
| type | enum: opening / addition / sale-deduction | yes |
| quantity | number | yes |
| date | Date | yes |
| relatedSaleId | ObjectId ref Sale | optional |

### `Adjustment` (expenses/income, incl. transport)
| Field | Type | Required |
|---|---|---|
| type | enum: income / expense | yes |
| category | string (e.g. "transport") | yes |
| amount | number | yes |
| reason | string | yes |
| description | string | optional |
| responsiblePerson | string | optional |
| date | Date | yes |

**Note:** No separate `Customer` model in v1 — customer name stored as plain text on `Sale`. Revisit if debt history/repayment tracking becomes a requirement.

---

## 5. Core Business Rules

```
amountOwed = saleTotal - amountPaid
remainingStock = openingStock + stockAdditions - eggsSold
```

- `amountPaid` cannot exceed `saleTotal`
- `customerName` required when `amountOwed > 0`
- Sales blocked if `quantity > remainingStock` (unless explicitly overridden)
- Adjustments never modify the original `Sale` record — always a new `Adjustment` entry (audit trail)
- Transport deductions: stored + included in reports, but **excluded from dashboard display**

---

## 6. Architecture

```
UI (React components, Bento cards)
   ↓
API Routes / Server Actions (Next.js)
   ↓
Service layer (business logic: totals, validation, stock rules)
   ↓
Mongoose models (data access)
   ↓
MongoDB
```

Folder structure:
```
/app
  /dashboard
  /sales
  /inventory
  /adjustments
  /reports
  /api
/models      → Mongoose schemas
/services    → business logic
/lib         → db connection, utils
/types       → shared TypeScript types
```

---

## 7. Development Phases

| Phase | Deliverable |
|---|---|
| 0 | Requirements analysis, ambiguities, MVP sign-off |
| 1 | Dev environment setup (Node, Git, MongoDB Atlas, VS Code) |
| 2 | Next.js + TypeScript project init, ESLint, `.env`, Git init |
| 3 | Architecture + DB schema design (this document) |
| 4 | MongoDB connection module + test |
| 5 | Egg types CRUD |
| 6 | Inventory (opening stock, additions, deductions) |
| 7 | Sales form + persistence + validation |
| 8 | Daily calculation logic (totals, owed, paid, tx count) |
| 9 | Dashboard (Bento UI) |
| 10 | Adjustments/expenses incl. transport, with audit trail |
| 11 | Daily + weekly CSV reports |
| 12 | Testing (unit + integration + manual checklist) + code review |
| 13 | Production prep (env vars, logging, error handling) |
| 14 | Deployment (Vercel + Atlas) |

---

## 8. Edge Cases to Test

- Sale with amountPaid = 0 (fully owed)
- Partial payment
- Full payment (owed = 0)
- amountPaid > saleTotal (should be blocked)
- Sale quantity > remaining stock (should be blocked)
- Adjustment: expense larger than day's sales
- Multiple egg types in one day — totals grouped correctly
- Empty day — dashboard handles gracefully (zero states)

---

## 9. Validation Rules

- `quantity` > 0
- `amountPaid` ≥ 0, and ≤ `saleTotal`
- `amountOwed` ≥ 0
- `customerName` required if `amountOwed` > 0
- `eggTypeId` must reference an existing, active egg type
- Dates must be valid and not in the future (for sales)
- All rules enforced both client-side (fast feedback) and server-side (source of truth — client validation can be bypassed)

---

## 10. Reports

**Daily report (CSV):** date, sales by egg type, total eggs sold, total paid, total owed, adjustments, remaining stock.

**Weekly report (CSV):** same metrics aggregated per day across 7 days, plus week totals.

---

## 11. Definition of Done (v1)

- [ ] App runs locally, connects to MongoDB
- [ ] Egg types manageable
- [ ] Sales recorded with correct paid/owed calculation
- [ ] Inventory accurate after sales + additions
- [ ] Dashboard shows daily sales, eggs remaining, amount owed (no transport figures)
- [ ] Adjustments (incl. transport) recorded with audit trail
- [ ] Daily + weekly CSV reports downloadable and accurate
- [ ] Validation enforced client + server side
- [ ] Core business logic unit tested
- [ ] Deployed to Vercel with Atlas connection working
