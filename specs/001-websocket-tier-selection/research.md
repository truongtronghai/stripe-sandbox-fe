# Research: WebSocket Tier Selection

Scope: resolve design decisions for replacing the REST plan-selection call with an MSW-mocked WebSocket flow, using the existing `InfoPanel` component, and gating all select buttons during the `inProgress` state.

## Decision 1: Mocking approach — MSW WebSocket vs. real server

**Decision**: Use MSW's WebSocket mocking via `ws.link('<url>')` in the existing `mocks/handlers.ts`, served by the same `setupWorker` already bootstrapped in `app/providers.tsx`.

**Rationale**: MSW ^2.15.0 and its bundled `@mswjs/interceptors` fully support WebSocket interception in the browser (`ws.link`, `.addEventListener('connection', ...)`, `client.send`, `client.addEventListener`). The project already starts the worker in `Providers` and gates rendering on `startMocking()`, so adding a WS handler requires no new dependency or bootstrap path. Since `next.config.ts` uses `output: 'export'` there is no backend to host a real WebSocket server; a mock is the only practical choice in this repo, and the spec explicitly mandates simulating the backend with MSW (FR-10).

**Alternatives considered**:

- Real Node WebSocket server (`ws` package) via a Next API route: impossible with `output: 'export'` (no server runtime). Rejected.
- `socket.io-client` + custom server: heavy new dependency and a backend requirement; rejected.
- Keep REST + add polling: contradicts the explicit requirement to replace REST with WebSocket. Rejected.

## Decision 2: Connection URL and message framing

**Decision**: Use a dedicated mocked endpoint `wss://plans.local/ws` (or equivalent stable string) as the `ws.link` target, and frame application messages as JSON strings.

**Rationale**: MSW `ws.link` matches a URL; a distinct, stable URL keeps the mock self-contained and avoids colliding with any real domain. The browser `WebSocket` API sends strings or `ArrayBuffer`; JSON strings are the simplest cross-layer framing and align with the existing REST mock's JSON payloads. `JSON.stringify` on send and `JSON.parse` on receive (guarded) keeps the code typed and explicit.

**Alternatives considered**:

- Binary frames (`Blob`/`ArrayBuffer`): unnecessary overhead for a small typed payload; rejected.

## Decision 3: Message protocol — three typed responses

**Decision**: Define a discriminated union keyed on `type`:

```
type PlanSelectionMessage =
  | { type: 'success'; message: string; planId?: string }
  | { type: 'inProgress'; message: string; planId?: string }
  | { type: 'error'; message: string; planId?: string };
```

The client sends `{ type: 'selectPlan'; planId: string }`, and the mocked backend responds with an `inProgress` message first, then a terminal `success` or `error` after a simulated delay.

**Rationale**: The spec (FR-3) requires exactly three backend message types — `success`, `inProgress`, `error` — each carrying a user-facing message. A discriminated union gives exhaustive type narrowing (constitution II: no `any`), and the `InfoPanel` maps `type` directly to `'success' | 'inProgress' | 'error'`. The client distinguishes running vs. terminal states purely by the `type` field.

**Alternatives considered**:

- Undefined union or `status: string` with stringly-typed values: loses exhaustiveness and type safety. Rejected.
- Only sending a final success/error (no inProgress): contradicts FR-4 (all buttons disabled while `inProgress`). Rejected.

## Decision 4: Disabling all select buttons during `inProgress`

**Decision**: Derive a single boolean `isProcessing = lastMessage?.type === 'inProgress'` (plus an unresolved initiating state) and apply `disabled={isProcessing}` to every tier's "Select Plan" button; also disable while pending-reconnect or connecting so no request is sent over a dead connection.

**Rationale**: FR-4 / FR-7 require that once the backend reports `inProgress`, ALL select buttons are disabled until a `success` or `error` arrives. Computing a single derived boolean from the hook's state and applying it to all buttons is minimal and consistent. The button text can remain "Selecting..." only for the just-clicked tier, or simply show disabled on all — matching the requirement that all are disabled.

**Alternatives considered**:

- Disable only the clicked tier: violates FR-4 ("all select buttons ... disabled").
- Track per-tier pending flags: over-engineering; the requirement is global gating. Rejected.

## Decision 5: InfoPanel usage & default connecting state

**Decision**: Render a single `InfoPanel` in the Pricing section whose `type`/`message` derive from hook state: `'inProgress'` + default/connecting message while connecting or pending, `'success'` when the last message is success, `'error'` when error. Show nothing (or a neutral panel) before any selection, per UX.

**Rationale**: The spec mandates using `InfoPanel` for connection/working messages (plan-time requirement; FR-5). The component already renders the three types with matching icons (check/spinner/error). A single panel bound to the latest message keeps state simple and matches the clarified edge case ("InfoPanel shows a default in-progress message while connecting").

**Alternatives considered**:

- Multiple InfoPanels per state: redundant; one panel reflecting current state is cleaner and matches the plan-time requirement.
- Reusing the old green/red banner markup: the user explicitly asked to use `InfoPanel`; the banner is replaced. Selected InfoPanel.

## Decision 6: Reconnection & in-flight abandonment

**Decision**: On `onclose`/error, the hook flips to a "disconnected/reconnecting" state, clears the pending selection, and attempts reconnect with backoff (e.g., 1s → 5s capped). Any `inProgress` selection in flight at drop is abandoned and surfaced as an error/notify, per the clarified behavior.

**Rationale**: Matches the clarify session (in-flight abandoned and user re-submits; persistent status indicator). A clearable reconnect timer avoids unbounded retries and keeps the UI usable (FR-6, FR-8).

**Alternatives considered**:

- Auto-resend the pending request on reconnect: explicitly rejected in clarify (option A chosen).
- No backoff: risks hammering; rejected.

## Decision 7: React Query usage

**Decision**: Drop `useMutation` from `@tanstack/react-query` for this flow; drive the selection through the WebSocket context's own state (last message, status). Keep the existing REST `use-select-plan.ts` removed.

**Rationale**: React Query's mutation API is built around one-shot HTTP requests; a persistent WebSocket stream with push messages is a different model better served by the provider-held connection state and the `useWebSocket()` consumer hook. Removing the REST hook and its MSW handler prevents dead/confusing code (constitution V: dead code removed promptly).

**Alternatives considered**:

- Wrap WS in a React Query mutation: awkward — Query doesn't own the connection lifecycle or handle server-push `inProgress`. Rejected.

## Decision 8: Application-wide Provider + Context with a singleton connection

**Decision**: Introduce a `WebSocketProvider` component + `WebSocketContext` mounted once at the root (`app/providers.tsx`), owning the singleton WebSocket instance. All state derived from the connection (`status`, `lastMessage`, `isProcessing`) lives in the provider; any deeply nested component consumes it via the `useWebSocket()` hook exported from the same module.

**Rationale**:

- The user explicitly requires a provider/context wrapping the whole app so future deep components can reuse the connection, and a singleton instance (one socket shared app-wide).
- A single provider guarantees exactly one `WebSocket` connection for the app's lifetime; consumers never create their own sockets.
- React Context is the idiomatic cross-tree primitive for this; the provider holds the connection in a ref (created once) and exposes reactive state via `useState`.
- Keeps `Pricing` presentation-focused: it only reads `useWebSocket()` and renders — no socket lifecycle code in the section.

**Alternatives considered**:

- Per-hook connection (`use-websocket-plan-selection.ts`): creates its own socket each mount; violates the singleton requirement and doesn't support arbitrary deep consumers. Rejected in favour of the provider/context design.
- Module-level exported singleton (imperative, no Context): works, but bypasses React reactivity; consumers would need manual subscriptions. Rejected — Context gives automatic re-render on state change.
- Singleton instance stored in `useRef` inside the provider: selected. The ref preserves the connection across re-renders while remaining scoped to the single mounted provider instance (effectively app-singleton since `Providers` mounts once).

**Implementation notes (bounded)**:

- `WebSocketProvider` is a `'use client'` component. It runs in `app/providers.tsx` which is already a client component — no architecture change needed.
- The connection is created in a mount `useEffect` (guarded against HMR double-invoke) and stored in `useRef<WebSocket | null>`. `onopen`/`onmessage`/`onclose`/`onerror` handlers update provider state.
- The context value exposes: `status`, `lastMessage`, `isProcessing`, `send(planId)` (serializes + guards `readyState === OPEN`), and reconnect handling.
- A defensive `parsePlanSelectionMessage` guard (in `types/plan-message.ts`) validates incoming frames and narrows to the discriminated union, returning `null` for unknown shapes — no `any` (constitution II).

## Open items (none blocking)

- No `[NEEDS CLARIFICATION]` remain. All spec ambiguities were resolved during `/speckit.clarify` and the plan-time requirements (InfoPanel, three message types, disable-all-while-inProgress, MSW simulation).
