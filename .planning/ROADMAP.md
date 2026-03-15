# Roadmap: PropManager

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-15) — [Archive](milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 UI/UX Redesign** — Phases 5-7 (in progress)
- 📋 **v1.2 AI SDK Migration** — Phase 8 (planned)

## Completed Milestones

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-15</summary>

- [x] Phase 1: Database & Infrastructure (1/1 plans) — completed 2026-03-14
- [x] Phase 2: Complete CRUD & File Upload (2/2 plans) — completed 2026-03-14
- [x] Phase 3: UI Polish & UX (1/1 plans) — completed 2026-03-14
- [x] Phase 4: Deployment & PWA (1/1 plans) — completed 2026-03-15

</details>

### 🚧 v1.1 UI/UX Redesign (In Progress)

**Milestone Goal:** Transform PropManager from functional MVP to polished, mobile-friendly experience using clean minimal design (Linear/Notion-inspired)

#### Phase 5: Design System ✅

**Goal**: Establish design tokens, color palette, typography, spacing scale, and component primitives
**Depends on**: Previous milestone complete
**Research**: Unlikely (internal patterns with existing Tailwind/shadcn)
**Plans**: 1 plan

Plans:
- [x] 05-01: Design tokens, Inter font, and component primitives (Button, Input, Card, Badge)

#### Phase 6: Page Redesign

**Goal**: Apply new design system across all pages — dashboard, properties, bills, income, documents
**Depends on**: Phase 5
**Research**: Unlikely (internal UI work)
**Plans**: 2 plans

Plans:
- [x] 06-01: Sidebar, dashboard, and properties redesign
- [x] 06-02: Bills, income, documents, and import redesign

#### Phase 7: Mobile Responsiveness

**Goal**: Full responsive redesign — responsive layouts, touch targets, mobile navigation
**Depends on**: Phase 6
**Research**: Unlikely (Tailwind responsive utilities)
**Plans**: 1 plan

Plans:
- [x] 07-01: Forms, tables, headers, modals — full mobile optimization

### 📋 v1.2 AI SDK Migration (Planned)

**Milestone Goal:** Migrate AI import from direct Google Generative AI SDK to Vercel AI SDK with Gemini provider for better Next.js integration

#### Phase 8: Vercel AI SDK Migration

**Goal**: Replace @google/generative-ai with Vercel AI SDK (`ai` + `@ai-sdk/google`) in the AI import feature
**Depends on**: Phase 7
**Research**: Unlikely (Vercel AI SDK is well-documented)
**Plans**: TBD

Plans:
- [ ] 08-01: TBD (run /gsd:plan-phase 8 to break down)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Database & Infrastructure | v1.0 | 1/1 | Complete | 2026-03-14 |
| 2. Complete CRUD & File Upload | v1.0 | 2/2 | Complete | 2026-03-14 |
| 3. UI Polish & UX | v1.0 | 1/1 | Complete | 2026-03-14 |
| 4. Deployment & PWA | v1.0 | 1/1 | Complete | 2026-03-15 |
| 5. Design System | v1.1 | 1/1 | Complete | 2026-03-15 |
| 6. Page Redesign | v1.1 | 2/2 | Complete | 2026-03-15 |
| 7. Mobile Responsiveness | v1.1 | 1/1 | Complete | 2026-03-15 |
| 8. Vercel AI SDK Migration | v1.2 | 0/? | Not started | - |
