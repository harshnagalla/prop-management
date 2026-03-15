# PropManager

## What This Is

A property portfolio management platform for a family with 30+ properties in Ahmedabad. Replaces scattered Excel sheets and paper records with a unified mission control dashboard, AI-powered document processing, and comprehensive financial tracking. Deployed as an installable PWA at prop-management-one.vercel.app.

## Core Value

Know exactly how much money each property is making and whether it's worth holding — at a glance, always up to date.

## Requirements

### Validated

- ✓ Property registry — catalog all properties with purchase price, current value, type, location, and status — v1.0
- ✓ Document vault — digitally store property papers (sale deeds, agreements, registration docs) per property — v1.0
- ✓ Bill tracking — log recurring bills (municipal, electricity, water, maintenance) per property — v1.0
- ✓ Rental income tracking — record rental income per property with tenant payment history — v1.0
- ✓ Mission control dashboard — portfolio overview showing total value, cash flow, profitability, ROI per property, occupancy, and utilization rates — v1.0
- ✓ Rental yield analysis — cost vs rental income, rental percentage, is-it-worth-it assessment per property — v1.0
- ✓ AI document processing (Vercel AI SDK + Gemini) — OCR bills, receipts, and spreadsheets; extract key fields (amount, date, type); auto-match to the correct property — v1.0, migrated v1.2
- ✓ Excel/spreadsheet import — AI-powered bulk import of existing property and financial data — v1.0
- ✓ Multi-user access — family members and property managers can log in and use the system — v1.0
- ✓ Mobile-first PWA — installable progressive web app with offline asset caching — v1.0

- ✓ Clean minimal design system — Inter font, component primitives, Analytics Dashboard palette, card shadows — v1.1
- ✓ Mobile responsiveness — mobile card views, stacking forms, responsive headers — v1.1
- ✓ Vercel AI SDK migration — replaced @google/generative-ai with ai + @ai-sdk/google — v1.2

- ✓ Type-safe AI extraction — generateObject with Zod schemas, retry logic, Indian-optimized prompts — v1.3
- ✓ Dashboard charts — income vs expenses area chart, expense breakdown pie chart with recharts — v1.3
- ✓ Search & filters — search properties/bills, filter by category/status/property, sortable table columns — v1.3

### Active

(None — all v1.3 requirements validated)

### Out of Scope

- Tenant management (profiles, lease tracking, communication) — v1 focuses on financial tracking, not tenant CRM
- Accounting/tax integration (GST filing, ITR, formal accounting) — not replacing an accountant
- Property marketplace (buying/selling through the app) — this is a portfolio tracker, not a marketplace
- Push notifications — PWA manifest supports it but not implemented in v1
- Offline data sync — service worker caches assets only, not API data

## Context

- Family portfolio of 30+ properties in Ahmedabad, Gujarat
- v1.3 shipped with 4,874 LOC TypeScript
- Tech stack: Next.js 15, Tailwind CSS 4, Drizzle ORM, Neon Postgres, NextAuth v5, Vercel AI SDK + Gemini 2.0 Flash, @serwist/next
- Deployed to Vercel: https://prop-management-one.vercel.app
- Documents stored as base64 in Postgres (no external file storage)
- User has Zoho Books (potential future integration)

## Constraints

- **Tech stack**: Next.js 15 (web), PWA for mobile — single codebase serves both
- **AI provider**: Vercel AI SDK with Google Gemini for OCR and document processing
- **Language**: English UI (property names/addresses may be in Gujarati/Hindi)
- **Locale**: Indian currency (₹), Indian date formats, Ahmedabad-specific bill formats
- **Next.js version**: Pinned to 15.x (16.x incompatible with @serwist/next webpack plugin)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA over native mobile | Single codebase, installable, offline-capable — avoids maintaining separate apps | ✓ Good |
| Google AI for OCR → Vercel AI SDK | Migrated to Vercel AI SDK for better Next.js integration, same Gemini model | ✓ Good |
| generateObject + Zod schemas | Type-safe structured output, eliminated fragile JSON.parse | ✓ Good |
| recharts for dashboard charts | Already installed, well-supported React charting library | ✓ Good |
| Client-side filtering (no API changes) | Data already fetched, instant filtering experience | ✓ Good |
| No tenant management in v1 | Keep scope focused on financial tracking and portfolio health | ✓ Good |
| AI-powered Excel import + manual entry | Bulk migration for existing data, manual for ongoing corrections | ✓ Good |
| NextAuth v5 over Stack Auth | Simpler integration, better Next.js 15 support | ✓ Good |
| Neon serverless with Drizzle ORM | HTTP adapter for serverless, schema push for dev, free tier | ✓ Good |
| Base64 documents in Postgres | Simple for v1, no external storage needed | ⚠️ Revisit at scale |
| @serwist/next for PWA | Modern maintained fork of next-pwa, works with Next.js 15 | ✓ Good |
| Event-based Radix Toast | Lightweight, no state management library needed | ✓ Good |
| Next.js pinned to 15.x | 16.x defaults to Turbopack, incompatible with serwist webpack | ⚠️ Revisit when serwist supports Turbopack |

---
*Last updated: 2026-03-15 after v1.3 milestone*
