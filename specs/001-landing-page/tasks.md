# Tasks: Landing Page

**Input**: Design documents from `/specs/001-landing-page/`

**Prerequisites**: spec.md, design spec at `docs/superpowers/specs/2026-09-04-landing-page-design.md`

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization — install dependencies, create directory structure

- [x] T001 Install ShadCn components: `npx shadcn@latest add card badge` in project root
- [x] T002 Create directory structure: `app/sections/`, `data/`, `hooks/`, `mocks/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create seed data in `data/pricing.ts` — 3 tiers with `{ id, name, price, features: string[], isRecommended: boolean }`
- [x] T004 [P] Create seed data in `data/features.ts` — 3-6 items with `{ icon, title, description }`
- [x] T005 [P] Create seed data in `data/testimonials.ts` — customer quotes with `{ name, quote, company, avatar }`
- [x] T006 [P] Create MSW handler in `mocks/handlers.ts` — `POST /api/plans/select` returning success/error with 500ms delay, error toggle via module flag
- [x] T007 [P] Create MSW browser setup in `mocks/browser.ts` and `mocks/index.ts` — `startMocking()` function for browser initialization
- [x] T008 Update `app/layout.tsx` — wrap children in `<QueryClientProvider>` from `@tanstack/react-query`, initialize MSW via `startMocking()` before render
- [x] T009 [P] Create skeleton loading component in `app/sections/skeleton.tsx` — reusable `animate-pulse` placeholder matching section shapes

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Navigate via Menu (Priority: P1) 🎯 MVP

**Goal**: Fixed top navbar (desktop) / fixed bottom navbar (mobile) with smooth-scroll navigation and active section tracking

**Independent Test**: Click each menu item → smooth scroll to corresponding section. Active state updates on scroll.

### Implementation

- [x] T010 [US1] Create `app/sections/hero.tsx` — section with `id="hero"`, headline, CTA button using ShadCn `button`
- [x] T011 [US1] Create `app/sections/features.tsx` — section with `id="features"`, grid of feature items from `data/features.ts`
- [x] T012 [US1] Create `app/sections/testimonials.tsx` — section with `id="testimonials"`, customer quote cards from `data/testimonials.ts`
- [x] T013 [US1] Create `app/sections/navbar.tsx` — fixed top on desktop, fixed bottom on mobile; smooth scroll via `scrollIntoView({ behavior: 'smooth' })`; Intersection Observer for active section tracking; menu items: Home, Features, Pricing, Testimonials
- [x] T014 [US1] Create placeholder `app/sections/pricing.tsx` — section with `id="pricing"`, render skeleton from T009 (full pricing with API integration in US2)
- [x] T015 [US1] Create placeholder `app/sections/footer.tsx` — section with `id="footer"`, render skeleton from T009 (full footer in US4)
- [x] T016 [US1] Update `app/page.tsx` — compose all sections in order: Navbar, Hero, Features, Pricing, Testimonials, Footer

**Checkpoint**: Navigation works — all menu items scroll to sections, active state updates on scroll

---

## Phase 4: User Story 2 — View Pricing Tiers (Priority: P2)

**Goal**: Display 3 pricing tiers with ShadCn Cards, middle tier highlighted as recommended, click triggers API call via Tanstack Query

**Independent Test**: View pricing section → 3 tiers visible with name/price/features. Click tier → loading state → success/error feedback. Middle tier has "Recommended" badge.

### Implementation

- [x] T017 [US2] Create `hooks/use-select-plan.ts` — `useMutation` calling `POST /api/plans/select`, returns `{ mutate, isPending, isSuccess, isError, error, data }`
- [x] T018 [US2] Update `app/sections/pricing.tsx` — replace skeleton with 3 ShadCn `Card` components from `data/pricing.ts`; middle tier gets `Badge` "Recommended"; click calls `useSelectPlan.mutate(planId)`; show loading spinner on pending tier; show success/error message after response

**Checkpoint**: Pricing section fully functional — tiers display correctly, API integration works

---

## Phase 5: User Story 3 — Switch Theme (Priority: P3)

**Goal**: Theme toggle button in navbar switches between light and dark modes via ShadCn CSS variables

**Independent Test**: Click toggle → entire page switches color scheme. No persistence on refresh.

### Implementation

- [x] T019 [US3] Add theme toggle to `app/sections/navbar.tsx` — button using ShadCn `Button` with sun/moon icon from `lucide-react`; toggles `.dark` class on `<html>` via `document.documentElement.classList.toggle('dark')`

**Checkpoint**: Theme toggles correctly across all sections

---

## Phase 6: User Story 4 — Access Footer Information (Priority: P4)

**Goal**: Footer displays copyright, email, and legal links

**Independent Test**: Scroll to footer → copyright visible, email clickable, terms/privacy links accessible.

### Implementation

- [x] T020 [US4] Update `app/sections/footer.tsx` — replace skeleton with copyright text, email `mailto:` link, placeholder links for Terms and Privacy

**Checkpoint**: Footer fully rendered with all required information

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final responsive adjustments and cleanup

- [x] T021 Verify responsive behavior — test navbar switches between top (desktop) and bottom (mobile) at 768px breakpoint
- [x] T022 Run `npm run typecheck` and `npm run lint` — fix any errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories proceed sequentially in priority order (P1 → P2 → P3 → P4)
  - Each story builds on the previous one's components
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational — creates all section components (skeleton placeholders for pricing/footer)
- **US2 (P2)**: Depends on US1 — replaces pricing skeleton with full implementation
- **US3 (P3)**: Depends on US1 — modifies navbar (already created)
- **US4 (P4)**: Depends on US1 — replaces footer skeleton with full implementation

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T003, T004, T005 (seed data) — can run in parallel
- T006, T007 (MSW setup) — can run in parallel
- T010, T011, T012 (static sections) — can run in parallel within US1
- T021, T022 (polish) — can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 — Navigation with skeleton placeholders
4. **STOP and VALIDATE**: Test navigation works across all sections
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 → Navigation working with placeholders → Deploy/Demo (MVP!)
3. US2 → Pricing functional with API → Deploy/Demo
4. US3 → Theme toggle working → Deploy/Demo
5. US4 → Footer complete → Deploy/Demo
6. Polish → Final cleanup → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story builds on US1's component structure
- No tests requested — implementation only
- Commit after each phase or logical group
- Stop at any checkpoint to validate independently
