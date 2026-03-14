---
phase: 04-deployment-pwa
plan: 01
subsystem: infra, pwa
tags: [vercel, serwist, service-worker, pwa, deployment]

requires:
  - phase: 03-ui-polish
    provides: Polished UI with toast notifications
provides:
  - Live Vercel production deployment
  - PWA service worker with offline caching
  - Installable progressive web app
affects: []

tech-stack:
  added: ["@serwist/next", "serwist"]
  patterns: [serwist service worker with defaultCache, Vercel CLI deployment]

key-files:
  created: [src/app/sw.ts]
  modified: [next.config.ts, tsconfig.json, .gitignore, package.json]

key-decisions:
  - "Used @serwist/next (not next-pwa) for Next.js 15 PWA support"
  - "Updated Next.js from 15.1.3 to 15.5.12 for Vercel CVE compliance"
  - "Service worker disabled in development mode"

patterns-established:
  - "Vercel CLI for deployments with env vars piped via echo"

issues-created: []

duration: 7min
completed: 2026-03-15
---

# Phase 4 Plan 1: Deployment & PWA Summary

**Live Vercel deployment at prop-management-one.vercel.app with @serwist/next PWA service worker and offline caching**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-14T17:48:37Z
- **Completed:** 2026-03-14T17:55:37Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- PWA service worker with @serwist/next — precaching + defaultCache runtime caching
- App deployed to Vercel production: https://prop-management-one.vercel.app
- All 5 environment variables configured in Vercel (DATABASE_URL, AUTH_SECRET, AUTH_TRUST_HOST, GOOGLE_AI_API_KEY, NEXT_PUBLIC_APP_URL)
- PWA installable on mobile devices
- Service worker registered on production serving cached assets

## Task Commits

1. **Task 1: Add PWA service worker with @serwist/next** - `b4c0950` (feat)
2. **Task 2: Deploy to Vercel** - `a5af2d5` (feat)

## Files Created/Modified

- `src/app/sw.ts` - New: Service worker with precaching and runtime caching
- `next.config.ts` - Wrapped with withSerwist, disabled in dev
- `tsconfig.json` - Added webworker lib for ServiceWorkerGlobalScope
- `.gitignore` - Added public/sw.js build artifact
- `package.json` - Added @serwist/next, serwist, updated Next.js to 15.5.12
- `package-lock.json` - Updated lockfile

## Decisions Made

- Used @serwist/next instead of next-pwa (serwist is the modern maintained fork)
- Updated Next.js from 15.1.3 to 15.5.12 (Vercel blocks deployment of 15.1.3 due to CVE-2025-66478)
- Pinned to Next.js 15.x (not 16) because @serwist/next uses webpack plugin incompatible with Turbopack default in Next.js 16

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Next.js 15.1.3 blocked by Vercel CVE policy**
- **Found during:** Task 2 (Vercel deployment)
- **Issue:** Vercel refuses to deploy Next.js 15.1.3 due to CVE-2025-66478
- **Fix:** Updated to Next.js 15.5.12 (latest 15.x)
- **Files modified:** package.json, package-lock.json
- **Verification:** Vercel build and deployment succeeded
- **Committed in:** a5af2d5

**2. [Rule 3 - Blocking] Next.js 16 incompatible with @serwist/next webpack plugin**
- **Found during:** Task 2 (initially tried `next@latest` which installed 16.x)
- **Issue:** Next.js 16 defaults to Turbopack, @serwist/next requires webpack
- **Fix:** Pinned to `next@15` (15.5.12) instead of `next@latest`
- **Verification:** Build passes, service worker generated
- **Committed in:** a5af2d5

**3. [Rule 3 - Blocking] TypeScript missing ServiceWorkerGlobalScope type**
- **Found during:** Task 1 (service worker creation)
- **Issue:** sw.ts uses `ServiceWorkerGlobalScope` which requires `webworker` lib
- **Fix:** Added `"webworker"` to tsconfig.json lib array
- **Verification:** Build passes without type errors
- **Committed in:** b4c0950

---

**Total deviations:** 3 auto-fixed (all blocking), 0 deferred
**Impact on plan:** All fixes necessary for deployment. No scope creep.

## Issues Encountered

None beyond the auto-fixed blockers above.

## Next Phase Readiness

- All 4 phases complete — milestone done
- App live at https://prop-management-one.vercel.app
- PWA installable and caching assets
- No blockers

---
*Phase: 04-deployment-pwa*
*Completed: 2026-03-15*
