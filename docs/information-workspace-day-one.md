# Information workspace — day one

Branch: `codex/information-workspace-day-one`, based on local `main` at `45c9f71`.

Today I built the information list inside the existing admin dashboard. The screen uses the confirmed prototype as reference and keeps the dashboard's amber and stone styling.

Done today:

- List of Graduates and the agreed information-status filters.
- Department, program and major filters, including No major.
- Search by graduate name or student number.
- First-name alphabetical sorting.
- Filtered Pending, Returned for correction and Completed counts.
- Read-only rows, mobile cards, empty results and clear-filter controls.
- Fictional sample records, separate from the list component and its data model.

Open the application in development mode, sign in through the existing admin login, and choose **Information Workspace** from the sidebar as an Administrator or Moderator. The sample workspace appears automatically in development. It is hidden in production unless `NEXT_PUBLIC_INFORMATION_WORKSPACE_PREVIEW=true` is explicitly set before building. This temporary visibility uses existing roles; the new General Proofreader permission model is still to be agreed with Koi.

The list component accepts `GraduateInformationRow[]`. Its sample adapter makes no API calls and cannot modify student records. Existing dashboard services still behave as before.

## Rules already reflected in the list

- Department changes clear program and major; program changes clear major.
- Academic options depend on the parent selections, not the current search or status.
- Search ignores case and repeated whitespace. It matches the displayed full name or student number.
- Counts use the same search/academic scope, before applying the selected status.
- Overview includes unverified and not-listed records and displays their verification outcome.
- All working queues require RAC/SAO verification. Registration approval is not treated as information-review approval.
- Submitted to Moderator remains visible in the overview; it is not counted as Approved by QC after forwarding, matching the reference prototype.

## To align with Koi

These are frontend requirements to discuss, not a finalized backend contract:

- Stable student number, separate name parts, department, course/program and nullable major.
- Separate RAC/SAO verification and information-review statuses.
- Mapping of backend statuses to the agreed display labels; no numeric registration-status reuse.
- Whether the API will return a complete scoped list or paginated results. Server pagination will require totals, status counts and academic filter options from the server rather than counting one page.
- Assignment scope and the new General Proofreader permission before replacing the sample adapter.

## Next session

Build the focused information view, editing form and changed-field highlights. Verification actions, submission/rejection/locking, photo changes, backend integration and database changes are not part of today's work.

## Checks

- `node scripts/check-information-workspace.cjs`
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`
- Browser check of the isolated list component: academic filter resets, scoped counts, Pending, empty results, clearing filters, desktop table and mobile cards passed. The live-backend dashboard/login path was not exercised.

No commit, push or deployment is part of this task. The confirmed presentation branch and hosted reference remain unchanged.
