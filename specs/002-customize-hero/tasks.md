---
description: 'Task list for Customize Hero Component feature'
---

# Tasks: Customize Hero Component

**Input**: Design documents from `/specs/002-customize-hero/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated test runner is installed in this project. Per AGENTS.md, this feature is primarily CSS/JSX layout work (low-risk category), so no unit test tasks are generated. Verification is `typecheck`, `lint`, `build`, and the quickstart manual checks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js app project; all implementation is scoped to `app/sections/hero.tsx`
- Full path references used throughout

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm baseline and dev tooling before changes

- [x] T001 Verify static baseline passes on the current implementation: run `npm run typecheck` and `npm run lint` in repo root (baseline must be green before edits)
- [x] T002 Confirm hero baseline renders correctly: run `npm run dev`, open `http://localhost:3000`, verify the current hero (headline, subtitle, two buttons, globe) displays as-is

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared `HeroConfig` foundation — MUST be complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add `HeroConfig` interface and `HeroProps` to `app/sections/hero.tsx` per `contracts/hero-config.md` — fields: `heading`, `subtitle`, `primaryCtaLabel`, `secondaryCtaLabel`, `showGlobe`, `alignment` ('left' | 'center'), `onMarkerClick`, `onMarkerHover`; explicitly typed, no `any`
- [x] T004 Add `heroDefaultConfig` constant in `app/sections/hero.tsx` with defaults from `contracts/hero-config.md` — `heading: 'Build Something Amazing'`, current subtitle copy, `primaryCtaLabel: 'Get Started'`, `secondaryCtaLabel: 'Learn More'`, `showGlobe: true`, `alignment: 'left'`, no-op handlers
- [x] T005 Implement config resolution in `app/sections/hero.tsx`: merge `config` prop over `heroDefaultConfig` (spread) so the component always has a complete config; update `Hero` to accept `config?: Partial<HeroConfig>` while keeping `<Hero />` without props rendering exactly as today

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Customize Hero Content (Priority: P1) 🎯 MVP

**Goal**: Headline, subtitle, and call-to-action button labels are driven by `HeroConfig`, with defaults preserving current look (FR-001, FR-002, FR-003).

**Independent Test**: With `<Hero config={{ heading: 'Custom', subtitle: 'More', primaryCtaLabel: 'Go', secondaryCtaLabel: 'Info' }} />`, the hero renders the configured values; with `<Hero />` it renders the defaults. Buttons never navigate.

### Implementation for User Story 1

- [x] T006 [US1] Render `config.heading` as the `h1` in `app/sections/hero.tsx` (replaces hardcoded `Build Something Amazing`)
- [x] T007 [US1] Render `config.subtitle` as the supporting `<p>` in `app/sections/hero.tsx` (replaces hardcoded subtitle copy)
- [x] T008 [US1] Render `config.primaryCtaLabel` and `config.secondaryCtaLabel` on the two `Button` elements in `app/sections/hero.tsx` — labels only, buttons remain presentational/non-navigating (FR-003)

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Configure Hero Layout & Decoration (Priority: P2)

**Goal**: Globe visibility and alignment are configurable; hero is decorated as a rounded section whose content column overlaps the globe by ~1/4 of its width on large screens; responsive stacking on small screens (FR-004, FR-005, FR-006, FR-009, FR-010, FR-011).

**Independent Test**: Toggle `showGlobe`/`alignment` and resize the viewport — globe shows/hides, layout switches between two-column overlap and centered, and the panel remains rounded/theme-consistent with no overflow at any breakpoint.

### Implementation for User Story 2

- [x] T010 [US2] Implement `showGlobe` toggle in `app/sections/hero.tsx`: when `false`, the globe column is omitted and content spans the full panel width (FR-004)
- [x] T011 [US2] Implement `alignment` option in `app/sections/hero.tsx`: `'left'` keeps the two-column arrangement; `'center'` renders a single centered column (FR-005)
- [x] T012 [US2] Wrap the hero contents in a rounded decorated section in `app/sections/hero.tsx` (FR-010): `max-w-6xl mx-auto`, `rounded-3xl`, `border border-border/60`, theme background (`bg-card` + subtle primary gradient accent), theme shadow, `overflow-hidden`, responsive padding (`p-8 sm:p-12`) — theme tokens only, dark-mode safe
- [x] T013 [US2] Implement the two-column overlap in `app/sections/hero.tsx` (FR-011): content column gets `relative z-10` and `lg:-mr-[7.5rem]` (~120px ≈ 1/4 of the `size-120` globe) so it overlaps the globe's left area
- [x] T014 [US2] Make the layout responsive in `app/sections/hero.tsx` (FR-006, FR-009): below `lg`, columns stack (content first, globe below), globe scales down (`size-56`/`size-64`), overlap disabled; no horizontal scroll/clipping

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - Handle Visual Interactions (Priority: P3)

**Goal**: Globe marker click/hover handlers are wired from `HeroConfig`, defaulting to no-op (FR-007).

**Independent Test**: With `config={{ onMarkerClick: (m) => console.log(m.label), onMarkerHover: (m) => console.log(m?.label) }}`, hovering/clicking markers in the globe's uncovered area logs the correct marker data.

### Implementation for User Story 3

- [x] T015 [US3] Wire `config.onMarkerClick` and `config.onMarkerHover` to the `Globe3D` `onMarkerClick`/`onMarkerHover` props in `app/sections/hero.tsx` (already no-op via defaults; pass through explicitly)

**Checkpoint**: All user stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Formatting, static verification, and final validation

- [x] T016 Run `npm run format` (Prettier) to normalize formatting
- [x] T017 Run `npm run typecheck` and `npm run lint` — must both pass (no `any`, no lint errors)
- [x] T018 Run `npm run build` — production build must succeed
- [x] T019 Run `quickstart.md` validation: `npm run dev` and verify rounded panel, ~1/4 overlap at ≥1024px, stacked/scaled globe below `lg`, dark-mode theme consistency, globe toggle, and handler logging

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — baseline checks only
- **Foundational (Phase 2)**: Depends on Setup; BLOCKS all user stories (T003–T005)
- **User Stories (Phase 3+)**: All depend on Foundational completion
  - US1 → US2 → US3 build sequentially in priority order
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational — reuses the same `app/sections/hero.tsx`; implement after US1 to avoid same-file merge conflicts
- **User Story 3 (P3)**: Can start after Foundational — touches the same file; implement last

### Within Each User Story

- All tasks edit `app/sections/hero.tsx` → tasks within a story run sequentially (same file)
- Content (US1) before layout (US2) before interactions (US3)

### Parallel Opportunities

- The codebase is a static landing page; all implementation is confined to `app/sections/hero.tsx`, so no [P] tasks exist in implementation phases
- If split across agents, US1, US2, and US3 could each be prepared as separate `git` branches/patches against the post-foundational snapshot, then merged sequentially
- Polish tasks T016 (format), T017 (typecheck/lint), T018 (build) run as a chain on the final state

---

## Parallel Example: User Stories (single-file constraint)

```bash
# Because T003–T015 all edit app/sections/hero.tsx, run sequentially.
# If a parallel workflow is required, each story can be authored as an
# independent diff against the foundational snapshot and applied in order:
Task: "US1 content tasks (T006-T008) -> diff"
Task: "US2 layout tasks (T010-T014) -> diff"
Task: "US3 interaction task (T015) -> diff"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (baseline checks)
2. Complete Phase 2: Foundational (HeroConfig + defaults) — CRITICAL
3. Complete Phase 3: User Story 1 (configurable content)
4. **STOP and VALIDATE**: verify custom content renders and defaults preserved
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → foundation ready
2. Add User Story 1 → test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → test independently (layout, rounded panel, overlap) → Deploy/Demo
4. Add User Story 3 → test independently (globe handlers) → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

- Not recommended beyond a single implementer due to the single `hero.tsx` file constraint
- If forced: optimistic branching per story (US1/US2/US3) with sequential merge in priority order

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable (visually/manually)
- Backwards compatibility: `<Hero />` with no props must render exactly as before (spec FR-008 + contracts/hero-config.md)
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- Avoid: vague tasks, same-file parallel edits, hard-coded colors (theme tokens only)
