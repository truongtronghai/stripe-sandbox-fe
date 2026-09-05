# Landing Page Design Spec

**Date**: 2026-09-04  
**Feature Branch**: `001-landing-page`  
**Spec**: `specs/001-landing-page/spec.md`

## Overview

Single-page landing page built with Next.js 16, ShadCn (base-nova), Tanstack Query, and MSW. All sections rendered on one route with smooth-scroll navigation. Pricing tier selection calls a mocked backend API.

## Data Layer

### Seed Data

All static content stored as TypeScript constants in `data/`:

- `data/pricing.ts` — 3 tiers: `{ id, name, price, features: string[], isRecommended: boolean }`
- `data/features.ts` — 3-6 items: `{ icon, title, description }`
- `data/testimonials.ts` — customer quotes: `{ name, quote, company, avatar }`

Content is placeholder initially, designed to be easily swappable later.

### API Contract

Single endpoint for plan selection:

```
POST /api/plans/select
Request:  { planId: string }
Response: { success: true, planId: string, message: string }  // success
          { success: false, error: string }                     // error
```

### MSW Mock

- Handler: `POST /api/plans/select` in `mocks/handlers.ts`
- Default: returns success after 500ms simulated delay
- Error mode: toggleable via module-level flag or `HttpResponse.error()`
- Browser setup in `mocks/browser.ts`, initialized in root layout

### Tanstack Query

Single `useMutation` hook in `hooks/use-select-plan.ts`:

- Calls `POST /api/plans/select`
- Returns `{ mutate, isPending, isSuccess, isError, error, data }`
- No query caching — mutation-only action

## UI Components

ShadCn native components installed via `npx shadcn@latest add`:

| Component      | Purpose                                              |
| -------------- | ---------------------------------------------------- |
| `button`       | CTA buttons, nav items (already installed)           |
| `card`         | Pricing tier cards, feature cards, testimonial cards |
| `badge`        | "Recommended" label on middle pricing tier           |
| `theme-toggle` | Light/dark mode toggle in navbar                     |

No wrapper components — all imported directly from `@/components/ui/`.

## Layout & Sections

```
page.tsx
├── <Navbar />          — fixed top (desktop) / fixed bottom (mobile)
├── <Hero />            — headline + CTA button
├── <Features />        — grid of feature cards
├── <Pricing />         — 3 Shadcn Card components, middle one highlighted
├── <Testimonials />    — customer quote cards
└── <Footer />          — copyright, email, links
```

### Navigation

- Smooth scroll via `element.scrollIntoView({ behavior: 'smooth' })`
- Active section detected via Intersection Observer
- Active state reflected in navbar (bold/highlighted menu item)

### Responsive Behavior

- **Desktop (≥768px)**: Fixed top navbar with text menu items
- **Mobile (<768px)**: Fixed bottom navbar with icons + labels, no top navbar

### Theme Toggle

- Toggles `.dark` class on `<html>` element via `document.documentElement.classList.toggle('dark')`
- No persistence — resets on page refresh
- Uses ShadCn's built-in CSS variables for light/dark theming

## Loading States

Simple CSS skeleton placeholders using Tailwind:

- `animate-pulse` with gray background blocks
- Matches each section's visual shape
- Shown until content "loads" (simulated delay or immediate)

## File Structure

```
app/
├── layout.tsx          # QueryClientProvider + MSW init
├── page.tsx            # Compose all sections
├── globals.css         # Existing (no changes)
└── sections/
    ├── navbar.tsx
    ├── hero.tsx
    ├── features.tsx
    ├── pricing.tsx
    ├── testimonials.tsx
    └── footer.tsx
data/
├── pricing.ts
├── features.ts
└── testimonials.ts
hooks/
└── use-select-plan.ts
mocks/
├── browser.ts          # MSW browser setup
├── handlers.ts         # POST /api/plans/select
└── index.ts            # Export startMocking
components/ui/          # ShadCn components (card, badge, etc.)
```

## Key Decisions

| Decision            | Choice                        | Rationale                                                                |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| Component structure | Flat (`app/sections/`)        | Matches existing flat Next.js structure; no feature nesting needed yet   |
| Seed data location  | `data/` directory             | Separates content from components; easy to swap later                    |
| Theme persistence   | None                          | Per user preference; Shadn CSS variables handle theming                  |
| Loading skeletons   | CSS `animate-pulse`           | User preference over ShadCn skeleton component                           |
| API mocking         | MSW browser mode              | Already installed; simulates real backend accurately                     |
| State management    | Tanstack Query mutations only | No global state needed; pricing selection is the only server interaction |
