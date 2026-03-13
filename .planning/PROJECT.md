# PropManager

## What This Is

A property portfolio management platform for a family with 30+ properties in Ahmedabad. Replaces scattered Excel sheets and paper records with a unified mission control dashboard, AI-powered document processing, and comprehensive financial tracking. Multi-user — used by family members and property managers.

## Core Value

Know exactly how much money each property is making and whether it's worth holding — at a glance, always up to date.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Property registry — catalog all properties with purchase price, current value, type, location, and status
- [ ] Document vault — digitally store property papers (sale deeds, agreements, registration docs) per property
- [ ] Bill tracking — log recurring bills (municipal, electricity, water, maintenance) per property
- [ ] Rental income tracking — record rental income per property with tenant payment history
- [ ] Mission control dashboard — portfolio overview showing total value, cash flow, profitability, ROI per property, occupancy, and utilization rates
- [ ] Rental yield analysis — cost vs rental income, rental percentage, is-it-worth-it assessment per property
- [ ] AI document processing (Google AI) — OCR bills, receipts, and spreadsheets; extract key fields (amount, date, type); auto-match to the correct property
- [ ] Excel/spreadsheet import — AI-powered bulk import of existing property and financial data
- [ ] Multi-user access — family members and property managers can log in and use the system
- [ ] Mobile-first PWA — installable progressive web app with offline support and push notifications

### Out of Scope

- Tenant management (profiles, lease tracking, communication) — v1 focuses on financial tracking, not tenant CRM
- Accounting/tax integration (GST filing, ITR, formal accounting) — not replacing an accountant
- Property marketplace (buying/selling through the app) — this is a portfolio tracker, not a marketplace

## Context

- Family portfolio of 30+ properties in Ahmedabad, Gujarat
- Currently tracked via Excel spreadsheets and paper records
- Multiple people need access — not just the owner
- Bills include Ahmedabad municipal corporation tax, electricity (Torrent Power/UGVCL), water, maintenance
- Rental income currently tracked via mix of Excel and bank statement reconciliation
- Property papers exist as physical documents and some scanned PDFs
- Google AI (Gemini) for OCR and document intelligence
- User already has Zoho Books (potential future integration, not v1)

## Constraints

- **Tech stack**: Next.js (web), PWA for mobile — single codebase serves both
- **AI provider**: Google AI (Gemini) for OCR and document processing
- **Language**: English UI (property names/addresses may be in Gujarati/Hindi)
- **Locale**: Indian currency (₹), Indian date formats, Ahmedabad-specific bill formats

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA over native mobile | Single codebase, installable, offline-capable — avoids maintaining separate apps | — Pending |
| Google AI for OCR | User preference; Gemini handles multilingual docs well | — Pending |
| No tenant management in v1 | Keep scope focused on financial tracking and portfolio health | — Pending |
| AI-powered Excel import + manual entry | Bulk migration for existing data, manual for ongoing corrections | — Pending |

---
*Last updated: 2026-03-14 after initialization*
