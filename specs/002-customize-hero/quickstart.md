# Quickstart: Validating Hero Customization

Validates that the Hero renders configurable content, supports the rounded decorated section with ~1/4 column overlap, and passes the project's static checks.

## Prerequisites

- Node.js + npm installed
- Dependencies present (`npm install` if `node_modules` is missing)

## Setup

```bash
# 1. Start the dev server
npm run dev
```

## Validation scenarios

### SC-001 / FR-001..003 — Custom content renders

1. Edit `app/sections/hero.tsx` temporarily (or wire `app/page.tsx` to `config={{ heading: 'Custom Headline', subtitle: 'Custom copy.', primaryCtaLabel: 'CTA One', secondaryCtaLabel: 'CTA Two' }}`).
2. Open `http://localhost:3000`.
3. **Expected**: the `h1`, subtitle, and both buttons show the configured value; buttons do not navigate on click.

### SC-002 / FR-004 — Globe toggle

1. Set `config={{ showGlobe: false }}`.
2. Reload.
3. **Expected**: globe disappears; content spans the full panel width with no layout shift beyond immediate reflow.

### SC-003 / SC-004 / FR-010 / FR-011 — Rounded panel + overlap + responsive

1. Set `config={{ showGlobe: true }}` (default).
2. At a wide viewport (≥1024px), **Expected**: hero content sits inside a rounded, bordered, themed panel; content column overlaps the globe's left ~25%, text readable (z-order above globe); no horizontal scrolling.
3. Shrink below `lg` (~768–1023px), **Expected**: columns stack, globe remains visible but scaled down, overlap gone, no overflow/clipping.
4. Toggle dark mode (theme switch), **Expected**: panel/borders/text follow the dark palette (no hard-coded colors).

### SC-005 / FR-007 — Interaction handlers wire correctly

1. Temporarily pass `onMarkerClick={(m) => console.log('clicked', m.label)}` and `onMarkerHover={(m) => console.log('hover', m?.label)}`.
2. Hover and click visible markers in the globe's uncovered area.
3. **Expected**: corresponding console output fires with correct marker data.

## Static verification (required before completion)

```bash
npm run typecheck   # tsc --noEmit — must pass (no `any`)
npm run lint        # eslint — must pass
npm run format      # prettier — keep consistent formatting
npm run build       # production build must succeed
```

## References

- Config shape & defaults: [contracts/hero-config.md](./contracts/hero-config.md)
- Entity fields & validation: [data-model.md](./data-model.md)
- Design decisions (overlap technique, themed panel): [research.md](./research.md)
