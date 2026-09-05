# Contract: WebSocket Plan Selection Protocol

**Kind**: WebSocket message protocol (client ↔ mocked backend over MSW).
**Endpoint**: `wss://plans.local/ws` (mock-only; intercepted by MSW `ws.link`).
**Encoding**: JSON string frames in both directions.

## Request (client → server)

```ts
interface SelectPlanRequest {
  type: "selectPlan";
  planId: string; // one of: 'starter' | 'pro' | 'enterprise'
}
```

## Response (server → client)

```ts
type PlanSelectionResponse =
  | { type: "success"; message: string; planId?: string }
  | { type: "inProgress"; message: string; planId?: string }
  | { type: "error"; message: string; planId?: string };
```

## Sequence

1. Client connects to `wss://plans.local/ws`; server accepts (`connection`).
2. Client sends `{ type: 'selectPlan', planId }`.
3. Server replies `{ type: 'inProgress', message: '...' }` (immediately or after short delay).
4. Server replies `{ type: 'success' | 'error', message: '...' }` (after simulated processing delay).
5. Terminal message re-enables all select buttons.

## CQS/error rules

- Every `selectPlan` request yields exactly one `inProgress` followed by exactly one terminal (`success` or `error`) response.
- On `inProgress`: all "Select Plan" buttons are disabled; no further `selectPlan` messages accepted until a terminal response.
- On unexpected connection close while `inProgress`: the pending selection is abandoned; the client surfaces a notify/error and the user must resubmit after reconnect.
- Unknown message types received by the client are ignored (defensively parsed; no `any`).

## Type ownership

Shared types live in `types/plan-message.ts` and are imported by both the client hook (`hooks/use-websocket-plan-selection.ts`) and the MSW handler (`mocks/handlers.ts`), so producer and consumer stay in sync.
