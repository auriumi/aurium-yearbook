# Daily targets: local acceptance

Open http://localhost:3021/admin with the existing local dummy accounts.

The **Workflow role** selector now includes General Proofreader, Information QC, Photo Uploader, Photo QC and Moderator. Repeat the target/history checks for each role. Only staff assigned to that role are eligible; use Staff Assignments if a person is missing. Several roles on one person must show independent targets.

QC earns one unit for the first approval or rejection of a review. Uploaders earn one unit for the first complete pair submitted to QC. The moderator earns one unit for the first final decision on each information/photo review; the two reviews count separately. Repeated decisions/submissions must not add credit. Each workspace shows the matching role's progress; the moderator panel combines both workspaces.

1. As administrator or designated moderator, open **Daily Targets**. Select the same graduation year/term used in Information Workspace.
2. Find the demo General Proofreader. Set today's target to 20, review the preview and save. Refresh; the target should persist.
3. Change it to 30 with a reason. History should show both values, actor and time. Try saving a changed target without a reason; it should refuse.
4. Select multiple proofreaders and dates. The preview must say the target applies to each person/day. Past dates must be read-only.
5. As the demo proofreader, open Information Workspace. **My daily progress** should show the target, carried backlog, first submissions and remaining work.
6. Submit a previously unsubmitted dummy profile to QC. The first-submission count should rise once. Changing department/search filters must not change personal totals. Resubmitting after rejection must not add another credit.
7. Reach the goal and confirm that further proofreading is still allowed. Review the layout at laptop width and a narrow window; check that controls and errors are readable.

The preview uses the isolated local dummy database, not Koi's shared test database. Production was not changed. Koi's manual database setup and backend deployment must precede frontend deployment; see the backend feature's rollout document. The API resource is `/api/v1/admin/targets`, with no legacy alias. Automated checks cover arithmetic, permissions, concurrency, retry, audit protection and API contracts. The user confirmed manual visual and flow acceptance on 26 October 2026 before the API route/controller refactor; the client and backend were updated together and rechecked afterward.
