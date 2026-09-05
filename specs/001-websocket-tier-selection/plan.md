# Implementation Plan: WebSocket Tier Selection

**Branch**: `001-websocket-tier-selection` | **Date**: 2026-09-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-websocket-tier-selection/spec.md`

**Plan-time requirement from user**: Replace the REST API (`POST /api/plans/select`) with a WebSocket connection for tier selection, simulated with MSW. Use the existing `InfoPanel` component to surface messages. The backend responds with three message types — `success`, `inProgress`, `error`. While a selection is `inProgress`, disable all "Select Plan" buttons in the Pricing section until the backend sends a `success` or `error` message.

**Architecture requirement from user**: Create a WebSocket **Provider + Context** that wraps the whole application, so that any deeply nested component can consume it, and the underlying WebSocket connection is a **singleton instance** shared across the app.

## Summary

Swap the existing REST-based "Select Plan" mutation for a WebSocket-driven flow. A `WebSocketProvider` mounted once at the root (`app/providers.tsx`) establishes and owns a **singleton** WebSocket connection (mocked via MSW `ws.link`) and exposes it through `WebSocketContext`. Any component — including the deep `Pricing` section — consumes the connection through a `useWebSocket()` hook. On tier click the section sends a `selectPlan` message, and the UI is driven by the backend's three response messages. The existing `InfoPanel` component renders each message type (`success` / `inProgress` / `error`). While a selection is `inProgress`, every "Select Plan" button in the section is disabled until a terminal `success` or `error` message arrives. A persistent connection-status badge is shown near the Pricing header.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2.8, Next.js 16.3.0 (App Router, SSG `output: 'export'`)

**Primary Dependencies**: `msw` ^2.15.0 (WebSocket mocking via `ws.link()` + `@mswjs/interceptors`), `@tanstack/react-query` ^5.102.8 (mutations), existing `InfoPanel` (`components/info-panel.tsx`), lucide-react icons, Tailwind CSS 4 (shadcn `oklch` tokens). Dev/test: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@playwright/test`.

**Storage**: N/A — static landing page; nothing is persisted (same as current REST mock)

**Testing**: `vitest` ^5 (unit/component runner), `@testing-library/react` ^16 + `@testing-library/jest-dom` ^7 (component testing) with `jsdom`, and `@playwright/test` ^1.63 (e2e). Config: `vitest.config.ts` (jsdom environment, `@/` alias) and `playwright.config.ts` (Chromium). Test script `npm test` (vitest run) and `npm run test:e2e` (playwright). Co-located `*.test.ts(x)` per constitution IV. Per AGENTS.md, e2e runs only when explicitly requested.

**Target Platform**: Modern browsers — Chrome, Firefox, Safari, Edge (last 2 versions); standard mobile and desktop viewports

**Project Type**: Next.js web application (static landing page) with MSW mocks

**Performance Goals**: Connection lifecycle must not block initial paint; one persistent WebSocket connection reused across selections; no new runtime dependencies.

**Constraints**: No `any` types (constitution II); theme tokens only — reuse `--card`, `--background`, `--border`, etc. (constitution V); `InfoPanel` component reused as-is; `data/pricing.ts` tier data unchanged; button layout unchanged — only the communication mechanism and gating change.

**Scale/Scope**: Single Pricing section; three tiers; one mocked WebSocket endpoint; no real backend in this repo (static export).

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                       | Assessment                                                                                                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| I. Component-First Architecture | PASS — WebSocket provisioning is a self-contained provider component (`WebSocketProvider`) + context, consumed via a `useWebSocket()` hook; Pricing stays a presentation-focused section component; no monolithic state spread across the app.   |
| II. Type Safety                 | PASS — typed `SelectPlanRequest` / `PlanSelectionResponse` (discriminated union on `type`) shared between the provider, consumers, and the MSW handler; no `any`; context value fully typed and guarded.                                         |
| III. Performance-First          | PASS — singleton connection created once at the root and reused by all consumers; no per-component sockets, no polling, no new dependencies; Client Component boundary limited to the provider and consumers that require React state.           |
| IV. Testing Strategy            | PASS — vitest + @testing-library/react (component/unit) and @playwright/test (e2e) configured; message-handling reducer and context logic get co-located unit tests; e2e covers the full selection flow (run only when requested per AGENTS.md). |
| V. Code Quality                 | PASS — passes ESLint, `tsc --noEmit`, Prettier; husky pre-commit enforced; dead REST hook removed.                                                                                                                                               |

No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-websocket-tier-selection/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── websocket-plan-selection.md   # WebSocket message protocol contract
│   └── websocket-provider.md         # Provider / Context / useWebSocket UI contract
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── page.tsx                  # unchanged; renders <Pricing />
├── providers.tsx             # EDIT: wrap children in <WebSocketProvider> (alongside QueryClientProvider); MSW already started here
└── sections/
    └── pricing.tsx           # EDIT: consume useWebSocket(); InfoPanel for messages; disable all select buttons while inProgress; connection-status badge
components/
├── websocket-provider.tsx    # NEW: WebSocketContext + WebSocketProvider (singleton connection) + useWebSocket() hook
└── info-panel.tsx            # UNCHANGED: reused to render message type + text
hooks/
└── use-select-plan.ts        # DELETE: REST mutation superseded by WebSocket provider/context
types/
└── plan-message.ts           # NEW: shared SelectPlanRequest / PlanSelectionResponse types + parser guard
mocks/
├── browser.ts                # UNCHANGED: setupWorker(...handlers)
├── handlers.ts               # EDIT: add ws.link() WebSocket handler for the mocked endpoint; remove REST /api/plans/select mock
└── index.ts                  # UNCHANGED (or add WS error-mode toggle helper)
data/
└── pricing.ts                # UNCHANGED: tier data

# Test toolchain (NEW)
vitest.config.ts              # NEW: jsdom environment, @/ alias, setup file
setup-tests.ts                # NEW: @testing-library/jest-dom import, MSW node listener for tests
playwright.config.ts          # NEW: Chromium project, baseURL localhost:3000
e2e/
└── pricing.spec.ts           # NEW: e2e flow - select plan → inProgress disables → success
components/
└── websocket-provider.test.tsx   # NEW: provider/context unit tests
types/
└── plan-message.test.ts      # NEW: parse guard unit tests
```

**Structure Decision**: Single Next.js app project. A single `WebSocketProvider` (in `components/websocket-provider.tsx`) owns the singleton connection and exposes it via `WebSocketContext`; consumers (like `Pricing`) read it through the `useWebSocket()` hook exported from the same file. Shared message types live in `types/plan-message.ts`; the MSW WebSocket handler lives in the existing `mocks/handlers.ts`. Unit/component tests are co-located (`*.test.ts(x)`); e2e lives under `e2e/` run by Playwright.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — table intentionally empty.
