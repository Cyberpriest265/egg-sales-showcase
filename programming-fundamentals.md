# Programming Fundamentals — A Living Reference

A running, beginner-friendly reference of the programming knowledge built during the Egg Sales project. Grows as we learn — new topics get added to the relevant section of *this* file, never scattered notes.

**How to read it:** each concept has a plain-language explanation, a small example, and a "why it matters" note. Examples borrow from the project you're building so they feel familiar.

---

## 1. Variables & Data Types

**A variable is a labelled box for a value.** The label is the name; the box is the memory slot; the value is what's inside.

```ts
const name = "Hajia";        // string — text
let quantity = 5;            // number
const isPaid = false;        // boolean — true/false
```

- `const` = the box's label can't be reassigned (the value stays).
- `let` = you plan to update it later.
- **State in React is just variables that, when changed, make the UI redraw:**

```tsx
const [amountPaid, setAmountPaid] = useState("");
```

- **TypeScript (what our project uses)** adds types so the compiler catches mistakes *before* the app runs:

```ts
const customerName: string = "";   // not-a-string will be refused
```

**Data types you meet constantly:**

| Type | Plain meaning | Example |
|---|---|---|
| `string` | text | `"Large Eggs"` |
| `number` | a value you can do math on | `55` |
| `boolean` | yes/no | `true` |
| `object` | a collection of named fields | `{ saleTotal: 165, paid: 160 }` |
| `array` | an ordered list | `[165, 275, 550]` |
| `null` / `undefined` | "nothing there" | `customerName` optional |

**Why it matters:** almost every bug in this project so far was *variable mismatches* — `EggTypeId` vs `eggTypeId`, `sale` vs `Sale`. The box label must match what you write, everywhere, exactly. The compiler's whole job is to check your labels line up.

> **Learning radar:** TypeScript's `type` keyword (we use it) and `interface` (the OOP-flavoured cousin) — both describe the *shape* of data. Pick one and stay consistent.

---

## 2. Control Flow

**Control flow is telling the program which branch to take.** `if` is the fork in the road.

```ts
if (amountOwed > 0) {
    // customer required
} else {
    // nobody owes anything
}
```

**Two shortcuts you'll see in our code:**

- `&&` — "only render this if the left side is truthy":

```tsx
{amountOwed > 0 && <input placeholder="Customer Name" />}
```

- the ternary — `condition ? value-if-true : value-if-false`:

```ts
const paid = amountPaid === "" ? 0 : Number(amountPaid);
```

**Loops say "do this to every item."** But modern JS prefers *array methods* over `for` loops — they read as English:

```ts
sales.reduce((sum, s) => sum + s.amountPaid, 0);   // add up all paid
sales.filter((e) => e.isActive);                    // keep only active
sales.map((sale) => <Row key={sale._id} />);        // turn each into a row
```

- `filter` — keep items that pass a test
- `map` — transform each item into something else
- `reduce` — collapse a list into a single value (sum, total, max…)

**Why it matters:** choosing the *descriptive* method instead of a raw loop is how code tells its own story. `reduce` for totals, `map` for render, `filter` for subsets — a reader knows your intent instantly.

---

## 3. Functions & Modularity

**A function is a named pack of instructions** — write it once, reuse it anywhere.

```ts
export async function getDailySummary(date: Date): Promise<DailySummary> {
    // ... find sales, add up the numbers
    return summary;
}
```

- **`parameters`** — the inputs it needs (here: `date`)
- **`return`** — the output it hands back
- **`export`** — makes it importable from other files, so one definition serves many callers

**Two deeper ideas you now own:**

1. **Pure functions** — a function that only uses its inputs and returns a value (never touches outside state) is *predictable and testable*. `getDailySummary` is pure, which is why our future tests can check it directly.

2. **Single responsibility + the "thin route" pattern.** A route handler should *parse input → delegate to a service → return JSON* — no business logic of its own. Business rules live in the `services` layer, one concern (money totals), one place. Three consumers (dashboard, reports, tests) call the same function instead of three copies of the same math.

**Why it matters:** duplication is how bugs multiply. If the "owed" formula lives in five files, fixing it takes five edits and you're guaranteed to miss one. Extract once, use everywhere.

> **Learning radar:** "composition over inheritance", default parameters (`function f(x = 10)`), and rest/spread (`...items`) — all "pack up the inputs and go" tools you'll touch in a month.

---

## 4. Object-Oriented Programming (OOP)

**Objects bundle data *and* behaviour together.** A `Sale` isn't just fields — it has rules (a `quantity` can't be zero; `amountOwed` is derived).

Fields = data (what the thing *is*). Methods = behaviour (what the thing *does*).

```ts
class Sale {
    quantity: number;
    amountPaid: number;
    amountOwed: number;

    constructor(quantity: number, amountPaid: number) {
        this.quantity = quantity;
        this.amountPaid = amountPaid;
        this.amountOwed = quantity * 0; // computed, not stored
    }
}
```

Four pillars, explained plainly:

- **Encapsulation** — keep data and rules together, expose only what's needed. Our Mongoose schema does this: the model (schema + validation hooks) is the single place Sale's rules live.
- **Inheritance** — a class that *extends* another gets its behaviour and adds its own (a `CashSale extends Sale`).
- **Polymorphism** — different objects answer the same call differently. All the models expose `find()`, `create()` — the shape is the same, the internals differ.
- **Abstraction** — you call `Sale.find()` without caring how MongoDB queries run inside. You use the abstraction, not the plumbing.

**Our project already uses OOP** — Mongoose models are object-oriented data modelling: the `Sale` schema validates *itself* (the `pre("validate")` hook) rather than trusting callers.

**Why it matters:** when data has rules, stuffing the rules beside the data (encapsulation) keeps one source of truth — the same instinct behind the service layer.

---

## 5. Data Structures

**Data structures are ways of arranging data to make the work cheap.**

Two you live in already:

- **Array** — an ordered list. You push, filter, map, reduce. *Cost of finding one item: check from the front.*
- **Object / record** — a lookup by *name*. `eggTypes.find(e => e._id === id)` scans a list; `stockById[id]` jumps straight to a slot. Objects are "random access"; arrays are "walk the line."

Plain object as a lookup:

```ts
const stockByType = { "egg-1": 122, "egg-2": 40 };
stockByType["egg-1"];   // 122 — instant
```

**Why it matters:** for lists you process (sales), arrays. For lookups by key (find a name for an id), objects. Choosing the wrong one causes the *symptoms* you saw: sluggish tables, nested loops, "why is this so slow" moments.

> **Learning radar:** `Set` (a list of unique values — "has this customer bought today?"), `Map` (a lookup with non-string keys), and `q-value` ranges. Later: trees and hash maps as mental models for how databases index data.

---

## 6. Input / Output (I/O)

**I/O is everything that moves data between your program and the outside world** — the network, the browser, the database, files.

The app's daily loop is all I/O:

- **Client** (browser) sends an HTTP request → **Server** (Next.js route) responds.
- **Write** via `POST` (change data), **Read** via `GET` (get data). Same URL, different verb = different meaning (REST).

```ts
await fetch("/api/sales", { method: "POST", body: JSON.stringify(...) });
```

- **JSON** is the message format — text that any language can read.
- **Query params** carry the "which one?" detail: `?date=2026-09-04`.
- The **database** is persistent I/O: `Sale.find({ date: { $gte: start, $lt: end } })` — a query expressing a range ("a day" is two instants).

**Why it matters:** *every* web app is this same loop — client asks, server answers, database remembers. Master I/O and you understand 80% of web development. The rest is making the answers *useful* (validation, formatting, security).

> **Learning radar:** HTTP status codes (200 OK, 400 bad request, 404 not found, 500 server error), request headers, and the difference between them — the vocabulary of every API conversation.

**Testing an API from the terminal** — the browser can only do GET; for POST you need a client. In PowerShell (git-bash: `curl`; or Postman for point-and-click):

```powershell
$body = @{ type = "expense"; category = "transport"; amount = 20; reason = "test" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/adjustments" -Method Post -ContentType "application/json" -Body $body
```

- `@{ ... }` builds the data as name→value pairs
- `ConvertTo-Json` turns it into the JSON the API expects (the same shape `fetch` sends)
- `Invoke-RestMethod` = PowerShell's `fetch` — send a request, get the parsed reply
- `-Method Post` = the verb (drop it for GET)
- GET needs no body: `Invoke-RestMethod "http://localhost:3000/api/reports/daily?date=2026-09-04"`
- To *see* error codes, use `Invoke-WebRequest`, or wrap in `try/catch` and inspect `$_.Exception.Response.StatusCode`

---

## 7. Problem Solving & Algorithms

**An algorithm is the step-by-step recipe for solving a problem.** The recipe matters more than the language.

The core habit, in order: **understand the problem → break it into pieces → solve each piece → check your work.**

Pieces you've already solved with recipes:

1. "Find a day's sales" → translate *calendar day* into a **date-range query** (`$gte` midnight, `$lt` next midnight). The hard part wasn't the query — it was *rephrasing the everyday idea into precise math*.
2. "Total everything for the day" → `reduce`. Sums of quantity, total, paid, owed.
3. "Show the newest first" → `.sort({ date: -1 })`.
4. "Limit what we send" → `.limit(50)` — sending 50 records, not an endless list.

**Complexity (the "how much work" dial):** scanning a list of `n` items is *linear* — 10 items = 10 checks, 10,000 = 10,000. Lookups by key are near-instant no matter the size. When you hear "this is O(n)" or "O(1)", translate it as *"work grows with the list"* vs *"work is constant"* — same cost regardless of size.

**Why it matters:** the *recipe* is reusable; rephrasing vague requirements into precise steps is the whole job. The `.limit(50)` misunderstanding ("50 days" vs "50 records") is a perfect case: one word of the recipe was misread and the whole plan was wrong.

> **Learning radar:** divide-and-conquer thinking (sorting, binary search), recursion (a function calling itself), and "choose data structure first, then the algorithm" — the senior habit.

---

## 8. Concurrency

**Concurrency is doing more than one thing at a time.** JavaScript does the *waiting* in the background so the page never freezes.

- A **Promise** is a placeholder for a value that will arrive later (a server reply).
- `await` says: "pause right here until the value arrives, and don't block everything else meanwhile."
- `async` marks a function that's allowed to `await`.

```ts
const [stockRes, eggRes, txRes] = await Promise.all([
    fetch("/api/.../stock"),
    fetch("/api/egg-types"),
    fetch("/api/stock-transactions"),
]);
```

- `Promise.all` fires three requests *at the same time* instead of one-after-another — three times faster, one line.

**The mental model:** the code reads top-to-bottom (easy to follow), but the *runtime* juggles waiting. "Simplicity of code, efficiency underneath" — that's the async dream.

**Why it matters:** every `fetch` in this project is concurrency. Do them sequentially and the page crawls; batch them with `Promise.all` and it snaps. And when things go wrong, it's why `try/catch` matters: the await fails silently unless you catch it.

> **Learning radar:** `Promise.allSettled` (one bad request doesn't kill the batch), timeouts on `fetch`, and — much later — actual parallelism (multiple CPU cores). Start with "await plus `throw` inside a `try`".

---

## 9. System Architecture

**Architecture is deciding *where* each responsibility lives and how pieces talk.** The plan's own stack:

```
UI (React components, Bento cards)
   ↓  fetch / JSON over HTTP
API Routes (Next.js)
   ↓ call
Service layer (business logic)
   ↓
Mongoose models (data access)
   ↓
MongoDB
```

Rules behind every decision here:

- **Separation of concerns** — UI shouldn't know MongoDB; the database shouldn't know React. Each layer speaks only to its neighbour.
- **Monolith-first**: one app (UI + API + logic) beats microservices until the app earns the complexity. Simplicity is a feature.
- **Client vs server** — "use client" components run in the browser; route handlers run in the server. Code that touches the DB *must* be server-side; code that touches the screen, client-side. Secret-y things must *never* leave the server.
- **Configuration is not code** — the database URI lives in `.env` (gitignored), read via `process.env.MONGODB_URI`. Credentials in code = a leak waiting to happen (this is why we deleted that `console.log`).

**Why it matters:** architecture is *change management*. When the product asks for "reports," the service layer is already there to reuse. Well-placed seams turn "rewrite everything" into "add one small thing."

> **Learning radar:** environment variables and `.env` hygiene, deployment topologies (Vercel serverless vs a lone server), and the "who owns this data" question behind every schema design.

---

## 10. Other Core Concepts (mortar between the bricks)

These run through every section:

- **Validation** — never trust input. Client validates for speed (instant feedback); server validates as *source of truth* (client can be bypassed). Both, always.
- **Error handling** — `try/catch` + returning a clear message. A user seeing "Not enough stock. Available: 3" beats a cryptic crash. Fail fast, fail clearly.
- **DRY** — *Don't Repeat Yourself*. Every duplicated formula is a future bug waiting in two places.
- **Naming** — names are half the code. `successBanner` tells the reader what it is; `x` tells them nothing. TypeScript's compiler enforces exact names; your readers rely on *useful* names.
- **Version control (git)** — the project's time machine + a record of intent via commit messages ("feat: …", "fix: …", "docs: …").
- **Security hygiene** — never log secrets, never hardcode credentials, treat every input as hostile until validated.
- **Testing** — proving behaviour with code (coming in Phase 12) instead of only trusting the eye test.
- **Reading error messages literally** — the compiler and runtime are collaborators. "Property 'totalPaid' is missing" is not a vague wall of pain; it's a precise dated instruction.

**Why it matters:** these aren't features — they're *habits*. They're what turns "it works on my machine" into "it works for anyone, on any machine, forever."

---

## 11. Testing (Vitest)

**Testing is proving behaviour with code instead of trusting the eye test.** A test is a tiny script that *runs your code* and *checks its answer* — automated proof, repeated forever.

**Why it's not optional:** manual testing drifts. You test "owed = total − paid" once, it works, you move on — then a change 20 commits later silently breaks it and nothing tells you. A test *never forgets*. It's a **specification that refuses to lie**: every `it("does this when that")` names a promise your code made.

**Vitest's place in the stack:** your app's runtime is the browser/Next.js. Vitest is a *separate* world where pure functions are executed and their outputs compared. It's built on **vite** (the bundler it needs as a peer install) — think of vitest as "vite for running checks instead of serving pages."

**The anatomy of a test — three parts:**

```ts
import { escapeCSV } from "@/lib/csv";

describe("escapeCSV", () => {                 // the suite = a group of promises
    it("passes clean strings through unchanged", () => {   // one promise, as a sentence
        expect(escapeCSV("hello")).toBe("hello");          // the verdict
    });
});
```

Read the pattern as a sentence: *"So-and-so **does** this **when** that."* If it fails, the failure message reads like prose: `Expected "a,b" to be "a,b"`.

**The shape of every test — arrange, act, assert:**

1. **Arrange** — set up the inputs (`escapeCSV("a,b")`)
2. **Act** — run the thing you're testing (the matcher calls it)
3. **Assert** — compare the output to the known answer (`.toBe` = "must equal exactly")

**What makes code *testable*:** pure functions. `escapeCSV` takes in, returns out, touches no database, no network, no randomness — so it's trivial to test. Code tangled with a database (a route) needs an *integration* test with a real (or mocked) DB, which is heavier. That's why the project keeps logic in **services/functions** (pure, testable) separate from **routes** (wired, busier).

**Commands:**

- `npm test` — run all tests once (CI / pre-commit mode)
- `npm run test:watch` — re-run on every save (build-time companion while developing)

**Setup trivia worth remembering:** the `@` alias had to be mirrored in `vitest.config.ts`, otherwise `@/lib/csv` couldn't resolve inside the test world; and `--legacy-peer-deps` (peers like vite skipped) put two install steps on the table. Peer-dependency conflicts are "runtime vs types" scandals — always confirm which one npm is fussing about before overriding.

> **Learning radar:** testing *with* a database (integration tests), mocking (`mock`/`spy` to fake the DB so tests stay fast), coverage reports (what percent of your code has proof), and Test-Driven Development — *write the test first, watch it fail, then write the code to make it pass.*

---

## Concept map: where we are

| Concept | Anchored in | Section |
|---|---|---|
| Variables & types | `useState`, Sale model fields | 1 |
| Control flow | `amountOwed > 0 && <field/>` | 2 |
| Functions & modularity | `getDailySummary` service | 3 |
| OOP | Mongoose models + validation hooks | 4 |
| Data structures | sales arrays, id→name lookups | 5 |
| I/O | fetch, GET/POST, query params, MongoDB | 6 |
| Algorithms | date-range query, reduce, sort, limit | 7 |
| Concurrency | async/await, `Promise.all` | 8 |
| Architecture | plan's UI → API → service → model → DB | 9 |
| Habits | validation, naming, git, secrets | 10 |
| Testing | `describe`/`it`/`expect`, arrange-act-assert, Vitest | 11 |

*Last updated: Day 9 — Phase 12 (testing setup + Vitest).*