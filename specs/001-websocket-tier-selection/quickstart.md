# Quickstart: Validating WebSocket Tier Selection

Validates that clicking "Select Plan" drives the selection over a mocked WebSocket (MSW), surfaces messages through `InfoPanel`, disables all select buttons during `inProgress`, and passes the project's static checks.

## Prerequisites

- Node.js + npm installed
- Dependencies present (`npm install` if `node_modules` is missing)

## Setup

```bash
# 1. Start the dev server
npm run dev
```

## Validation scenarios

### SC-1 / FR-1, FR-2, FR-3, FR-5 — Singleton connection, send, and receive success

1. Open `http://localhost:3000` (the app mounts `<WebSocketProvider>` at the root).
2. **Expected**: a single WebSocket connection to the mocked endpoint is established once when the app loads (visible in DevTools → Network → WS); the Pricing section shows a connection-status badge when scrolled to it; a default in-progress `InfoPanel` shows while connecting.
3. Click "Select Plan" on any tier (e.g., Starter).
4. **Expected**: all "Select Plan" buttons become disabled; the `InfoPanel` switches to the `inProgress` message (spinner icon).
5. After the simulated delay, **Expected**: the `InfoPanel` shows the `success` message (check icon); all buttons are re-enabled; the selected tier is highlighted from local state.

### SC-2 / FR-4, FR-7 — All buttons disabled during `inProgress`

1. Click "Select Plan" on the Professional tier.
2. Immediately attempt to click "Select Plan" on the Enterprise tier while the first is processing.
3. **Expected**: the Enterprise button is disabled during `inProgress`; no duplicate/second request is sent; only one terminal response arrives.

### SC-3 / FR-4, FR-8 — Error path re-enables buttons

Error simulation is toggled in the mock (see `mocks/index.ts` `toggleErrorMode` or a WS-specific toggle).

1. Enable error mode, reload, and click "Select Plan".
2. **Expected**: `inProgress` disables buttons; the backend then sends `error`; the `InfoPanel` shows the error message (error icon); all buttons re-enable so the user can retry.

### SC-4 / FR-6, FR-9 — Reconnection & in-flight abandonment

1. Connect, then force a disconnect (e.g., stop the mock server or trigger `onclose`) while a selection is `inProgress`.
2. **Expected**: the status badge shows reconnecting; the pending selection is abandoned; an error/notify message is shown; after reconnect the badge returns to connected and the user can select again.

### SC-5 / REST removed — no leftover REST call

1. Open DevTools → Network and click "Select Plan".
2. **Expected**: no `POST /api/plans/select` request appears; the only traffic is the WebSocket connection to the mocked endpoint.

## Static verification (required before completion)

```bash
npm run typecheck   # tsc --noEmit — must pass (no `any`)
npm run lint        # eslint — must pass
npm run format      # prettier — keep consistent formatting
npm test            # vitest — unit/component tests must pass
npm run build       # production build must succeed
npm run test:e2e    # playwright (optional, run when explicitly requested)
```

## References

- Message protocol & sequence: [contracts/websocket-plan-selection.md](./contracts/websocket-plan-selection.md)
- Provider / Context / `useWebSocket` contract: [contracts/websocket-provider.md](./contracts/websocket-provider.md)
- Entities, states & validation: [data-model.md](./data-model.md)
- Design decisions (MSW WebSocket, message union, provider singleton, disable gating): [research.md](./research.md)
