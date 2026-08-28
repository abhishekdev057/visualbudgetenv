# Envelope

**Give every rupee a purpose.**

Envelope is a production-oriented, dark-first visual budgeting application. It gives each month its own income, envelope allocations, spending, savings, history, and data-driven insights—without demo financial data or browser-side financial truth.

## What is included

- Secure email/password accounts with bcrypt-hashed passwords
- Opaque, revocable sessions: `HttpOnly` cookies for web and bearer tokens for mobile clients
- First-run onboarding with income, template/custom envelopes, and over-allocation protection
- Month-specific budgets and copy-forward plans (never transaction history)
- Premium responsive overview, envelope, activity, insight, profile, and settings experiences
- Fast expense entry; edit/delete history; search, filter, and sort
- Safe envelope deletion with required transaction transfer
- Exact decimal financial calculations and server-authoritative totals
- JSON data export and account deletion
- Versioned `/api/v1` API, [API guide](docs/API.md), and [OpenAPI specification](openapi.yaml)

## Stack and architecture

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Lucide, Recharts, Zod, Drizzle ORM, Neon PostgreSQL, and Vitest. Server pages, route handlers, and future mobile clients share services under `src/lib/services`; derived financial values are centralized in `src/lib/finance.ts`.

The relational model includes users, profiles, settings, sessions, monthly budgets, envelopes, and transactions. All owned reads/writes include `user_id`, with foreign keys and deliberate delete behavior. Money uses PostgreSQL `NUMERIC(18,2)` and decimal strings over the API.

## Local setup

Requirements: Node.js 20+ and a Neon PostgreSQL database.

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. New accounts begin with no budget or transaction records.

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | yes | Neon pooled application connection |
| `DATABASE_URL_UNPOOLED` | recommended | Direct connection used by migrations; falls back to `DATABASE_URL` |

Never expose these as `NEXT_PUBLIC_*`, commit `.env*`, or place credentials in `vercel.json`.

## Database

The checked-in SQL migration is `src/db/migrations/0000_envelope_foundation.sql`.

```bash
npm run db:migrate
npm run db:generate   # generate future Drizzle migrations after schema changes
npm run db:studio
```

The migration is idempotent for clean setup. No seed script exists by design; category templates live only as onboarding metadata.

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Tests cover exact decimal summaries, zero-income protection, over-budget status, large/decimal values, and invalid financial input.

## API

See [docs/API.md](docs/API.md) for authentication, response contracts, endpoints, query parameters, money representation, and examples. `openapi.yaml` provides the machine-readable surface. `GET /api/health` checks database connectivity without revealing configuration.

## Deploy to Vercel

1. Import the GitHub repository in Vercel.
2. Add `DATABASE_URL` and `DATABASE_URL_UNPOOLED` in Project Settings → Environment Variables.
3. Run `npm run db:migrate` once against the target Neon database.
4. Deploy; Vercel runs `npm run build` automatically.
5. Verify `/api/health`, registration, onboarding, a persisted expense, refresh, and account isolation.

The application uses no persistent filesystem or long-running process and accesses Neon through the serverless driver.

## Security notes

- Passwords are never logged or returned.
- Session tokens are random and only digests are stored.
- Cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Cookie mutations validate request origin; bearer clients authenticate independently of browser state.
- Security headers deny framing, MIME sniffing, sensitive device permissions, and cross-origin referrer leakage.
- Zod validates every external financial input; services independently verify ownership and relationships.

This is personal-budgeting software, not a bank, payment service, or investment product.
