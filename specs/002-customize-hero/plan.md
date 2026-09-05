# Implementation Plan: Customize Hero Component

**Branch**: `002-customize-hero` | **Date**: 2026-09-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-customize-hero/spec.md`

**Plan-time requirement from user**: Decorate the Hero in a border-radius section. Content stays in two columns as currently organized, but the content column (column 1) should slightly overlap the 3D globe (column 2) by about one quarter of the globe column's width.

## Summary

Make the Hero a configurable, self-contained component (`app/sections/hero.tsx`) supporting custom content (headline, subtitle, button labels), layout toggles (globe visibility, alignment), and interaction handlers — while introducing a decorated rounded section whose content column overlaps the globe by ~25% of the globe column width. All customization flows through a typed `HeroConfig` props object with sensible defaults that preserve current behavior, per FR-001 through FR-011.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2.8, Next.js 16.3.0 (App Router)

**Primary Dependencies**: `@react-three/fiber` 9.x, `@react-three/drei` 10.x, `three` 0.185, `@base-ui/react` 1.8, `class-variance-authority` 0.7, Tailwind CSS 4 (shadcn `oklch` tokens), `cn` utility

**Storage**: N/A — static landing page; nothing is persisted (spec Out of Scope)

**Testing**: No test runner is installed in this project (`package.json` has no jest/vitest/testing-library). Per AGENTS.md, this change is primarily CSS/JSX layout work — low-risk category — so verification is `npm run typecheck`, `npm run lint`, `npm run build`, plus manual visual check via `npm run dev`.

**Target Platform**: Modern browsers — Chrome, Firefox, Safari, Edge (last 2 versions); standard mobile and desktop viewports

**Project Type**: Next.js web application (SSG landing page)

**Performance Goals**: Keep the existing globe rendering path unchanged; the hero remains a Client Component; no new runtime dependencies; text/color transitions must not cause layout jank.

**Constraints**: No `any` types (constitution II); theme tokens only — reuse `--card`, `--background`, `--border`, `--radius-*`, shadows (constitution V, FR-008); Globe3D component must stay intact unless necessary; buttons remain presentational (FR-003); overlap may block globe pointer events in the overlap band (accepted).

**Scale/Scope**: Single landing page; one Hero section; editor-only config flexibility (no CMS, no runtime editing).

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Assessment                                                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Component-First Architecture | PASS — Hero stays a self-contained component; new `HeroConfig` type and any sub-render helpers are organized in `app/sections/hero.tsx` with clear responsibilities.                                                                  |
| II. Type Safety                 | PASS — `HeroConfig` explicitly typed; no `any`; defaults/options documented.                                                                                                                                                          |
| III. Performance-First          | PASS — no new deps, no new render strategy; globe passes through existing `Globe3D`; text column gets `z-10` without forcing expensive repaints.                                                                                      |
| IV. Testing Strategy            | PASS* — no test runner present; CSS/JSX/low-risk scope per AGENTS.md; full static verification (typecheck/lint/build) + manual visual check. If a runner is later added, config-default merge logic would get a co-located unit test. |
| V. Code Quality                 | PASS — passes ESLint, `tsc --noEmit`, Prettier; husky pre-commit enforced.                                                                                                                                                            |

No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/[002-customize-hero]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── hero-config.md   # HeroConfig UI contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── page.tsx                  # unchanged; renders <Hero /> inside <main>
├── sections/
│   ├── hero.tsx              # EDIT: config-driven Hero with rounded decorated section + two-column overlap
│   └── (navbar, features, pricing, testimonials, footer)  # unchanged
├── layout.tsx / globals.css  # unchanged (theme tokens already available)
components/
├── ui/
│   ├── button.tsx            # unchanged (used for presentational CTAs)
│   └── 3d-globe.tsx          # unchanged (reused as-is)
data/
└── globe3d-markers.ts        # unchanged (sampleMarkers reused)
```

**Structure Decision**: Single Next.js app project. All changes are scoped to `app/sections/hero.tsx`; nothing else in the repo needs modification. No new directories outside the spec docs.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — table intentionally empty.
