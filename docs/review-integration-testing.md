# Combined review test branch — 30 September 2026

The matching branches are `codex/review-integration-sep30-api` in `aurium-api` and `codex/review-integration-sep30-ui` in `aurium-yearbook`. They combine the small draft PRs for inspection and testing. Neither branch is `main`, and neither is a production deployment.

## What is in this checkout

- Manual RAC/SAO checking with individual and visible-row bulk verification; scoped staff assignments.
- Complete graduate information view, proofreader-only saved revisions, QC return/approval, moderator return/lock, and revision-linked comments.
- Versioned graduation/theme uploads with the registration photo as a read-only reference, QC/moderator review, pair-linked comments, and a full-size viewer.
- IT correction requests against a locked information revision or photo pair. IT approval reopens a new draft; it never changes the old locked record. The maker must change the draft and pass QC and moderator review again.
- The legacy Image Management list points verified graduates to Photo Workspace and omits them from its old missing-image filters. It does not copy approved pairs to `StudentImage`.
- Pull-request build checks in both repositories. Existing production deploy workflows are unchanged.
- Next.js security maintenance is separate from review features. The October 2 audit identified GHSA-vcvr-r3jv-pc5j against 16.3.3; the focused patch updates Next.js to 16.3.6. Its production audit has two remaining moderate ExcelJS/UUID findings and no critical finding.

## Local checks completed

On the combined branches: API Prisma schema validation and TypeScript build pass; 11 focused contract tests pass. UI type checking, project lint (14 existing unused-symbol warnings, zero errors), the information-workspace check script, and the production Next.js build pass. These checks do not exercise PostgreSQL transactions, R2 uploads, authorization with real sessions, or browser usability.

## Test environment needed before a pilot

**October 2 local update:** The running API test checkout includes the combined features and correction fix #144. A persistent local PGlite database, fictional role accounts and loopback object store now support the demo at `http://localhost:3020/admin`. Core information/photo return and approval journeys, IT reopening/reapproval, several authorization/origin/stale/retry checks, and browser proofreader edit/save passed. Migration baseline rows and historical photo pairs were retained. See `C:/Users/ACER/AURIUM/docs/planning/local-review-test-2026-10-02.md` for accounts and exact limits. This does not replace a restored PostgreSQL staging database, real isolated R2 or concurrency/performance checks. Local environment adapters are not in the feature PRs.

Koi or the environment owner should identify an isolated PostgreSQL database with the existing Aurium schema baseline, a backup/restore owner, an isolated R2 account/bucket with browser PUT CORS, and fictional graduate records. Set the API's `R2_BUCKET` for that bucket along with separate R2 credentials. Provide test accounts for RAC checker, information proofreader, information QC, photo uploader, photo QC, designated final moderator, IT correction reviewer, and an unrelated staff account. Use separate accounts where a same-user prohibition is being tested. Configure the official RAC source-version label for this environment. Keep credentials in the server's secret store, not in this document or a PR.

First compare the test database's actual schema and `_prisma_migrations` history with this branch. The current API `main` tracks no Prisma migration files, while this branch introduces nine review migrations, so agree the baseline with Koi before using `migrate deploy`. Restore a backup into another isolated database, then apply the additive migrations in timestamp order and compare existing record counts and representative records. Do not run `migrate reset`, `db push --accept-data-loss`, or a migration against the live graduate database for this test. Verify the test R2 credentials cannot access production objects.

For a local browser session, run the test UI at `http://localhost:3000` with `NEXT_PUBLIC_LOCAL_URL=http://localhost:4000`; the API's development origin default already matches. For a hosted test UI, set the API's `FRONTEND_ORIGIN` to that exact HTTPS UI origin and point `NEXT_PUBLIC_LOCAL_URL` at the test API. Start both services only after their environment variables reference the isolated database and storage. Do not copy a production `.env` file into these checkouts.

## Acceptance journey

1. Assign each role its intended academic scope. Confirm an unrelated account cannot list, open, upload, comment, decide, or request a correction on an out-of-scope graduate.
2. Check a fictional graduate against the RAC/SAO list individually and in a mixed visible-row batch. Verify status counts, first-name sorting, filtering, refresh, audit attribution, retry behavior, and a Not on list → Verified correction.
3. Save an information draft. Verify changed-field highlights and that live `Student`/`StudentDetail` values stay unchanged. Submit to QC, reject with a mandatory reason, edit again, approve, forward, return from moderator directly to proofreader, then resubmit through QC and finally approve/lock. Confirm only the final approved values publish.
4. Upload graduation and theme images, compare both with the reference photo, refresh signed URLs, submit the exact pair, reject with a reason, replace the rejected photo, and complete QC/moderator approval. Verify old assets and pair history remain. Check that legacy image routes cannot change the verified graduate and that the old missing-image filter does not mislabel them. Race RAC verification against a legacy image save and against a legacy image decision for the same fictional graduate: whichever finishes first must leave the review-managed record protected from subsequent legacy writes.
5. Add information and photo comments at permitted review stages. Check their exact revision/pair attribution and that neither changes approved content. Confirm stale versions, duplicated operation IDs, and concurrent decisions return a conflict without duplicate events.
6. Request an IT correction after lock. Reject one request and verify the record stays locked. Approve another with a different IT account; verify a distinct draft is created while the old approval remains. Require a real maker change and a complete QC/moderator pass before relocking. Check self-approval, scope, and stale-request denials.
7. Smoke-test existing registration, login, booking, attendance, student reference photo, old image reads, and exports against the isolated environment. Inspect desktop and mobile focus, keyboard operation, loading/error states, and long profiles.

Record each failure with the role, fictional record ID, exact request/action, expected result, actual result, and the responsible feature PR. Performance checks should use representative test volume and capture list/count query plans, request size, and p50/p95 latency before tuning indexes or pagination.

## Decisions and release gates still open

- Local fictional accounts, migration rehearsal and core HTTP journeys now exist. A restored PostgreSQL staging database, real isolated R2 bucket, backup/restore evidence, concurrency/performance checks and the remaining browser/legacy acceptance checks are still outstanding.
- The publication/export consumer for newly locked photo pairs needs a reviewed mapping. `StudentImage` is year-only while reviewed pairs are year-and-term aware, so this branch deliberately preserves the two stores instead of overwriting historical rows.
- Koi must review the feature PRs, migration order, backup/restore evidence, and any dependency findings. A green build is not approval to merge or deploy.
- Compatible dependency updates and removal of unused web Prisma packages reduce the last production audits to four API high findings (Prisma toolchain path) and two UI moderate findings (ExcelJS/UUID). Review reachability and fixes before production rollout; do not force a Prisma major downgrade or ExcelJS major downgrade into the review feature chain.
