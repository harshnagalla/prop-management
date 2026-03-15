---
phase: 06-page-redesign
plan: 02
subsystem: ui
tags: [button, input, card, badge, bills, income, documents, import, design-system-migration]

requires:
  - phase: 05-design-system
    provides: Button, Input, Card, Badge component primitives and design tokens
  - phase: 06-page-redesign
    provides: Redesign pattern established in Plan 06-01
provides:
  - Bills page fully migrated (forms, table in Card, Badge for Paid/Unpaid)
  - Income page fully migrated (forms, month groups in Card, Badge for Received/Pending)
  - Documents page fully migrated (cards, upload form, filter)
  - Import page fully migrated (upload zone, review cards, action buttons)
  - All 6 app pages now use design system components consistently
affects: [07-mobile-responsiveness]

tech-stack:
  added: []
  patterns: [asChild-anchor-pattern-for-download-button]

key-files:
  created: []
  modified: [src/app/(app)/bills/page.tsx, src/app/(app)/income/page.tsx, src/app/(app)/documents/page.tsx, src/app/(app)/import/page.tsx]

key-decisions:
  - "Badge variant mapping: Paid=success, Unpaid=destructive, Received=success, Pending=warning"
  - "Button asChild with anchor for document download links"

patterns-established:
  - "Badge variant mapping for payment status (success/destructive for paid/unpaid)"
  - "Card + CardHeader + CardTitle for grouped data (income month groups)"
  - "Button asChild pattern for anchor-based downloads"

issues-created: []

duration: 174min
completed: 2026-03-15
---

# Phase 6 Plan 2: Bills, Income, Documents & Import Redesign Summary

**Bills, income, documents, and import pages migrated to design system components completing full visual consistency across all 6 app pages**

## Performance

- **Duration:** 174 min
- **Started:** 2026-03-15T09:06:25Z
- **Completed:** 2026-03-15T12:00:47Z
- **Tasks:** 3 (2 auto + 1 checkpoint)
- **Files modified:** 4

## Accomplishments

- Bills page: BillForm uses Input/Button, table wrapped in Card, Paid/Unpaid uses Badge (success/destructive), Scan/Add buttons use Button
- Income page: IncomeForm uses Input/Button, month groups wrapped in Card+CardHeader, Received/Pending uses Badge (success/warning)
- Documents page: Document cards use Card, upload form uses Input/Button, filter select styled consistently, download uses Button asChild with anchor
- Import page: Upload zone refined with design tokens, review cards use Card, action buttons use Button (outline/default)
- All 6 app pages now share consistent visual language

## Task Commits

1. **Task 1: Redesign bills and income pages** - `1ca69e6` (feat)
2. **Task 2: Redesign documents and import pages** - `d2c7b03` (feat)
3. **Task 3: Visual verification checkpoint** - approved by user

## Files Created/Modified

- `src/app/(app)/bills/page.tsx` - Full migration: Input, Card, Badge, Button
- `src/app/(app)/income/page.tsx` - Full migration: Input, Card+CardHeader, Badge, Button
- `src/app/(app)/documents/page.tsx` - Full migration: Card, Button (asChild for download), Input
- `src/app/(app)/import/page.tsx` - Full migration: Card, Button, refined upload zone

## Decisions Made

- Badge variant mapping for payments: Paid=success, Unpaid=destructive, Received=success, Pending=warning
- Used Button asChild with anchor for document download (preserves native download behavior)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

- Phase 6 complete — all pages redesigned with design system components
- Ready for Phase 7: Mobile Responsiveness
- No blockers

---
*Phase: 06-page-redesign*
*Completed: 2026-03-15*
