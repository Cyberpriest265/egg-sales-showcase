# Egg Sales Management System

Daily sales, customer debt, inventory, expenses and CSV reports for a small egg business — one monolithic Next.js app.

## Features

- **Sales recording** — quantity, egg type, amount paid / owed, customer name on credit sales; sale total derived from price × quantity
- **Debt tracking** — `amountOwed = saleTotal − amountPaid` enforced in the model; overpayment rejected; customer name required on credit
- **Inventory ledger** — opening stock, additions, automatic deductions on every sale; sales blocked when stock is insufficient
- **Adjustments with audit trail** — income/expense entries (including transport) recorded as separate transactions; original sales are never edited
- **Dashboard** — daily sales, eggs sold, amount paid vs owed, remaining stock, weekly chart (transport figures stored and reported but hidden from the dashboard by design)
- **Reports** — daily and weekly summaries as JSON plus one-click **CSV downloads**
- **Configurable egg types** — full CRUD, no hard-coded product names
- **Validation on both sides** — instant client feedback plus server-side source of truth

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend + backend | Next.js 16 (App Router) + TypeScript + React 19 | One framework for UI, API routes and server logic — fits a monolith |
| Database | MongoDB Atlas | Flexible schema for a small evolving app |
| Data access | Mongoose | Schema validation + typing; easier to reason about than the raw driver |
| Styling | Tailwind CSS v4, Bento-style card dashboard | Clear hierarchy, responsive, scannable |
| Charts | Recharts | Donut + bar charts without hand-drawn SVG |
| Reports | CSV | Zero-dependency, opens in Excel/Sheets |
| Tests | Vitest | Unit tests for business rules and utilities |
| Hosting | Vercel + MongoDB Atlas | Native fit for Next.js |

## Architecture

```text
UI (React client components, Bento cards)
  ↓  fetch / JSON over HTTP
API routes (Next.js route handlers — thin: parse input, delegate, return JSON)
  ↓  call
Services (business logic: daily/weekly summaries)
  ↓
Mongoose models (schemas, validation hooks, data access)
  ↓
MongoDB
```

```text
src/
  app/            pages (dashboard, sales, inventory, adjustments, egg-types)
  app/api/        route handlers (sales, egg-types, stock-transactions,
                  adjustments, reports, test-db)
  models/         Mongoose schemas (Sale, EggType, StockTransaction, Adjustment)
  services/       business logic (dailySummary)
  lib/            db connection, date helpers, CSV escaper
  components/     AppShell, Sidebar, charts
  __tests__/      Vitest unit tests
```

Key design points:

- **Stock is a ledger, not a number.** Remaining stock = opening + additions − sale deductions, computed from `StockTransaction` records. One sale writes two collections (`Sale` + `sale-deduction`).
- **Derived values live in one place.** `amountOwed` is computed by a Mongoose `pre("validate")` hook, so no caller can store an inconsistent sale.
- **Fail-fast DB connection**, cached and reused across hot-reloads; a failed attempt clears the cache so the next request retries instead of serving a stale rejection forever.

## Getting started

Prereqs: Node.js 18+, npm, and a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB).

```bash
git clone https://github.com/Cyberpriest265/egg-sales-showcase.git
cd egg-sales-showcase
npm install
cp .env.example .env   # Windows: copy .env.example .env
```

Open `.env`, set `MONGODB_URI` to your connection string (Network Access must allow your IP — `0.0.0.0/0` for hosted deployments), then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Health check: [http://localhost:3000/api/test-db](http://localhost:3000/api/test-db) should return `{"success":true,...}`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Production build (also typechecks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |

## Key business rules

```text
amountOwed     = saleTotal − amountPaid
remainingStock = openingStock + stockAdditions − eggsSold
```

- `amountPaid` can never exceed `saleTotal`
- Credit sales require a customer name
- Quantity must be ≥ 1 and within remaining stock
- Adjustments never modify a `Sale` — audit trail preserved
- Transport deductions are stored and included in reports, excluded from the dashboard

## Screenshots

> Screenshots coming shortly — captured against demo data (never real customer records).

```text
public/screenshots/dashboard.png   ← dashboard with charts
public/screenshots/sales.png       ← sales form
public/screenshots/reports.png     ← CSV report download
```

## Deliberately out of scope (v1)

- No authentication — single-operator tool; auth adds a whole threat model for no current need
- No PDF/Excel reports — CSV covers the requirement with zero dependencies
- No separate Customer model — names stored on the sale; debt-history UI is a later phase

## Roadmap

- Seed script with demo data (`npm run seed`)
- Debt repayment tracking per customer
- PDF reports
- Basic auth for multi-device use
