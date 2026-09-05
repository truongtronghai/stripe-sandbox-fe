# Research: Hero Customization & Rounded Overlap Layout

Scope: resolve design decisions for the configurable Hero and the plan-time requirement (rounded section + content column overlapping the globe by ~1/4).

## Decision 1: Configuration interface shape

**Decision**: Introduce a single `HeroConfig` typed object consumed as a prop by the Hero, with every field optional and full default values preserving the current look and copy.

**Rationale**: The spec requires sensible defaults (FR-001, FR-002, FR-003), presentational buttons (FR-003), optional globe (FR-004), and no-op interaction handlers (FR-007). A single optional-capable object keeps `app/page.tsx` usage unchanged (`<Hero />` still works with defaults) while enabling `<Hero config={{ heading: "...", showGlobe: false }} />`.

**Alternatives considered**:

- Individual props (heading, subtitle, ...): more props to plumb; would clutter the call site and the API. Rejected.
- `Partial<HeroConfig>` at each call site vs. merged-with-defaults internally: merging internally (default merge + spread) keeps consumers clean and guarantees the component always has a complete config. Selected.

## Decision 2: Rounded "border radius" section decoration

**Decision**: Wrap the hero content in a decorated panel using theme tokens only: `rounded-3xl` (or `rounded-[2rem]`), `border border-border/60`, `bg-card` with a subtle radial/linear gradient accent derived from `--primary`, shadow from the existing `--shadow-*` scale, and generous `p-8 sm:p-12`.

**Rationale**: Constitution V and FR-008 require theme-consistency for both light and dark modes; the shadcn `oklch` tokens (e.g., `--card`, `--border`, `--primary`) switch automatically under `.dark`. No hard-coded colors. A centered max-width wrapper (`max-w-6xl`) keeps the rounded panel aligned with the other sections (features use `max-w-6xl`).

**Alternatives considered**:

- Solid `bg-primary` panel: too heavy, hurts readability of foreground text; rejected.
- New custom tokens in globals.css: unnecessary — existing card/border/primary token set suffices. Avoided to keep diff small.

## Decision 3: Two-column layout with ~1/4 overlap

**Decision**: Keep a two-column flex/grid arrangement (content left, globe right). Give the content column a `relative z-10` and a negative right offset on large screens so it extends into the globe column by approx one quarter of the globe area:

- Globe container stays fixed at `size-120` → 480px → one quarter ≈ 120px → `lg:-mr-[7.5rem]` (120px) on the content column; or the equivalent via `lg:-mr-32` (128px ≈ 26%). Exact 25% (120px) preferred via `lg:-mr-[7.5rem]`.
- Content column keeps `z-10` so text renders above the globe canvas (bottommost in paint order is safer than `pointer-events-none`, and matches intent).
- `overflow-hidden` on the rounded panel so the overlap and globe stay clipped inside the rounded corners.

**Rationale**: Deterministic and responsive. The globe's fixed `size-120` makes a fixed-pixel offset express ~25% reliably on desktop. Grid column-span math (e.g., `col-span-7`/`col-span-5` dot products) is less direct to reason about for an exact quarter and doesn't generalize as cleanly to the existing flex row. Flex with negative margin preserves the current `<section className="flex flex-row ...">` skeleton.

**Alternatives considered**:

- CSS Grid 12-col with content spanning past the globe: works, but fractional column borders don't map cleanly to "one quarter of the globe _width_" and complicate mobile stacking. Rejected.
- Absolute positioning of content over the globe: fragile against text height variations and mobile stacking. Rejected.
- SVG/clip-path decoration: overkill; CSS border-radius is sufficient. Rejected.

## Decision 4: Responsive / mobile behavior

**Decision**: On small viewports (`< lg`) the two columns stack vertically — content first, globe below — with the globe scaled down to `size-56`/`size-64` (still visible, per FR-009). The overlap offset is applied only at `lg` and up. Reduce overlap to 0 on intermediate breakpoints if it causes text/globe collision, until `lg`.

**Rationale**: FR-006/FR-009 and the clarified mobile behavior (globe scales down, stays visible). A single-column stack avoids horizontal overflow (SC-003, SC-004).

**Alternatives considered**:

- Keeping side-by-side with scaled globe on mobile: crowded; horizontal scrolling risk on small screens. Rejected.

## Decision 5: Globe pointer interaction vs. overlap

**Decision**: Accept that the overlapped band of the globe (its left ~25%) may be covered by content and its pointer events. Markers there were already clickable only when facing the camera; the overlap band generally covers the left face. No Pointer Events disabling on the content column is needed — content naturally sits above and captures events.

**Rationale**: FR-007 handlers still fire for markers in the uncovered area and after globe auto-rotation brings markers into the clear right/~remaining region. Changing canvas pointer handling would risk breaking the existing persistent-rotation interaction. Accepted as documented limitation.

**Alternatives considered**:

- `pointer-events-none` on the content column so globe stays interactive: but then buttons/text lose events. Rejected.
- Making the overlap band smaller: violates the requested ~1/4. Rejected.

## Decision 6: Content default values (verification check)

**Decision**: Keep the current copy/visuals as defaults: heading `Build Something Amazing`, existing subtitle, `Get Started` / `Learn More`, `showGlobe: true`, `alignment: 'left'` (preserving current left-content/right-globe arrangement), atmosphere config as today, no-op handlers.

**Rationale**: FR-008 and the assumption "Default content will preserve the existing Build Something Amazing headline and current button labels". Idempotent progress — Hero renders identically with no config passed.

## Open items (none blocking)

- No [NEEDS CLARIFICATION] remain. All spec ambiguities were resolved during `/speckit.clarify` (CTA targets, mobile globe, background scope) and the plan-time requirements (rounded panel, ~1/4 overlap).
