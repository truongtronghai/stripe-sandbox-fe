---
description: "Task list for WebSocket Tier Selection feature"
---

# Tasks: WebSocket Tier Selection

**Input**: Design documents from `/specs/001-websocket-tier-selection/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/websocket-plan-selection.md, contracts/websocket-provider.md

**Tests**: vitest + @testing-library/react for unit/component tests and @playwright/test for e2e are configured (Phase 1). Unit/component tests are co-located (`*.test.ts(x)`); e2e lives under `e2e/`. Per AGENTS.md, e2e runs only when explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js app project at repository root (`app/`, `components/`, `hooks/`, `mocks/`, `types/`, `e2e/`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm baseline project state and configure the test toolchain (vitest + React Testing Library + Playwright) before feature work begins

- [x] T001 Confirm baseline passes: run `npm run typecheck` and `npm run lint` from repo root; note any pre-existing errors before starting
- [x] T002 [P] Install dev dependencies: `npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @playwright/test`
- [x] T003 [P] Create `vitest.config.ts` with jsdom environment, `@/` alias (path resolution matching `tsconfig.json` paths), and `setup-tests.ts` as the setup file
- [x] T004 [P] Create `setup-tests.ts` importing `@testing-library/jest-dom/vitest`
- [x] T005 [P] Add test scripts to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:e2e": "playwright test"`
- [x] T006 [P] Create `playwright.config.ts` with a Chromium project, `baseURL: 'http://localhost:3000'`, and `npm run dev` as the webServer
- [x] T007 Install Playwright Chromium browser: `npx playwright install chromium`
- [x] T008 Run `npm test` (discovers any suites) and `npx playwright test --list` to confirm the toolchain is wired

**Checkpoint**: Baseline green and test toolchain ready (vitest, RTL, Playwright)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared WebSocket infrastructure that ALL user stories depend on — types, provider/context singleton, MSW mock, and their unit tests

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 [P] Create shared message types + parse guard in `types/plan-message.ts` (export `SelectPlanRequest`, `PlanSelectionResponse` discriminated union on `type`, and `parsePlanSelectionMessage(frame: unknown): PlanSelectionResponse | null` that JSON-parses and narrows; no `any`)
- [x] T010 [P] Create `types/plan-message.test.ts` covering `parsePlanSelectionMessage` with unit tests: valid `success`/`inProgress`/`error` frames parse, malformed JSON/unknown `type`/missing `message` return `null`, non-string frames return `null`
- [x] T011 [P] Create `mocks/handlers.ts` WebSocket mock using `ws.link('wss://plans.local/ws')`: on `connection`, read `{ type: 'selectPlan', planId }` frames; reply `inProgress` then after ~500ms `success`; remove the old `http.post('/api/plans/select')` handler. Keep `toggleErrorMode()` to make the terminal message return `error` (503-equivalent semantics)
- [x] T012 Create `components/websocket-provider.tsx` exporting `WebSocketContext`, `WebSocketProvider`, and `useWebSocket()`: singleton connection created once in a ref (HMR-guarded), `status` ('connecting' | 'connected' | 'disconnected' | 'reconnecting'), `lastMessage`, `isProcessing` (true while lastMessage type is 'inProgress' or pending), `send(planId)` (no-op unless `readyState === OPEN`), `reconnect()`; throw descriptive error when `useWebSocket()` used outside provider
- [x] T013 [P] Create `components/websocket-provider.test.tsx`: mock the `WebSocket` global (or use MSW ws) and assert `useWebSocket()` throws outside provider, `status` transitions to `connected` on open, `send` is a no-op when not connected, and terminal messages clear `isProcessing`
- [x] T014 Wire `<WebSocketProvider>` into `app/providers.tsx` wrapping children inside `QueryClientProvider` (MSW still started in the same mount effect, before render)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Primary Flow (Priority: P1) 🎯 MVP

**Goal**: User clicks "Select Plan", sees inProgress (all buttons disabled), then a success confirmation

**Independent Test**: Component test renders Pricing (wrapped in provider with a mocked socket) — click "Select Plan" → InfoPanel shows spinner `inProgress`, all buttons disabled; on `success` message buttons re-enable and success text shows. E2E verifies no `POST /api/plans/select` network call.

### Tests for User Story 1

- [x] T015 [P] [US1] Component test in `app/sections/pricing.test.tsx`: renders Pricing inside `WebSocketProvider` (socket mocked in test mode); click Starter → all "Select Plan" buttons disabled + InfoPanel inProgress visible; emit `success` → buttons re-enabled + success message visible
- [x] T016 [P] [US1] E2E test in `e2e/pricing.spec.ts`: on `http://localhost:3000` scroll to Pricing, click "Select Plan" on a tier, expect all buttons disabled during processing, expect success InfoPanel after ~500ms, and assert no `POST /api/plans/select` request was made

### Implementation for User Story 1

- [x] T017 [US1] Replace `useSelectPlan()` REST mutation usage in `app/sections/pricing.tsx` with `useWebSocket()` from `@/components/websocket-provider` (remove import of `@/hooks/use-select-plan`)
- [x] T018 [US1] Update `handleSelect` in `app/sections/pricing.tsx` to call `send(planId)` from the WebSocket context and set `selectedTier` local state
- [x] T019 [US1] Render `<InfoPanel>` in `app/sections/pricing.tsx` bound to `lastMessage` from context: map `success` → `type="success"`, `inProgress` → `type="inProgress"`, `error` → `type="error"`, `message` from the message; show default in-progress panel while connecting (no message yet)
- [x] T020 [P] [US1] Disable ALL tier "Select Plan" buttons when `isProcessing` is true (or `status` is not connected) in `app/sections/pricing.tsx`; keep per-tier "Selecting..." text only for the clicked tier
- [x] T021 [US1] Delete `hooks/use-select-plan.ts` (REST mutation superseded; no dangling imports remain)

**Checkpoint**: User Story 1 fully functional — success path works end-to-end with all buttons disabled during inProgress; unit/component/e2e tests pass

---

## Phase 4: User Story 2 - Error Flow (Priority: P2)

**Goal**: When the backend sends `error`, the InfoPanel shows the error, buttons re-enable, and the user can retry

**Independent Test**: Component test with mocked socket emitting `error` → InfoPanel shows error; all buttons re-enabled; clicking again sends a new `selectPlan`.

### Tests for User Story 2

- [x] T022 [P] [US2] Component test in `app/sections/pricing.test.tsx`: after clicking, emit `error` message → error InfoPanel visible, all buttons re-enabled, next click triggers a new `selectPlan` send

### Implementation for User Story 2

- [x] T023 [US2] Ensure the mock error path returns a valid `{ type: 'error', message, planId }` frame from `mocks/handlers.ts` (wire to existing `toggleErrorMode()`), terminal message always follows `inProgress`
- [x] T024 [US2] Verify `app/sections/pricing.tsx` / `components/websocket-provider.tsx` reset `isProcessing` to false after an `error` message (buttons re-enable); fix provider state logic if `isProcessing` does not clear on terminal messages

**Checkpoint**: User Story 2 complete — error path recovers cleanly and retry works

---

## Phase 5: User Story 3 - Reconnection & Status (Priority: P3)

**Goal**: Connection drop triggers auto-reconnect with backoff; persistent status badge shows state; in-flight selection is abandoned and user resubmits

**Independent Test**: Unit test on the provider — simulate `onclose` while `inProgress` → status becomes `reconnecting`, in-flight message set to notify; assert reconnect backoff steps and that `send` stays a no-op until `connected`. E2E verifies badge states.

### Tests for User Story 3

- [x] T025 [P] [US3] Unit test in `components/websocket-provider.test.tsx`: simulate `onclose` during `inProgress` → status `reconnecting`, lastMessage set to "Connection lost" notify; advocate backoff attempts escalate (1s → 2s → 4s → 5s) and stop on `onopen`; `send()` no-op until connected

### Implementation for User Story 3

- [x] T026 [US3] Implement reconnect-with-backoff in `components/websocket-provider.tsx`: on `onclose`/`onerror` transition to `reconnecting`, clear pending selection, try reconnect at 1s → 2s → 4s → 5s (capped), stop on successful `onopen`
- [x] T027 [US3] Surface in-flight abandonment: when the connection drops while the last message is `inProgress`, set lastMessage to an error/notify message ("Connection lost; please try again") so the InfoPanel informs the user
- [x] T028 [P] [US3] Add persistent connection-status badge near the Pricing header in `app/sections/pricing.tsx` reflecting `status` from context (connected / connecting / disconnected / reconnecting) using theme tokens only
- [x] T029 [US3] Confirm `send()` is a no-op (and buttons effectively disabled) when `status` is not `connected` in `components/websocket-provider.tsx` / `app/sections/pricing.tsx`

**Checkpoint**: User Story 3 complete — connection lifecycle fully handled

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, cleanup, and docs

- [x] T030 Run `npm run typecheck` and fix any type errors (no `any`)
- [x] T031 Run `npm run lint` and fix any lint errors
- [x] T032 Run `npm run format` (Prettier) across changed files
- [x] T033 Run `npm test` and fix any failing unit/component tests
- [x] T034 Run `npm run build` (production build must succeed with `output: 'export'`)
- [ ] T035 [P] Run the Playwright e2e suite (`npm run test:e2e`) and fix failures — run only when explicitly requested per AGENTS.md
- [ ] T036 Execute remaining manual validation scenarios in `specs/001-websocket-tier-selection/quickstart.md` that e2e does not cover (SC-3 error toggle, SC-4 forced disconnect) via `npm run dev`
- [x] T037 Update `mocks/index.ts` if a WS-specific error-mode toggle helper is needed for testing (keep the existing commented toggle pattern)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies (T002–T007 are [P], T008 depends on T002/T005/T007)
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories (T012 depends on T009; T014 depends on T012; T009/T010/T011 are [P])
- **User Stories (Phase 3+)**: All depend on Phase 2
  - US1 (Phase 3): depends on T012, T014, and MSW handler (T011)
  - US2 (Phase 4): depends on US1 (shares Pricing/InfoPanel), T011
  - US3 (Phase 5): depends on US1 (Pricing badge), T012 (provider lifecycle)
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — no deps on other stories
- **User Story 2 (P2)**: After US1 — extends the same Pricing file
- **User Story 3 (P3)**: After US1 (badge in Pricing) — extends provider

### Within Each User Story

- Tests written first, assert they fail (red), then implement (green)
- Foundation types before provider
- Provider before wiring into app
- Provider + MSW handler before UI consumption
- Core implementation before e2e validation

### Parallel Opportunities

- Phase 1: T002–T007 are independent → [P]
- Phase 2: T009 (types), T010 (types test), T011 (MSW handler) independent → [P]; T013 (provider test) parallel to T014 (app wiring) after T012
- US1: T015 (pricing test) and T016 (e2e) parallel; T020 (disable buttons) parallel to T017/T018/T019 (same file edits are sequential otherwise)
- US3: T025 (provider reconnect test), T026/T027 (provider), T028 (badge in pricing) — T028 independent file → [P]
- Different user stories can be worked on in parallel by different team members after Phase 2

---

## Parallel Example: US1

```bash
# Component test + e2e (parallel):
Task: "T015 Component test in app/sections/pricing.test.tsx"
Task: "T016 E2E test in e2e/pricing.spec.ts"

# After T017/T018/T019 (sequential pricing edits):
Task: "T020 Disable all buttons while isProcessing in app/sections/pricing.tsx"
Task: "T021 Delete hooks/use-select-plan.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001–T008) — test toolchain
2. Complete Phase 2 (T009–T014) — foundation blocks everything
3. Complete Phase 3 (T015–T021) — User Story 1 (success path + tests)
4. **STOP and VALIDATE**: `npm test`, `npm run typecheck`, `npm run build`
5. Demo-ready MVP

### Incremental Delivery

1. Foundation → provider/context of the singleton connection works, unit-tested
2. US1 → success path with inProgress gating (MVP!)
3. US2 → error path recovery
4. US3 → reconnection + status badge
5. Polish phase → full static + unit + (requested) e2e verification

---

## Notes

- The WebSocket endpoint is `wss://plans.local/ws` (mock-only, intercepted by MSW `ws.link`); see `contracts/websocket-plan-selection.md`.
- Provider/context contract: `contracts/websocket-provider.md`.
- InfoPanel already exists (`components/info-panel.tsx`) — reuse as-is, do not modify.
- `data/pricing.ts` tier data and card layout remain unchanged.
- Vitest config must resolve the `@/` alias identically to `tsconfig.json` paths for tests to import app modules.
- Playwright e2e requires the dev server (config `webServer`) and Chromium installed.
- Avoid: `any` types, per-file parallel edits, leaving `use-select-plan.ts` imports dangling.
