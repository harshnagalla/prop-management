# Roadmap: PropManager

## Overview

PropManager has a complete initial implementation (auth, API routes, all pages, AI integration). The roadmap covers the remaining work to go from working code to a deployed, production-ready application — database setup, missing CRUD operations, UI polish, and deployment with PWA support.

## Domain Expertise

None

## Phases

- [x] **Phase 1: Database & Infrastructure** - Deploy Neon DB, push schema, configure environment
- [x] **Phase 2: Complete CRUD & File Upload** - Missing API routes, file upload, data integrity
- [ ] **Phase 3: UI Polish & UX** - Loading states, error handling, toast notifications, responsive fixes
- [ ] **Phase 4: Deployment & PWA** - Vercel deployment, service worker, offline support

## Phase Details

### Phase 1: Database & Infrastructure
**Goal**: Working database with schema deployed, environment configured for local development
**Depends on**: Nothing (first phase)
**Research**: Unlikely (Neon + Drizzle already configured in codebase)
**Plans**: 1 plan

Plans:
- [x] 01-01: Push Drizzle schema to Neon, configure environment, verify auth flow end-to-end

### Phase 2: Complete CRUD & File Upload
**Goal**: All entities have full CRUD operations, documents can be uploaded/downloaded
**Depends on**: Phase 1
**Research**: Unlikely (extending existing API patterns)
**Plans**: 2 plans

Plans:
- [x] 02-01: Add bills/[id] and rental-income/[id] API routes + edit/delete UI
- [x] 02-02: Implement file upload API for documents (upload, store, retrieve)

### Phase 3: UI Polish & UX
**Goal**: Polished user experience with loading states, error handling, and form validation
**Depends on**: Phase 2
**Research**: Unlikely (internal UI work using existing component patterns)
**Plans**: TBD

Plans:
- [ ] 03-01: Add loading skeletons, error boundaries, and toast notifications
- [ ] 03-02: Form validation, empty states, and responsive layout fixes

### Phase 4: Deployment & PWA
**Goal**: Live application deployed to Vercel with installable PWA and offline support
**Depends on**: Phase 3
**Research**: Likely (service worker patterns, Next.js PWA configuration)
**Research topics**: next-pwa or serwist for Next.js 15, service worker caching strategies, Vercel deployment configuration for Neon
**Plans**: TBD

Plans:
- [ ] 04-01: Deploy to Vercel, configure environment variables, verify production build
- [ ] 04-02: Implement service worker for offline support and PWA install prompt

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database & Infrastructure | 1/1 | Complete | 2026-03-14 |
| 2. Complete CRUD & File Upload | 2/2 | Complete | 2026-03-14 |
| 3. UI Polish & UX | 0/2 | Not started | - |
| 4. Deployment & PWA | 0/2 | Not started | - |
