# Prototype parity validation — October 3, 2026

Validation continued October 4, 2026.

Reference: https://aurium-review-prototype.aljuncursiga09351522.chatgpt.site/

This report supersedes the October 2 behavior notes. Ordinary QC/moderator returns may be rechecked and resubmitted without inventing an edit. Completed reviews accept comments without unlocking approved data. IT-approved reopening still requires an actual maker correction.

## What changed

| Existing feature PR | Change |
| --- | --- |
| UI #189 | Mobile sidebar keeps the logout confirmation open; only a click directly on the backdrop dismisses the menu. |
| API #122 / UI #190 | Independent academic filters and safe pagination after a verification empties the current page. Batch verification requires no reference note. |
| API #123 / UI #191 | Separate QC-approved and moderator-pending counts; full profile includes the photo status and an enlarged read-only registration reference. |
| UI #192 / #194 | Display previous live values beside proposed edits; changed-field count matches the highlighted fields. |
| API #128 / UI #193 | Rechecked returned information can go back to QC unchanged; initial unchanged snapshots and pagination remain supported. |
| API #131 / UI #196 | Comments before the first draft and after completion; prominent return reason, edited-revision activity, and unsaved-comment protection. |
| API #132 / UI #198 | Rechecked photo pairs can return to QC without duplicate uploads; independent filters, queue pagination and selected-photo discard protection. |
| API #134 / UI #199 | Uploader/QC/moderator comments throughout the workflow; upload activity, persistent rejection reason, photo-session times and unsaved-comment protection. |
| API #136 / UI #201 | Correction requests anchor to the approved event, so subsequent comments do not invalidate them. Stale decisions, self-approval and unchanged reopened submissions remain blocked. |

Changes are committed as Nakauli to the existing feature branches. Main is not an integration target. Frontend: `codex/review-integration-sep30-ui`; API: `codex/review-integration-oct2-api`. `Aurium Local Review.code-workspace` opens the combined frontend and isolated API harness together.

## Checks completed

- Backend TypeScript compilation and 41 contract/controller tests passed.
- The combined frontend production build, including TypeScript, passed before the final mobile-backdrop correction. TypeScript and targeted ESLint passed again after that correction. Targeted ESLint for information, photos, RAC and corrections passed.
- Three additive migrations applied successfully only to localhost: initial information comment context, initial photo comment context, and correction lock anchor. Existing rows were not deleted or rewritten.
- Full HTTP journeys passed for both information and photos: initial comments, QC rejection, unchanged maker recheck, moderator rejection directly to maker, unchanged resubmission through QC, final approval/lock, completed comments, IT request, intervening comment, and IT reopening. Reopened records still reject submission until a real maker change occurs.
- Anonymous, wrong-role, unassigned, untrusted-origin, stale-context and duplicate-operation checks passed. Rejections require a reason. A comment cannot satisfy the IT maker-change requirement.
- Both sealed photos and the registration reference were read successfully from the loopback object store. Upload history includes actor, type and time without raw storage keys. Ordinary photo rechecks created no duplicate assets.
- The HTTP journey compared all pre-existing Student, StudentDetail, StudentAuth and legacy StudentImage rows before/after; they remained identical. Test fixtures were added separately and preserved.
- Twenty direct database constraint probes passed inside a rolled-back transaction: decision events cannot omit revision/pair context; incorrect, old or nonlocked approval anchors are rejected; immutable history remains protected. No probe rows remained.
- Independent program/major/no-major filters for RAC, information and photos matched scoped database results. An out-of-scope program returned no records.
- A new fictional graduate proved queue separation with nonzero data: QC approval gave Approved by QC = 1 / Submitted to Moderator = 0; forwarding gave 0 / 1, with correct rows.
- Browser confirmed that the registration reference opens in an enlarged read-only dialog.
- Browser checked normal development login, first-name ordering, status-only overview, full focused profile, edited-revision activity and unsaved information comment confirmation. Canceling dismissal retained the text.
- Browser verified RAC pagination with 26 fictional graduates: confirming the last record on page 2 returned to Page 1 of 1. Selecting the remaining 25 confirmed them in one batch without a reference note; Verified showed 26.
- Browser verified information pagination with those 26 graduates: Pagination26 was submitted unchanged through its confirmation dialog, leaving Pending = 25, Submitted to QC = 1 and Page 1 of 1. Andrea's focused profile displayed proposed nickname `Drea 5`, previous value `Not provided`, exactly one changed-field highlight and `Photos: Pending`.
- Read-only GitHub checks confirmed all 16 updated feature PRs remain open and unmerged, with remote heads matching their local branches and expected feature bases. Local and remote main stayed at API `302d2da` and frontend `45c9f71`.

Local-only scripts are in `aurium-local-test-api/scripts`: `smoke-prototype-oct3.cjs`, `smoke-prototype-db-guards.cjs`, `smoke-prototype-filters.cjs`, and `seed-pagination-demo.cjs`. They guard against remote databases. The journey respects the existing API rate limit and retries after its window rather than disabling it.

## Try it locally

Open http://localhost:3020/admin. Dummy account password: `ReviewDemo-2026!`.

- `proofreader.demo@aurium.invalid`: scoped RAC verification and information editing.
- `infoqc.demo@aurium.invalid`: information QC.
- `photos.demo@aurium.invalid`: photo uploads.
- `photoqc.demo@aurium.invalid`: photo QC.
- `moderator.demo@aurium.invalid`: final review.
- `it.demo@aurium.invalid`: correction requests.

Andrea is an editable-information example with proposed nickname `Drea 5`. Adrian has a completed photo pair and reference. Queuecheck Prototype (99212442) awaits moderator information approval. Parity Prototype (99834121) retains both completed histories and is now reopened by IT; an actual maker change is required. Pagination01–26 are RAC-verified fictional pagination fixtures: Pagination26 now awaits information QC, while Pagination01–25 remain pending information review.

## Browser checks still pending

After restarting the local services on October 4, the browser tool blocked access to the internal connection-error page. The user was asked to reload the normal localhost page. The final mobile logout and photo draft/discard interactions still need a browser recheck; the code and API validations above are complete.

## Release limits

These results demonstrate local workflow behavior, not production certification. The local PGlite server uses one connection, and the loopback object store does not emulate real R2 authorization/CORS. Representative PostgreSQL concurrency/load tests, a restore rehearsal, isolated real R2 validation, remaining legacy-route acceptance and dependency findings still require review before rollout. The legacy Graduate Masterlist was observed listing an out-of-assignment fictional graduate for the scoped proofreader. Its baseline MEMBER permission allows global list and direct lookup access, including student details and reference-photo URLs; review assignments do not constrain it. This is a release blocker if assignments must restrict all graduate data access. The smallest restriction belongs in API #120 and UI #189: reserve the legacy masterlist for Administrator/Moderator and route Members to their assigned review workspaces. That would remove existing Member access; retaining Member access requires explicit scoping for lists, counts, direct lookup and photo signing, with no global fallback after assignment revocation. This authorization change has not been implemented. The new RAC, information and photo APIs passed the assignment-scope checks above. No production database, production bucket or main branch was changed.

The focused dialogs scroll on smaller screens to keep all fields accessible. Automatic Excel/CSV RAC reconciliation is a future addition from the meeting notes, not an action implemented by the approved manual-verification prototype.
