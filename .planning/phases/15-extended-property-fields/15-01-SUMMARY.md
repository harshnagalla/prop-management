---
phase: 15-extended-property-fields
plan: 01
subsystem: database, ui
tags: [schema-migration, registration, ownership, stamp-duty, drizzle]

requires:
  - phase: 12-property-detail-page
    provides: Property detail page with tabbed layout
provides:
  - 5 new property columns (dastavejNo, registrationDate, stampDuty, registrationCharges, ownership)
  - Registration & Legal form section in PropertyForm
  - Total cost calculation (computed, not stored)
  - Ownership display on cards and detail page
affects: [16-remarks-timeline, 17-sale-tracking]

tech-stack:
  added: []
  patterns: [computed total cost on display, free-form ownership text field]

key-files:
  created: []
  modified: [src/lib/db/schema.ts, src/app/(app)/properties/page.tsx, src/app/(app)/properties/[id]/page.tsx]

key-decisions:
  - "Total cost computed on display (not stored) to avoid data inconsistency"
  - "Ownership as free-form text (not structured table) — informal varied descriptions"

patterns-established:
  - "Computed fields displayed but not stored in DB"

issues-created: []

duration: 3min
completed: 2026-03-16
---

# Phase 15 Plan 1: Extended Property Fields Summary

**Added 5 new property columns (dastavej no, registration date, stamp duty, registration charges, ownership) with computed total cost across all UI surfaces**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-16T03:54:21Z
- **Completed:** 2026-03-16T03:57:11Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added 5 new nullable columns to properties schema matching the family spreadsheet
- PropertyForm has new "Registration & Legal" section with all fields
- Property cards show ownership badge
- Property detail page shows stamp duty, registration charges, total cost (computed), dastavej no, registration date, and ownership
- Database updated via `db:push` — zero downtime

## Task Commits

1. **Task 1: Schema migration + db:push** - `792b575` (feat)
2. **Task 2: UI updates across all surfaces** - `6ed15d2` (feat)

## Files Created/Modified
- `src/lib/db/schema.ts` - 5 new columns on properties table
- `src/app/(app)/properties/page.tsx` - Registration & Legal form section, ownership badge on cards
- `src/app/(app)/properties/[id]/page.tsx` - Ownership in header, registration stat cards, total cost

## Decisions Made
- Total cost computed on display as purchasePrice + stampDuty + registrationCharges (not stored — avoids sync issues)
- Ownership as free-form text field (not structured) — the spreadsheet has varied formats like "50% Siva, 50% NMP" and "100% Siva"

## Deviations from Plan
None — plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- Schema extended with all spreadsheet columns
- Ready for Phase 16: Remarks Timeline

---
*Phase: 15-extended-property-fields*
*Completed: 2026-03-16*
