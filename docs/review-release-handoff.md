# Review v1 frontend handoff

The complete frontend is reviewed in [PR #210](https://github.com/auriumi/aurium-yearbook/pull/210), paired with the complete [API PR #148](https://github.com/auriumi/aurium-api/pull/148). This replaces the partial frontend sequence #207–210. Keep the old branches and discussions; retire superseded PRs only after verifying their commits are included.

The candidate includes RAC verification by General Proofreaders, information editing/QC/moderator decisions, photo-pair upload/review, corrections, scoped staff assignments and approved Masterlist detail. All new clients use canonical resource paths under `/api/v1/admin`; the matching API retains the original guarded review aliases. Existing non-review endpoints are unchanged.

Masterlist list failures now have an accessible error state and explicit Retry action instead of showing an empty result. Rate-limit errors show wait guidance where available. No automatic retry loop is introduced, and obsolete requests still abort.

Validation commands: `npx tsc --noEmit`, `npm run lint`, `node scripts/check-information-workspace.cjs`, `node --test scripts/check-review-clients.cjs`, `npm run build`. The added checks exercise actual API client functions and hook failure/retry/abort transitions without extra production dependencies; they are not a visual browser test.

Review both complete candidates together. Merge the API first with automatic deployment paused, then this frontend; deploy only after Koi completes manual database migration and staging checks. The existing frontend deployment uses `git pull`, so hold the approved main revision stable and verify the deployed SHA. Do not point the new frontend at an older API without canonical routes.

The [backend handoff](https://github.com/auriumi/aurium-api/blob/codex/v1-staff-integration-api/docs/review-release-handoff.md) contains the migration, storage, regression, performance and recovery requirements. No automatic migration/reset is added. Automatic Excel/CSV reconciliation and expanded department/review exports remain outside the implemented manual review scope.
