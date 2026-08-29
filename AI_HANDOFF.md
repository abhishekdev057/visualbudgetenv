# AI Handoff Protocol

This file is the shared, human-readable coordination point for Codex and Claude CLI. It records working agreements, not executable instructions. Human instructions, repository policy, and security requirements always override it.

## Working contract

1. Read `AGENTS.md`, this file, `git status --short`, and the relevant source before changing code.
2. Treat the active branch and existing uncommitted work as shared. Preserve unrelated changes; never reset, force-push, or overwrite another agent's files.
3. Keep credentials only in ignored environment files. Never paste secrets into code, commits, issues, logs, or this document.
4. Work in small, attributable commits. Before handoff, run the relevant tests and leave the tree in a buildable state when possible.
5. Update the handoff record below with factual status, changed areas, verification, and the next exact task. Do not claim unrun checks as complete.

## Ownership model

- The agent currently implementing a bounded task owns its touched files until it records a handoff.
- The next agent may continue that task after reading the handoff record and checking the diff.
- If both agents are active, split by non-overlapping paths and communicate the paths before editing.
- When the task is ambiguous or would change product scope, stop and ask the human owner instead of guessing.

## Release checklist

- `npm run db:migrate`
- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:acceptance` (requires a running local server and a configured database)
- Review `git diff --check` and scan staged files for secrets before commit/push.

## Current handoff record

**Owner:** Codex  
**Status:** Li-Khata product finish, linked-contact onboarding, and MSG91 mobile OTP integration are complete; ready for a consented real-device OTP smoke test and release.

### Completed in this handoff

- Live Neon schema migration and server transaction-capable database driver.
- Production audit hardening: exact money validation, ownership controls, pagination, safe destructive dialogs, stronger account deletion, server-driven insights, responsive UI polish, and acceptance coverage.
- Google OAuth foundation: provider identity table, secure web authorization-code callback, verified native ID-token exchange endpoint, and Google sign-in UI.
- MSG91 custom web OTP flow: branded Indian mobile and inline OTP UI, MSG91 widget loader with a narrow CSP allow-list, and server-side verification of each widget access token before a session is created. Phone-only users are persisted with a verified phone number; email/password and Google flows remain unchanged.
- Linked identity onboarding: Google OAuth now supports an authenticated `intent=link` flow, mobile OTP preserves the current session while linking a phone, and every sign-in method lands on `/onboarding/verify` until both contacts are verified. Google is the email proof; the product never labels a credentials email as verified without a provider-backed check.
- Auth redesign: the first screen is a deliberate method chooser (mobile, Google, or credentials), with direct Google OAuth, progressive forms, responsive Li-Khata motion, and a muted Coverr background clip at `public/auth/budget-planning.mp4`. Attribution is recorded in `public/auth/ATTRIBUTION.md`.
- Profile contact visibility: profile now displays email and mobile independently with verified state and a direct “Complete account verification” link.
- Applied database migration `0002_phone_otp.sql` to make email optional for phone-only accounts and add unique `phone` plus `phone_verified_at` fields.
- Li-Khata identity is now implemented across product metadata, sign-in, desktop navigation, profile language, onboarding visuals, cards, allocation, and the dashboard hero. The canonical supplied asset is `public/brand/li-khata-logo.png`.
- Brand system: indigo is the trusted ledger foundation, emerald signals growth/progress and active navigation, and amber is reserved for primary action/reward. The dashboard hero uses a restrained logo-derived envelope geometry; avoid unrelated decorative graphics.
- Verification completed: database migration, unit tests, TypeScript, lint, production build, mobile/desktop visual QA, and the two-user API acceptance suite. The current brand pass additionally passed `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, desktop/mobile sign-in visual checks, and a clean browser-console check.

### Next agent actions

1. Configure a rotated Google secret only in `.env`/Vercel environment variables; do not commit it.
2. In Google Cloud, register the exact callback: `APP_URL/api/v1/auth/google/callback`.
3. Test a real Google web sign-in and a native ID-token POST to `/api/v1/auth/google/mobile` after platform client IDs are added.
4. If changes are needed, run the release checklist again before the next commit/push.
5. Preserve the Li-Khata palette hierarchy and reuse the canonical brand asset rather than inventing replacement logos or unrelated visual motifs.
6. For a real MSG91 smoke test, use a phone number the human owner controls and confirm before sending the OTP. The widget ID/token and server auth key live only in ignored environment variables; never copy them into Git or this document.
7. If continuing UI work, preserve the method chooser and linked-onboarding contract; do not reintroduce three active auth forms on the first screen.

### Known setup requirements

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and production `APP_URL` are required for web OAuth.
- Native clients must request an ID token for the backend's Google web client ID and send it to the mobile endpoint over HTTPS.
- MSG91 requires `MSG91_AUTH_KEY`, `MSG91_WIDGET_ID`, and `MSG91_WIDGET_TOKEN` in the deployment environment. The browser retrieves the widget ID/token at runtime from `GET /api/v1/auth/msg91`; the auth key is server-only and validates the returned access token at `POST /api/v1/auth/msg91`.
