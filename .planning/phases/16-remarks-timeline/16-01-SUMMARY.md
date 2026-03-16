---
phase: 16-remarks-timeline
plan: 01
subsystem: database, api, ui
tags: [remarks, timeline, activity-log, property-remarks, drizzle]

requires:
  - phase: 12-property-detail-page
    provides: Property detail page with tabbed layout
provides:
  - property_remarks table with CRUD API
  - Remarks timeline tab on property detail page
  - Inline remark adding (no modal)
affects: [17-sale-tracking]

tech-stack:
  added: []
  patterns: [inline form for quick data entry, timeline UI with border-l connector]

key-files:
  created: [src/app/api/properties/[id]/remarks/route.ts]
  modified: [src/lib/db/schema.ts, src/app/(app)/properties/[id]/page.tsx]

key-decisions:
  - "Inline form (not modal) for low-friction remark adding"
  - "Separate table from notes field — notes for quick info, remarks for growing timeline"

issues-created: []
duration: 3min
completed: 2026-03-16
---

# Phase 16 Plan 1: Remarks Timeline Summary

**New property_remarks table with CRUD API and inline timeline tab on property detail page for accumulating remarks over time**

## Performance
- **Duration:** 3 min
- **Started:** 2026-03-16T04:23:29Z
- **Completed:** 2026-03-16T04:26:51Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- New `property_remarks` table with cascade delete, auth-protected CRUD API
- 5th tab "Remarks" on property detail page with count badge
- Inline textarea + button for quick remark adding
- Timeline view with border-l connector, timestamps, delete buttons
- Empty state with MessageSquare icon

## Task Commits
1. **Task 1: Schema + API routes** - `9529d0b` (feat)
2. **Task 2: Remarks timeline UI** - `05d9ed4` (feat)

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Remarks timeline complete
- Ready for Phase 17: Sale Tracking

---
*Phase: 16-remarks-timeline*
*Completed: 2026-03-16*
