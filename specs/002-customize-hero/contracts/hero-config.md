# UI Contract: Hero Component

**Component**: `Hero` (exported from `app/sections/hero.tsx`)
**Contract kind**: React component props contract (UI component; no external wire protocol).

## Props

```ts
interface HeroProps {
  /** Optional configuration; each field defaults to a sensible value if omitted. */
  config?: Partial<HeroConfig>;
}
```

## Shape

```ts
/**
 * Configuration driving Hero rendering. All fields optional; the component
 * merges them over built-in defaults.
 */
interface HeroConfig {
  /** Headline rendered as the <h1>. */
  heading: string;
  /** Supporting paragraph below the headline. */
  subtitle: string;
  /** Primary call-to-action label. Presentational only — does not navigate. */
  primaryCtaLabel: string;
  /** Secondary call-to-action label. Presentational only — does not navigate. */
  secondaryCtaLabel: string;
  /** Whether to render the 3D globe column. */
  showGlobe: boolean;
  /** Content arrangement: side-by-side two-column ('left') or centered single column. */
  alignment: 'left' | 'center';
  /** Invoked when a globe marker is clicked. */
  onMarkerClick: (marker: GlobeMarker) => void;
  /** Invoked when a globe marker is hovered or unhovered. */
  onMarkerHover: (marker: GlobeMarker | null) => void;
}
```

`GlobeMarker` comes from `@/components/ui/3d-globe` (`{ lat, lng, src, label?, size? }`).

## Defaults (when props omitted)

| Config key          | Default                     |
| ------------------- | --------------------------- |
| `heading`           | `'Build Something Amazing'` |
| `subtitle`          | Current hero subtitle copy  |
| `primaryCtaLabel`   | `'Get Started'`             |
| `secondaryCtaLabel` | `'Learn More'`              |
| `showGlobe`         | `true`                      |
| `alignment`         | `'left'`                    |
| `onMarkerClick`     | no-op                       |
| `onMarkerHover`     | no-op                       |

`<Hero />` with no props must render exactly as today (backwards-compatible default).

## Return value

Renders an accessible `<section id="hero">` containing the decorated rounded panel with the content column and (optionally) the globe column, overlapping ~25% of globe width at `lg+`.

## Behavior rules

- Buttons render labels only; clicking never navigates (FR-003).
- Toggling `showGlobe` to `false` yields a full-width content column (FR-004).
- The rounded/painted panel uses theme tokens only — light and dark mode safe (FR-008).
- Content column sits above the globe (`z-10`) at `lg+` (FR-011).
