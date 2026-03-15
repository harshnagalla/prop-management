# PropManager - Claude Code Guidelines

## Project

Property portfolio management platform. Next.js 15, Tailwind CSS 4, Drizzle ORM, Neon Postgres, NextAuth v5, Vercel AI SDK + Gemini.
Production: https://prop-management-one.vercel.app

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Verification Before Done
- Never mark a task complete without proving it works
- Run `npm run build` after every change
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 4. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 5. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Minimal code impact.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## Tech Stack

- **Framework**: Next.js 15 (pinned, 16.x breaks serwist)
- **Styling**: Tailwind CSS 4 with @theme tokens in globals.css
- **Database**: Neon Postgres + Drizzle ORM
- **Auth**: NextAuth v5 (Google OAuth + Credentials)
- **AI**: Vercel AI SDK (`ai` + `@ai-sdk/google`) with Gemini 2.0 Flash
- **PWA**: @serwist/next service worker
- **UI Components**: Radix UI primitives, cva + forwardRef + cn() pattern
- **Icons**: Lucide React

## Conventions

- Design tokens in `src/app/globals.css` via @theme
- Components use `cva` variants + `forwardRef` + `cn()` from `@/lib/utils/cn`
- Badge variant mapping: Occupied=success, Vacant=secondary, Renovation=warning
- All forms: `grid-cols-1 sm:grid-cols-2` for mobile responsiveness
- Tables: `hidden md:block` for desktop, `md:hidden` card view for mobile
- Commit format: `{type}({phase}-{plan}): {description}`

## Commands

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run db:push      # Push schema to Neon
npm run db:studio    # Drizzle Studio
```
