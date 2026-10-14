# Frontend build recovery

The October 14 VPS build compiled the application but failed TypeScript checks because `.next/dev/types/validator.ts` still imported the removed `/schedule` page and `/api/status` route. The checkout's generated development types survived earlier runs. A fresh CI checkout did not contain those stale files.

Next.js 16.3.8 keeps `.next/dev` during production build cleanup and its default TypeScript CLI checks every file selected by the configured tsconfig. The fix uses `tsconfig.build.json` only for the production build. It inherits the application's strict options and excludes development build artifacts; application code and current production route types are still checked. Development keeps its existing config. No generated files or graduate data are deleted, and no missing route is replaced with a placeholder.

The frontend deployment script now stops when a pull, install or build fails, before pruning dependencies or restarting PM2. It installs build-time dependencies explicitly and refuses a non-fast-forward pull. This prevents a failed build from being followed by a restart, but the existing in-place build is still not an atomic deployment or automatic rollback.

## Koi's recovery steps

1. Review and merge this frontend fix into main. It is based on the frontend review merge `2564dcd`. No backend release, Prisma command or migration is required for this fix.
2. Run the existing manual frontend deployment workflow on main. If operating directly on the VPS instead, confirm the checkout is the expected frontend repository with no uncommitted changes, then run the sequence below. Use the existing VPS environment configuration; do not copy local dummy configuration.

   ```sh
   set -e
   cd ~/web/aurium-yearbook
   git status --short
   git pull --ff-only
   npm ci --include=dev
   npm run build
   npm prune --omit=dev
   pm2 restart aurium-frontend
   ```

   If any command fails, stop and inspect it. Do not restart PM2 manually after a failed build. The development cache does not need to be removed for the fixed production build.

3. Check `pm2 status` and `pm2 logs aurium-frontend --lines 50 --nostream`. Confirm the process stays online rather than entering another restart loop. Open the configured HTTPS site and check sign-in, dashboard, and the new review workspaces against the existing backend.

The stale-route regression in CI deliberately leaves both missing imports in `.next/dev/types` while running the real production build. A separate production-config check verifies that application type errors still fail and current generated production types remain in scope.

References: [Next.js custom TypeScript configuration](https://nextjs.org/docs/app/api-reference/config/typescript#custom-tsconfig-path). The exact CLI checker and cache-cleaning behavior were also checked in the installed Next.js 16.3.8 documentation and source.
