<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Aurium frontend technical notes

## Daily targets

- Keep feature code in `src/features/proofreading-targets/` and reuse the existing dashboard styling and permission conventions. `api.ts` calls `/api/v1/admin/targets`; there is no legacy alias.
- `DailyTargets.tsx` provides the manager list and role selector; `TargetEditor.tsx` handles bulk preview/save with versions and retry IDs; `TargetHistory.tsx` displays audit history. `ProofreadingProgress.tsx` is shared by Information and Photo workspaces and refreshes after actions, on focus and at the Manila date boundary.
- Administrators and designated moderators manage targets. General Proofreader, Information QC, Photo Uploader, Photo QC and Moderator each have separate targets per staff/date/graduation cycle. Only staff with that role's active assignment are eligible. Missing staff should be checked in Staff Assignments.
- The backend owns work counting, backlog and authorization. Proofreaders earn credit for the first information submission; uploaders for the first complete photo pair submitted to QC. QC and moderator credit comes from the first approval or rejection per track. Information and photo moderator decisions count separately; retries/rework never add credit.
- Targets are advisory. Reaching a goal must not block work, and department/search filters must not change personal totals. Keep request cancellation, expected versions and operation IDs for exact retries.

## Validation and manual acceptance

Automated checks: `npm run build`, `npm run lint` and `node scripts/check-review-clients.cjs`. Use the isolated local preview at `http://localhost:3021/admin` with dummy staff/graduate accounts for the following checks; repeat target/history checks for all five roles.

1. As administrator or designated moderator, open Daily Targets and select the workspace's graduation year/term and the intended workflow role. Confirm that multi-role staff have independent targets.
2. Set today's target to 20, review the preview, save and refresh. Change it to 30 with a reason; history should show both values, actor and time. A changed target without a reason must be refused.
3. Select multiple staff/dates; the preview must show a target per person/day. Past dates must remain read-only.
4. As assigned staff, check My daily progress in the relevant workspace: target, carried backlog, counted work and remaining work. The moderator panel combines information/photo decisions.
5. Perform a first qualifying action on a dummy review; credit should increase once. Retry/resubmit after rejection and verify no duplicate credit. Changing search/department filters must not alter personal totals.
6. Reach the target and verify further work remains possible. Check readable controls/errors at laptop and narrow widths.

Recorded on 26 October 2026: production build, lint and seven client tests passed; combined local backend/API acceptance passed 49 assertions. The user confirmed the expanded role selector and flow before the route-only refactor; API/client checks were rerun afterward. Tests used isolated local dummy data, **not Koi's shared test database or production**.

Koi must confirm and prepare the intended database manually, then deploy the backend before this frontend. Follow the backend repository's `AGENTS.md` and `scripts/database/daily-targets-manual-setup.sql` for schema prerequisites and safeguards. Shared-database validation remains outstanding. Keep CI/deployment configuration unchanged.
