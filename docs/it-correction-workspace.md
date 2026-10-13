# IT correction workspace

The information and photo focused views show the latest correction request beside a completed record. An assigned reviewer can submit a required reason. The approved record remains locked while IT decides. If IT declines, the reason stays visible and the reviewer may make a new request. If IT approves, the assigned maker receives a new draft, must change the information or photo pair, and submits it through QC and the moderator again.

Staff assigned `IT_CORRECTION` receive an IT Corrections tab with a paginated pending queue and prior requests. A requester's own IT decision controls are hidden; the API enforces that separation. Decisions use the current review version and a retry key, and errors keep the form open. Staff without the capability do not see the tab; the backend independently enforces authorization.

This UI depends on the API correction PR. No production database or real graduate account was used for the local TypeScript, lint, and build checks. Before release, exercise pending status after refresh, stale and unauthorized decisions, approval/rejection, maker correction, full reapproval, and both desktop and mobile layouts against an isolated database.
