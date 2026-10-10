# Approved prototype workflow review — October 2

Reference: https://aurium-review-prototype.aljuncursiga09351522.chatgpt.site/

The combined app runs at http://localhost:3020/admin. Main is not the integration target. Open `Aurium Local Review.code-workspace` to inspect the frontend and local API together.

## Fixes kept in existing features

| Existing PR | Fix |
| --- | --- |
| API #128 — information submission | A verified, correct profile can be submitted without inventing an edit. Submission creates one immutable snapshot; retries return the same result. Invalid required information, stale versions and wrong roles remain blocked. |
| UI #193 — information submission | Submit the displayed profile even without an earlier draft. Refresh queue counts and rows after save/submission. |
| UI #194 — information QC | Label incoming QC work Pending and restore Submitted to Moderator tracking. No moderator-return queue for QC. |
| API #132 — photo foundation | Overview includes all graduates in the assigned cycle/scope, including those not yet RAC-verified. Action queues remain verified-only. Keep mandatory photo-pair submission and use the prototype's 5 MB limit. |
| UI #198 — photo review | Role-specific uploader/QC/moderator queues, status-only overview, correct Pending stage per reviewer, 5 MB upload limit, workspace title and zero-count labels. |

Integration branches: API `codex/review-integration-oct2-api`; frontend `codex/review-integration-sep30-ui`. Local API harness: `codex/review-local-test-api`. The local adapters, fictional seeds and local database baseline are not pushed to production feature PRs.

## Workflow comparison

- RAC/SAO verification supports selecting graduates and confirming a batch; verification does not require a reference note. Verified graduates enter both review tracks. The fictional General Proofreader now has a scoped RAC assignment as well, matching Cabs in the prototype. Production assignments are unchanged.
- Graduate overviews are status-only. Work happens through the action queues and a focused graduate dialog. Lists sort by first name and offer cycle, department, program, major and search filters.
- Information editing belongs to the assigned proofreader; QC and moderator decisions do not edit profile fields. Emails remain read-only, per the later agreed requirement.
- Information and photos both follow maker → QC → moderator. A moderator rejection goes directly to the maker, and the corrected record must pass QC again. Rejections require comments.
- Photos show the registration reference separately from graduation/theme assets; both submitted photos are required. Earlier uploaded assets and pair revisions are retained.
- Final approval locks the track. Information changes publish to Student/StudentDetail only at final moderator approval. IT-approved reopening preserves history and requires a new maker correction followed by QC/moderator review.
- A correct initial information record can now finish this same approval flow without changing its live values.

The prototype's instant in-memory changes are not copied into production behavior. Returned records still require a newer correction; IT reopening cannot skip this requirement. Full records use scrollable focused dialogs when the screen is too small to show all fields accessibly. CSV/Excel automatic RAC reconciliation remains future work, as described in the meeting notes, rather than a behavior of the approved manual-verification prototype.

## Validation

- API TypeScript build and all 13 review contract tests passed.
- Frontend production build passed. Final follow-up changes passed TypeScript and targeted ESLint checks.
- Applied only the new `20261002120000_information_review_snapshot` migration to the existing localhost test database. It permits an unchanged review snapshot; it does not delete rows, rewrite existing revisions, or modify Student/StudentDetail.
- New HTTP acceptance test completed Bea's RAC verification → unchanged snapshot → QC approval/forward → final moderator approval. Exactly one revision was created despite retrying submission. The complete Student and StudentDetail rows were identical before and after the journey.
- Verified photo overview scope, first-name ordering, exclusion of unverified graduates from Pending, and rejection of submission without a photo pair.
- Re-ran the local authorization/stale-write checks: anonymous, unassigned, wrong-role, untrusted-origin, email and locked-record edits were denied. Idempotent operations did not duplicate revisions/comments. Five fictional students, five details, five auth records, one legacy image, six photo assets and six pair revisions remained.
- Earlier full information/photo return and IT-reopening journeys remain in the audit history. Re-runs recognized their completed state; they did not recreate those entire journeys.
- Browser login works through the normal development CAPTCHA flow. Photo QC shows Pending and Submitted to Moderator, no Rejected by Moderator tab, and no profile buttons in List of Graduates.

## Test accounts and remaining release checks

Use `proofreader.demo@aurium.invalid`, `infoqc.demo@aurium.invalid`, `photos.demo@aurium.invalid`, `photoqc.demo@aurium.invalid`, `moderator.demo@aurium.invalid` or `it.demo@aurium.invalid`; password for these dummy accounts: `ReviewDemo-2026!`.

Bea is now a completed unchanged-information example. Andrea remains editable. Adrian remains the completed photo/reference example. These tests use fictional records only.

This is local workflow validation, not production certification. Real isolated R2 behavior, representative-volume PostgreSQL/concurrency testing, restore rehearsals, legacy-route acceptance and remaining dependency findings still need review before any release. Keep main and live data separate from this test environment.
