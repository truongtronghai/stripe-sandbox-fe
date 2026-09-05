# Data Model: Hero Configuration

## Entity: `HeroConfig`

The single configuration object consumed by the Hero component. It is passed as a prop from the page (or future consumers); the component merges it over built-in defaults. No persistence — this shape exists only at render time.

| Field               | Type                                    | Default                     | Notes / Validation                                                           |
| ------------------- | --------------------------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| `heading`           | `string`                                | `'Build Something Amazing'` | Rendered as the `h1`. Non-empty recommended; long values must wrap (FR-001). |
| `subtitle`          | `string`                                | existing subtitle copy      | Rendered as the supporting paragraph; wraps at `max-w-2xl` (FR-002).         |
| `primaryCtaLabel`   | `string`                                | `'Get Started'`             | Label only — button is presentational, does not navigate (FR-003).           |
| `secondaryCtaLabel` | `string`                                | `'Learn More'`              | Label only — button is presentational, does not navigate (FR-003).           |
| `showGlobe`         | `boolean`                               | `true`                      | Toggles the globe column; `false` renders content full-width (FR-004).       |
| `alignment`         | `'left' \| 'center'`                    | `'left'`                    | Left = two-column arrangement; center = centered column layout (FR-005).     |
| `onMarkerClick`     | `(marker: GlobeMarker) => void`         | no-op                       | Fires on marker click; default no-op (FR-007).                               |
| `onMarkerHover`     | `(marker: GlobeMarker \| null) => void` | no-op                       | Fires on marker hover/leave; default no-op (FR-007).                         |

## Merged (internal, non-configurable) defaults

Merged internally after spread; not part of the public config surface:

- Globe settings forwarded to `Globe3D`: atmosphere color `#4da6ff`, atmosphere intensity `20`, bump scale `5`, auto-rotate speed `0.3` (matches the current hero).
- Markers: `sampleMarkers` from `@/data/globe3d-markers`.
- Rounded section decoration: uses theme tokens (`rounded-3xl`, `border`, card/gradient background, theme shadow). Always applied (FR-008, FR-010).

## Layout constants (derived)

| Constant         | Value                                                            | Purpose                                                 |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| Globe container  | `size-120` (480px), scaled down (`size-56`/`size-64`) below `lg` | Fixed anchor for computing the overlap offset (FR-009). |
| Overlap offset   | `lg:-mr-[7.5rem]` ≈ 120px ≈ 25% of globe width                   | Content column overlaps the globe by ~1/4 (FR-011).     |
| Stack breakpoint | below `lg`                                                       | Two columns collapse to one; overlap disabled (FR-006). |

## Validation rules (derived from requirements)

- No required fields — all optional with defaults (assumption: config is edited in code).
- `alignment` must be one of `'left' | 'center'`; anything else falls back to `'left'` (typed at compile time, no runtime coercion needed).
- Interaction handlers must be functions when provided; type system enforces.
- Content must remain theme-consistent regardless of values (FR-008) — no per-value style branches.
