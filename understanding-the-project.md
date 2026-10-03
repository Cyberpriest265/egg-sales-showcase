# Understanding the Egg Farm Project — The Whole Machine, Explained

> A beginner-friendly tour of every folder, every file, how they talk to each other,
> and the interview questions that will test whether you *actually* know it.
> Written in two registers: **Layman** (plain English stories) and **Technical** (real terms).
> The project itself: a Next.js web app that runs an egg-selling business — sales,
> inventory, debt, expenses, and downloadable reports.

---

## 0. How to read this document

- **Layman** paragraphs use pictures and analogies. If you read nothing else, read Section 1.
- **Technical** terms appear in bold and are explained in the Glossary (Section 8).
- **Interview Q&A** (Section 7) is the largest section. Every answer is written as if speaking
  to an absolute beginner.
- Paths like `src/lib/csv.ts` are relative to the project root.

---

## 1. The big picture (a story)

Imagine a real farm shop. Three rooms.

**Room 1 — the counter (the web pages).** Customers see beautiful screens: the dashboard with
charts, the sales form, the stock board. This is what you built first, visually. In this app all
of it lives under `src/app/`.

**Room 2 — the office (the API routes).** When the counter needs something done — "record a
sale!", "how many eggs are left?" — it shouts through a doorway. That doorway is the web
**API** (under `src/app/api/`). The office does the actual thinking: it checks the rules,
talks to the archive, and hands an answer back on a piece of paper (**JSON**).

**Room 3 — the archive (the database).** A giant filing cabinet holding every egg type, every
sale, every stock movement, every expense. That's **MongoDB Atlas** in the cloud. The app never
talks to the archive directly — it sends a librarian (called **Mongoose**) who knows how filing
cabinets are organized.

The parts in the middle — the blueprints that describe what each filing card looks like
(`src/models/`), the toolbox (`src/lib/`), the accountant who adds up daily/weekly totals
(`src/services/dailySummary.ts`), the furniture (`src/components/`) — glue the three rooms together.

Everything interconnected, top to bottom:

```
 Browser (your screen)
   │  fetch("/api/sales", { method: "POST", body: {...} })
   ▼
 API route  (src/app/api/sales/route.ts)  — the office
   │  connectMongo()  →  src/lib/mongodb.ts  — who holds the archive key
   │  validations (is the request polite and legal?)
   │  Sale.create(...) + StockTransaction.create(...)
   ▼
 Mongoose  — the librarian
   │
   ▼
 MongoDB Atlas  — the archive (cloud, one database)
   │  response documents flow back up as JSON
   ▼
 React state (useState) → the screen redraws (render)
```

That single flow — counter → office → archive → office → counter — is *the whole app*.
Every feature is a different flavor of this same journey.

---

## 2. The map — every directory and what it does

### `src/` — all of our code lives here

| Directory / file | Layman | Technical |
|---|---|---|
| `src/app/` | The counter + the office, side by side. | **App Router**. Files here become URLs. `page.tsx` = a screen; folders with `route.ts` = API endpoints. |
| `src/app/page.tsx` | The home screen: dashboard with charts and the day's numbers. | Client component fetching `/api/reports/daily`, `/api/stock-transactions/stock`, `/api/reports/weekly`. |
| `src/app/sales/`, `inventory/`, `adjustments/`, `egg-types/` | The other four screens (record sale, adjust stock, log expenses/income, manage egg types). | Each is a `page.tsx` client component. |
| `src/app/api/` | The office doorways. | **Route handlers** — functions named `GET`/`POST`/etc. mapped to URLs. |
| `src/app/api/egg-types/` + `[id]/` | Create/list egg types; fetch/update/delete one. | CRUD for the EggType model. |
| `src/app/api/sales/` | Record a sale (with stock check) / list recent sales. | POST creates `Sale` + a `sale-deduction` `StockTransaction`. |
| `src/app/api/stock-transactions/` + `stock/` | Add stock ("opening", "addition") / ask "what's left?". | POST creates movements; `stock/` computes remaining per egg type. |
| `src/app/api/adjustments/` | Log income/expenses (electricity, transport…). | POST/GET with type, category, amount, reason. |
| `src/app/api/reports/daily` + `weekly` | Ask the accountant for today or the week. | Return JSON summaries. |
| `src/app/api/reports/daily-csv` + `weekly-csv` | Download a spreadsheet file. | Return `text/csv` with `Content-Disposition: attachment`. |
| `src/app/api/test-db` | Health check: "can we reach the archive?" | Connects, reports success/failure. |
| `src/app/layout.tsx` | The building's frame (fonts, global `<html>`/`<body>`). | Root layout, applies to every page. |
| `src/models/` | The archive's rulebook — blueprints for every filing card. | Mongoose **schemas + models**. |
| `src/lib/` | The toolbox. | Reusable helpers, no UI. |
| `src/lib/mongodb.ts` | The one key to the archive, held by the connection. | Global-cached `connectMongo()`. |
| `src/lib/dates.ts` | "What's today in YYYY-MM-DD? What's the Monday of this week?" | `todayString()`, `weekStartString()`. |
| `src/lib/dateParam.ts` | The date-validator bouncer. | `parseDateParam()` truly-checks dates (rejects `2026-99-99`). |
| `src/lib/csv.ts` | The CSV escaper (protects files that contain commas/quotes). | `escapeCSV()`. |
| `src/services/dailySummary.ts` | The accountant. | `getDailySummary()`, `getWeeklySummary()` — DB → totals. |
| `src/components/` | Room furniture. | Small buildable UI pieces. |
| `src/components/AppShell.tsx` | The two-pane skeleton (sidebar + content area). | Layout wrapper used by every page. |
| `src/components/Sidebar.tsx` | The dark navigation menu on the left + report download buttons. | Client component using `usePathname()` for the active pill. |
| `src/components/DonutChart.tsx` | A pie-turned-ring chart with a center total. | Recharts `<PieChart>` wrapper + legend. |
| `src/components/SalesBarChart.tsx` | Day-by-day weekly sales bars. | Recharts `<BarChart>` wrapper. |
| `src/__tests__/` | Quality control inspectors. | Vitest unit tests: `csv`, `dateParam`, `sale`. |

### Config & root files (the building's plumbing)

| File | What it does |
|---|---|
| `package.json` | The app's ID card: scripts (`dev`, `build`, `start`, `lint`, `test`) and dependencies. |
| `tsconfig.json` | TypeScript settings. Defines the magic alias `@/*` → `./src/*` so imports say `@/models/Sale` instead of `../models/Sale`. |
| `vitest.config.ts` | Test-runner settings: copies the `@` alias so tests can use the same import style. |
| `.env` | Your secrets (MongoDB URI). **Never committed** (`.gitignore` says so). |
| `.gitignore` | Tells Git what to never track (`.env*`, `node_modules`, build output). |
| `eslint.config.mjs` | Lint rules (style + bug-sniffing). |
| `next.config.*` | Next.js runtime options (currently default). |

---

## 3. The life of a request — how the parts interconnect (concrete)

### Journey A — "Record a sale"

1. **Counter:** `sales/page.tsx` — user types quantity + paid and clicks "Save".
2. The page calls `fetch("/api/sales", { method: "POST", body: JSON.stringify({...}) })`.
3. **Office:** `src/app/api/sales/route.ts` runs `GET`... no, `POST`.
4. `await connectMongo()` — borrows the cached connection from `src/lib/mongodb.ts`.
5. **Guard checks** (each returns `{ error }` + a 400/404 status if violated):
   - Is `eggTypeId` a valid Mongo id? (`isValidObjectId`)
   - Is quantity a number ≥ 1?
   - Is `amountPaid` a number ≥ 0?
   - Does the egg type exist and is it active? Does it have a `unitPrice`?
   - Quantity × price = `saleTotal`; can't pay more than the total.
   - Is there enough stock? (derived from the `StockTransaction` ledger)
6. `Sale.create({...})` — the Mongoose librarian files a new card. The model's `pre("validate")`
   hook computes `amountOwed = saleTotal - amountPaid` and demands a `customerName` when money is owed.
7. `StockTransaction.create({ type: "sale-deduction", ... })` — drops the eggs from the ledger.
8. **Office → Counter:** `NextResponse.json(sale, { status: 201 })` — "filed, here's the receipt".
9. **Counter:** the page's `useState` gets the new sale, the list re-renders.

### Journey B — "Show the dashboard"

`page.tsx` fires **three fetches at once** with `Promise.all` — daily summary, current stock,
weekly summary. They arrive together, land in three `useState` slots, and the charts/cards draw.

### Journey C — "Download a report"

`Sidebar.tsx` builds a URL like `/api/reports/daily-csv?date=2026-09-16` inside an `<a>` tag.
The route handler computes the summary, builds CSV rows (escaping cells), and returns
`Content-Type: text/csv` + `Content-Disposition: attachment; filename="daily-2026-09-16.csv"`.
The browser offers the file for download. No React state involved — a file download is the one
place we deliberately use a plain `<a>` instead of `next/link`.

---

## 4. The two brains (client vs server) and the archive (DB)

**The counter's brain (client / browser):** React components that remember things
(`useState`), fetch data (`useEffect` + `fetch`), and redraw instantly. Because our pages are
marked `"use client"`, all of this runs in the browser. No secrets can live here — the browser
can read everything you send it.

**The office's brain (server / our machine or Vercel):** Route handlers, models, the DB
connection. This is where the **secrets live** (the Mongo URI from `.env`). The browser never
sees them.

**The archive (database):** MongoDB Atlas, a cloud-hosted **NoSQL** store. Data lives in
**collections** (like folders) of **documents** (like cards). A document is a JSON-shaped
record with an `_id`. Mongoose (the "librarian") lets us write JavaScript objects and get
JavaScript objects back, without hand-writing database queries — that's what an **ODM**
(Object-Document Mapper) is for.

---

## 5. The data model tour (the filing cards)

```
EggType (what we sell)
  _id · name · unitPrice · isActive · timestamps

Sale (a completed sale)
  eggTypeId → EggType         (who was sold)
  quantity · saleTotal · amountPaid · amountOwed
  customerName (required when amountOwed > 0)
  date · timestamps

StockTransaction (a movement of eggs)
  eggTypeId → EggType
  type: "opening" | "addition" | "sale-deduction"
  quantity · date · relatedSaleId → Sale (optional)

Adjustment (an expense or income that isn't a sale)
  type: "income" | "expense" · category · amount · reason
  description? · responsiblePerson? · date
```

Key ideas:
- The little arrow `→` is a **reference** — a card pointing at another card by its `_id`.
- `Sale.amountOwed` is **always computed**, never typed by a human — the `pre("validate")`
  hook enforces it.
- Stock isn't a single number on the egg type; it's the **net** of the transaction ledger
  (open − deductions + additions). That's why one sale touches *two* collections.

---

## 6. The rules of the farm (business rules and where they live)

| Rule | Enforced where? |
|---|---|
| `amountOwed = saleTotal − amountPaid`, always | `Sale.ts` `pre("validate")` + `sales/route.ts` |
| You can't pay more than the total | `sales/route.ts` (400) + `Sale.ts` (throws) |
| Buying on credit requires a customer name | `Sale.ts` (throws) |
| Can't sell more than you have | `sales/route.ts` (400) |
| Every sale deducts stock; every addition adds it | `sales/route.ts` + `stock-transactions/route.ts` |
| Adjustments typed `income`/`expense`; amount ≥ 0.01 | `Adjustment.ts` + `adjustments/route.ts` |
| Transport expenses: logged in reports, **hidden from the dashboard** | `dailySummary.ts` filter |
| Dates must be real (`2026-04-31` → 400) | `dateParam.ts` `parseDateParam` |
| Every API error speaks the same JSON shape `{ error }` | all route handlers |

---

## 7. Interview Q&A — beginner-friendly answers

### Next.js & the framework

**Q1: What is Next.js?**
It's a React framework that adds the server-side plumbing React doesn't ship with: file-based
routing, API routes, production builds. *(Layman: React is the LEGO bricks; Next.js is the
instruction manual plus the table you build on.)*

**Q2: What is the App Router?**
The newer routing system: a **folder = a URL**, and files inside define what happens.
`page.tsx` renders that URL; `route.ts` handles API requests on that URL. There are no
configuration files full of routes — the file tree *is* the route map.

**Q3: What does `"use client"` on top of a file mean?**
It tells Next this component must run in the **browser** — it can use hooks like `useState`
and browser APIs like `fetch`. Without that line, Next treats it as a server component
(rendered on the server, can touch the database and secrets). Our pages are data entry forms
with instant redraw — so they're client components.

**Q4: What is a route handler (`route.ts`) and what are HTTP methods?**
A route handler is just a function exported from `route.ts` that receives a `Request` and
returns a `Response`. The export name picks the HTTP verb: `export async function POST(req)`
answers POST requests, `GET` answers GET, etc. HTTP methods are the "verbs" of the web:
GET = read, POST = create, PATCH/PUT = update, DELETE = remove.

**Q5: What are HTTP status codes?**
Three-digit signals from the server. `200` OK, `201` Created, `400` Bad request (you sent
something wrong), `404` Not found, `500` Server crashed. We use them deliberately so the
front end *knows* if a save worked.

### React

**Q6: Explain `useState` and `useEffect` as if I'm new.**
`useState` is React's "memory": `const [sales, setSales] = useState([])` declares a variable
`sales` and a function `setSales` that updates it *and* redraws the screen. `useEffect` is
"do something after the component appears": on first load it fires the `fetch` calls, then
`setSales(data)` fills the screen.

**Q7: Why do we fetch data in `useEffect` and not during render?**
Fetching is a side effect (it takes time and network). React's render must be fast and pure.
So we render an initial empty state, then `useEffect` fetches, then state updates re-render
with data. That's why every page briefly shows "—" before numbers appear.

**Q8: What is `Promise.all` and why is it there?**
`Promise.all([fetchA, fetchB, fetchC])` fires three network calls **at the same time** and
waits for all three. If we awaited them one by one, the dashboard would be 3× slower.

### TypeScript

**Q9: What is TypeScript and why use it?**
It's JavaScript plus **types** — annotations that say "this is a number, this is a list of
sales". The compiler (`tsc`) checks your code *before* it runs. It catches mistakes like
`price * "three"` at your desk instead of in production.

**Q10: What is the `@/` import path about?**
`tsconfig.json` maps `@/*` to `./src/*`. So `import Sale from "@/models/Sale"` is a clean,
stable path no matter how deep the importing file is. Without it we'd write fragile
`../../models/Sale` chains.

**Q11: What is type narrowing? Give a real example from the project.**
Narrowing is TypeScript noticing from a check that a value's type changed from broad to
specific — only **within the same function scope**. In `mongodb.ts`, `MONGODB_URI` stars as
`string | undefined`. The original author wrote `MONGODB_URI as string` — a cast that forces
the type. We learned the honest way: a guard *inside* `connectMongo()` —
`if (!MONGODB_URI) throw` — narrows it to `string` naturally. Casts that fight the guard you
can't see are how projects rot. (True story: one of our sessions proved the cast was doing
real work, because narrowing doesn't cross function boundaries.)

### MongoDB & Mongoose

**Q12: What is MongoDB?**
A NoSQL database storing **documents** (JSON-like records with `_id`) in **collections**.
Flexible: two sales don't need the exact same fields — though our schemas keep them tidy.

**Q13: What is Mongoose / an ODM?**
Mongoose is a library that shapes MongoDB data and gives it rules. You define a **schema**
(field names, types, required, min, enum), it generates a **model**, and `Model.create()`
both validates your data *and* writes it. An **ODM** (Object-Document Mapper) is the same
idea as an ORM but for document databases.

**Q14: Why is there a cached connection in `mongodb.ts`?**
Connecting costs time. Hot-reload in development can re-run modules hundreds of times — one
connection per reload would open hundreds of sockets. The cache (`global` object) ensures one
connection is reused. Also, serverless platforms boot a function per request; a cached or
short-lived connection with a short `serverSelectionTimeoutMS` (5s fail-fast) keeps that fast.

**Q15: What do `timestamps: true` and `pre("validate")` do?**
`timestamps` makes Mongoose auto-fill `createdAt`/`updatedAt`. `pre("validate")` is a hook
that runs *before* data is validated/saved — we use it to compute `amountOwed` and enforce
"credit needs a customer name" in one central place the front end can't bypass.

**Q16: Why do schemas start with `models.X || model(...)`?**
In development, hot-reload re-evaluates files. Calling `model("Sale", schema)` twice throws
"OverwriteModelError". The pattern says: use the existing model if it's already registered,
otherwise create it. It makes reloads idempotent.

### HTTP & the API

**Q17: Walk me through `POST /api/sales` from a security view.**
1. Shape-check the `eggTypeId` (isValidObjectId), number checks on quantity/paid.
2. Business checks: exists, active, has price, no overpayment.
3. Stock check against the ledger.
4. Only then write. Every failure returns `{ error }` + 400/404. Input is treated as guilty
   until proven innocent — never trust the browser's word.

**Q18: Why does every error return the same `{ error: "..." }` shape?**
A **contract**. The front end (and future front ends) can rely on "any non-2xx response has
an `error` field". Mixed shapes (`text/plain` in some places, JSON elsewhere) create bugs
that only appear in edge cases. Consistency is a feature.

**Q19: What does `Content-Disposition: attachment` do on the CSV routes?**
It tells the browser "this is a file, save it" rather than "render this content in the tab".
Combined with `Content-Type: text/csv`, downloading the report becomes a one-click save.

### Data & visualization

**Q20: How does the dashboard get its numbers?**
Three parallel fetches to the reports + stock APIs. `Promise.all`, JSON into state. Charts
consume that same state — the donut re-renders when a sale changes the stock.

**Q21: Why recharts for charts?**
It's the industry-standard React chart library. For a donut and bars, it gives us tooltips,
legends, and responsive sizing out of the box. We passed it `data: [{name, value}]` — much
less code than hand-drawing SVG. Trade-off: it adds a dependency and a bundle cost.

**Q22: What is the `ResponsiveContainer` quirk we hit?**
`ResponsiveContainer` sizes itself by measuring its parent *after* paint — so during a
server render it reports 0 and the chart would be invisible. We fixed it by passing an
explicit numeric height (`224`), which also makes the chart work before measurement.

**Q23: Why is there a "Stock split" donut AND a "Paid vs Owed" donut?**
Different decisions: "what's in my inventory?" is a share-of-total question (perfect for a
donut). "How much money actually came home?" is a two-way split (paid vs still owed).
Always match the chart to the *question*, not to fashion.

### UI/UX

**Q24: Why did we move from a top nav bar to a sidebar?**
Professional dashboards use persistent navigation on the side: it stays visible while you
work, gives the layout a two-pane frame, and scales to more sections. Top bars suit marketing
sites; left rails suit tools. We also built it as one `Sidebar` component reused on all five
pages — change once, updates everywhere (**DRY**).

**Q25: What's DRY and where did we apply it?**
"Don't Repeat Yourself." The date helpers moved from the dashboard into `src/lib/dates.ts`
(a single source of truth). The CSV escaper into `src/lib/csv.ts`. The dashboard/sidebar
both import them instead of duplicating the logic. Duplication is how bugs breed in two
places at once.

**Q26: How is the current page highlighted in the sidebar?**
`usePathname()` (a Next hook) returns the current URL; `pathname === link.href` decides which
`Link` gets the blue active classes. The whole nav re-renders on navigation.

### Testing

**Q27: What do the Vitest tests actually protect?**
`csv.test.ts` guards `escapeCSV` against commas/quotes (file integrity). `sale.test.ts`
locks the business rules: `amountOwed` math, overpayment rejection, credit-needs-customer.
`dateParam.test.ts` locks the date validator (rejects impossible dates, accepts real ones).
If any future change breaks these rules, `npm test` fails loudly.

**Q28: Why write tests when the app "works"?**
Because "works today" ≠ "stays working". Tests are a safety net: refactor with confidence,
catch regressions at save-time instead of when a customer's invoice is wrong. It's the
difference between a machine you maintain and a house of cards on a windy day.

### Security

**Q29: Why is `MONGODB_URI` in `.env` and not in code?**
The URI contains database credentials — a secret. Committing it ships the key to anyone with
repo access. `.env` is gitignored, read at runtime via `process.env`. Code plus secrets
separated; the secret stays on your machine (and later, in the host's secret store).

**Q30: What was the `console.log(process.env)` mistake?**
`process.env` holds *all* environment variables. Logging it printed the `MONGODB_URI` —
including the MongoDB password — into logs that might be shared or retained. Log formatter:
log *messages*, never credentials. Lesson memorized the expensive way.

**Q31: What is input sanitization/validation? Give a project example.**
Treat every incoming value as hostile until it passes checks. A typed amount != a number
gets `400`. A quantity of 0 gets `400`. An impossible date (`2026-02-30`) gets `400`.
The data only touches the database after the rules say it's safe.

### Git & workflow

**Q32: What does a good commit look like?**
Small, focused, one purpose, with a message that tells *why*: `fix: reject impossible dates
via round-trip param guard (Phase 12)`. Commit early and often; inspect with
`git status`/`git diff` beforehand so you never stage a secret or a half-finished file.

**Q33: Why never commit `.env`?**
Because once a secret is in Git history, "deleting" it later doesn't erase history — it's
still a leaked credential. Prevention (gitignore) beats cleanup.

### Deployment & production

**Q34: What happens when this app deploys to Vercel?**
Vercel runs `next build`, producing optimized static + server-rendered bundles. Serverless
functions start on demand (cold start), run, and stop. Environment variables are set in the
Vercel dashboard (not in the repo). `MONGODB_URI` points at the Atlas cluster with network
access allowed from the 0.0.0.0/0 range (or IP-restricted).

**Q35: Why does production care about `serverSelectionTimeoutMS`?**
Our `connectMongo` fails fast (5s) if MongoDB is unreachable. Defaults can wait 30s+; a
serverless function killed mid-wait returns nothing. Fail-fast means the user gets a real
error quickly instead of a mystery timeout.

**Q36: What's the difference between `npm run dev`, `npm run build`, and `npm start`?**
`dev` is the slow, hot-reloading kitchen for cooking; `build` is the health inspection that
compiles, typechecks and prints a route report in the terminal; `start` serves the finished
build. An inspection never shows you a page — that's what `dev`/`start` are for.

### Blank-canvas questions

**Q37: "Add a 'Sales by customer' page." Walk me through your plan.**
Understand: no `customerName` is required unless money is owed — so the feature partly
exists already in `customerName` on Sales. Then: new `page.tsx` under `src/app/customers/`,
a `route.ts` that groups Sales by `customerName` and sums totals (reuse `connectMongo` +
`Sale`), also mention: our GET `/api/sales` already returns recent sales but doesn't group —
a new endpoint or client-side aggregation. Trade-off: server-side grouping keeps the payload
small; client-side is zero new API. Then tests for the grouping function, lint/build, commit.

**Q38: How would you debug "the dashboard shows no charts"?**
Check the network tab — are the three fetches returning 200? Is `stock` empty (then the
donut shows the "No stock" message)? Is it a Recharts `ResponsiveContainer` 0-height?
(Explicit height fix.) Is there a hydration error in the console? Is the API returning
`{ error }`? Each step narrows the problem — never guess, inspect.

**Q39: What's the 'verify-before-done' habit worth in a job?**
In this project, three or four "Done!" moments were actually unsaved files or a half-saved
edit. The professional habit is: make a change, *read it back*, run the checks, then say done.
Teams forgive bugs; they do not forgive unverified claims of done.

---

## 8. Glossary

| Term | Plain meaning |
|---|---|
| API | The office doorway — a URL a program calls. |
| App Router | Next.js routing where folders = URLs. |
| Client component | React code that runs in the browser (has `"use client"`). |
| Server component | React code rendered on the server; may touch secrets/DB. |
| Collection | A folder of MongoDB documents. |
| Document | One MongoDB record (JSON-ish, has `_id`). |
| ODM | Mongoose — map JS objects ↔ MongoDB documents. |
| Schema | The rulebook for a document's fields. |
| Model | The schema given a name, with methods like `create`/`find`. |
| ObjectId | MongoDB's unique id for a document. |
| Route handler | The `GET`/`POST`/… functions in `route.ts`. |
| JSON | The web's lingua franca for passing data. |
| useState / useEffect | Memory / "after-appear" effects in React. |
| Promise.all | Fire several async calls together and wait for all. |
| Narrowing | TypeScript refining a broad type via a check. |
| DRY | Don't Repeat Yourself — one source of truth. |
| Regression | A bug that reappears after it was fixed. |
| Unit test | A test of one pure function in isolation. |
| Serverless | Functions that boot on demand, run, die. |
| Cold start | The (slow) first boot of a serverless function. |
| Env var | A value set outside code (`.env` / hosted panel). |

---

## 9. Cheat sheet — commands & the day-to-day loop

```bash
npm run dev          # cook locally → http://localhost:3000
npm run build        # the health inspection (also typechecks)
npm start            # serve the finished build
npm run lint         # style & bug sniffing (eslint)
npm test             # run the 15 unit tests (vitest)
npx tsc --noEmit     # quick type-only check without building
```

**Your loop with every feature:**
1. Understand the business rule.
2. Write the smallest piece; read it back before "done".
3. `npm run lint` + `npx tsc --noEmit` + `npm test` + `npm run build`.
4. Click it in the browser; watch the network tab.
5. Commit with a truthful message. Never code → never commit without asking.

**Where the app is up to:** all app phases (sales, inventory, debt, adjustments, reports,
CSV, charts, sidebar) are implemented and tested; production prep (Phase 13) is underway;
deployment (Phase 14) is the open frontier.