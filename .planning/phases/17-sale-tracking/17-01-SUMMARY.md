---
phase: 17-sale-tracking
plan: 01
status: complete
---

# Phase 17-01: Sale Tracking — Complete

## Tasks Completed

### Task 1: Schema changes
- Added "sold" to `propertyStatusEnum`
- Added 3 columns to `properties` table: `salePrice` (numeric 15,2), `saleDate` (timestamp), `buyer` (text)
- Columns placed after `ownership` field
- `npm run db:push` succeeded
- `npm run build` succeeded

### Task 2: Sale UI
- Added "sold" -> "destructive" badge variant in all 3 pages (dashboard, properties list, property detail)
- Added "sold" to STATUSES filter array in properties list
- Added "Mark as Sold" button (destructive, sm) — visible only when NOT sold
- Sale modal: sale price (required), sale date (default today), buyer (optional) — PUTs to /api/properties/:id
- Sale summary card at TOP of Overview tab when sold: sale price, date, buyer, profit/loss
- Profit/loss = salePrice - (purchasePrice + stampDuty + registrationCharges)
- Positive profit in green (text-success), negative in red (text-destructive)
- Hide Add Bill, Record Payment, Upload Document buttons when status is "sold"
- No API changes needed — existing PUT handler spreads body fields

## Files Modified
- `src/lib/db/schema.ts` — enum + columns
- `src/app/(app)/properties/[id]/page.tsx` — sale modal, summary card, badge, button visibility
- `src/app/(app)/properties/page.tsx` — badge variant, STATUSES array
- `src/app/(app)/page.tsx` — badge variant (dashboard)

## Deviations
- None. All tasks executed as planned.
