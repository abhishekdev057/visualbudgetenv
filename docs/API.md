# Envelope API v1

Envelope exposes a versioned JSON API for the web client and future mobile clients. The base path is `/api/v1`. Monetary values are decimal strings with exactly two fractional digits in responses (for example, `"1200.00"`); clients must not convert them to binary floating point for accounting.

## Authentication

Web clients use the `HttpOnly`, `SameSite=Lax` `envelope_session` cookie created by registration or login. Native clients send `"client": "mobile"` during registration/login and receive an opaque access token and expiry; send that token as `Authorization: Bearer <token>`. Tokens are random, stored only as SHA-256 digests, expire after 30 days, and can be revoked with logout.

Mutating cookie-authenticated requests validate the browser origin. All endpoints require authentication except register, login, and `/api/health`.

## Response contract

Success:

```json
{ "success": true, "data": {} }
```

Error:

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Please check the submitted values" } }
```

Validation failures return `422`; unauthenticated requests `401`; missing owned records `404`; conflicts `409`; unexpected errors `500`. Production responses never include stack traces or database details.

## Endpoints

### Authentication

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Create account, profile, settings, and session |
| POST | `/auth/login` | Create a session |
| POST | `/auth/logout` | Revoke the current session |
| GET | `/auth/me` | Current authenticated user |
| POST | `/auth/change-password` | Verify current password, rotate it, and revoke other sessions |
| GET | `/auth/google` | Start the web Google authorization-code sign-in flow |
| POST | `/auth/google/mobile` | Exchange a verified Google ID token for a native Envelope session |

Register body:

```json
{ "displayName": "Asha", "email": "asha@example.com", "password": "StrongPass123", "client": "mobile" }
```

Login body: `{ "email": "asha@example.com", "password": "StrongPass123", "client": "web" }`.

Google web sign-in redirects through `/auth/google/callback`; the server verifies state, nonce, authorization code, token signature, issuer, audience, expiry, and verified email before it creates an Envelope session. The Google client secret stays server-side.

Native clients must obtain a Google-issued ID token for the configured **web** client ID, then send it only via HTTPS:

```json
{ "idToken": "google-issued-id-token" }
```

`POST /auth/google/mobile` returns `{ user, accessToken, expiresAt }`, matching the existing mobile credential contract. The backend never accepts a plain Google user ID and does not store Google access or refresh tokens.

### Profile, settings, and account

| Method | Path | Purpose |
|---|---|---|
| GET, PATCH | `/profile` | Read or update display name, avatar, locale, currency, timezone |
| GET, PATCH | `/settings` | Read or update theme preference |
| GET | `/export` | Download the authenticated user's structured JSON export |
| DELETE | `/account` | Permanently delete the user and all owned data after password confirmation |

Account deletion body: `{ "password": "current password", "confirmation": "DELETE" }`. Google-only accounts use their active authenticated session plus `{ "confirmation": "DELETE" }`; they may add a password first in Settings.

### Budget months

| Method | Path | Purpose |
|---|---|---|
| GET, POST | `/budgets` | List or create monthly budgets |
| GET, PATCH, DELETE | `/budgets/:id` | Read summary, update income, or delete a month |
| GET | `/budgets/current?year=2026&month=8` | Summary for a calendar month, or `null` |
| GET | `/budgets/:id/summary` | Authoritative totals and envelope status |
| POST | `/budgets/:id/copy` | Copy the envelope plan to another month |
| GET | `/dashboard?year=2026&month=8` | Alias of the month summary |

Create budget:

```json
{
  "year": 2026,
  "month": 8,
  "income": "50000.00",
  "envelopes": [
    { "name": "Food", "icon": "Utensils", "accent": "amber", "type": "expense", "allocatedAmount": "8000.00" },
    { "name": "Savings", "icon": "PiggyBank", "accent": "violet", "type": "savings", "allocatedAmount": "10000.00" }
  ]
}
```

Copy body: `{ "year": 2026, "month": 9 }`. Names, icons, types, allocations, and order are copied. Transactions never are.

### Envelopes

| Method | Path | Purpose |
|---|---|---|
| GET, POST | `/budgets/:budgetId/envelopes` | List or create envelopes in an owned month |
| GET, PATCH, DELETE | `/envelopes/:id` | Read, edit, or safely delete an envelope |

Delete returns `ENVELOPE_HAS_TRANSACTIONS` if history exists. To preserve it, call `DELETE /envelopes/:id?moveTo=<owned-envelope-id>` with another envelope from the same month.

### Transactions

| Method | Path | Purpose |
|---|---|---|
| GET, POST | `/transactions` | Paginated history or create a transaction |
| GET, PATCH, DELETE | `/transactions/:id` | Read, edit, or delete an owned transaction |

Supported list parameters: `budgetId`, `envelopeId`, `search`, `from`, `to`, `year` plus `month`, `limit` (1–100), `cursor`, and `sort` (`newest`, `oldest`, `highest`, `lowest`). The response contains `items` and `nextCursor`. Cursors are opaque and must be returned unchanged.

Create expense:

```json
{
  "budgetMonthId": "22b06ab2-7fb4-4d3f-8c92-f1124f08eb80",
  "envelopeId": "98b65ac8-e90c-4722-9a80-54e2e79661f3",
  "title": "Weekly groceries",
  "amount": "1200.00",
  "transactionDate": "2026-08-28T00:00:00.000Z",
  "merchant": "Local market",
  "note": null
}
```

The server verifies that both IDs belong to the authenticated user and the same month. It selects `expense` or `saving` from the envelope type.

### Insights

| Method | Path | Purpose |
|---|---|---|
| GET | `/insights?year=2026&month=8` | Current month data-driven insights |
| GET | `/budgets/:id/insights` | Insights for a specific owned budget |

Insights are omitted when their supporting data does not exist; no comparison is invented for missing months.

### System

`GET /api/health` checks application/database connectivity and returns a timestamp. It does not disclose configuration.

## Security and ownership

Every financial query is scoped by authenticated `user_id`. Foreign envelope or budget IDs fail as not found; relationship validation prevents attaching a transaction to another account or month. Passwords use bcrypt with cost 12. Database credentials are server-only and never part of API responses or browser bundles.
