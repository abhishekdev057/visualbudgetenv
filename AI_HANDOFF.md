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
**Status:** Ready for a real-provider smoke test and release.

### Completed in this handoff

- Live Neon schema migration and server transaction-capable database driver.
- Production audit hardening: exact money validation, ownership controls, pagination, safe destructive dialogs, stronger account deletion, server-driven insights, responsive UI polish, and acceptance coverage.
- Google OAuth foundation: provider identity table, secure web authorization-code callback, verified native ID-token exchange endpoint, and Google sign-in UI.
- Verification completed: database migration, unit tests, TypeScript, lint, production build, mobile/desktop visual QA, and the two-user API acceptance suite.

### Next agent actions

1. Configure a rotated Google secret only in `.env`/Vercel environment variables; do not commit it.
2. In Google Cloud, register the exact callback: `APP_URL/api/v1/auth/google/callback`.
3. Test a real Google web sign-in and a native ID-token POST to `/api/v1/auth/google/mobile` after platform client IDs are added.
4. If changes are needed, run the release checklist again before the next commit/push.

### Known setup requirements

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and production `APP_URL` are required for web OAuth.
- Native clients must request an ID token for the backend's Google web client ID and send it to the mobile endpoint over HTTPS.
