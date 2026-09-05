# Data Model: WebSocket Tier Selection

## Entities & message types

### `PlanSelectionRequest` (client → server)

| Field    | Type                   | Notes                                                         |
| -------- | ---------------------- | ------------------------------------------------------------- |
| `type`   | literal `'selectPlan'` | Fixed message kind.                                           |
| `planId` | `string`               | The selected tier id — one of `starter`, `pro`, `enterprise`. |

### `PlanSelectionResponse` (server → client)

A discriminated union on `type`. All variants carry a user-facing `message` and may carry `planId`.

```ts
type PlanSelectionResponse =
  | { type: "success"; message: string; planId?: string }
  | { type: "inProgress"; message: string; planId?: string }
  | { type: "error"; message: string; planId?: string };
```

| `type`       | Meaning                                                | Driving behaviour                                                                         |
| ------------ | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `inProgress` | The backend received the request and is processing it. | Show `InfoPanel` with `inProgress`; **disable all select buttons** (FR-4 / FR-7).         |
| `success`    | The selection completed successfully.                  | Show `InfoPanel` with `success`; re-enable all select buttons (FR-3).                     |
| `error`      | The selection failed.                                  | Show `InfoPanel` with `error`; re-enable all select buttons so the user can retry (FR-4). |

### Hook state derived from messages

| Field          | Type                                                              | Notes                                                                          |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `status`       | `'connecting' \| 'connected' \| 'disconnected' \| 'reconnecting'` | Connection lifecycle (FR-1, FR-6).                                             |
| `lastMessage`  | `PlanSelectionResponse \| null`                                   | Most recent server message; null before the first response.                    |
| `isProcessing` | `boolean`                                                         | `true` when selection is `inProgress` (or pending-connect) → disables buttons. |

## State transitions

```text
             connect()          send({selectPlan})
  connecting ─────────► connected ─────────────► inProgress ──► success (terminal)
       │                    │                        │              │
       │ (onclose/error)    │ (onclose/error)         │              │
       ▼                    ▼                        ▼              ▼
  reconnecting ◄─────────── disconnect ─────────► inProgress {pending dropped} ─► error/notify
```

- `connecting` → `connected`: WebSocket `onopen`.
- `connected` → `inProgress`: server sends `{type:'inProgress'}` after receiving `selectPlan`.
- `inProgress` → `success` or `error`: server sends a terminal message; buttons re-enable.
- any → `disconnected` → `reconnecting`: `onclose`/error; pending `inProgress` selection is abandoned (clarify: abandon and notify).
- `reconnecting` → `connected`: successful reconnect (with capped backoff).

## Validation rules (derived from requirements)

- `planId` must be one of the ids present in `data/pricing.ts`; enforced at the type level and validated in the mock handler.
- The mock backend must always emit `inProgress` before the terminal `success`/`error` for a given `selectPlan` (so all buttons disable).
- `isProcessing` must be `true` whenever the latest message is `inProgress`; buttons `disabled` reflects this exactly.
- Reconnection uses capped exponential backoff (1s → 5s max) and stops on successful reconnect.
- Only one selection is in flight at a time: while `inProgress`, subsequent clicks are blocked by disabled buttons (FR-4, FR-7).

## Persistence

None — the model exists only over the WebSocket session and in React state; nothing is written to storage (static landing page).

## WebSocket context (application-wide singleton)

Owned by the single `WebSocketProvider` mounted in `app/providers.tsx`. The provider creates the connection once (stored in a ref, scoped to the single provider instance) and exposes reactive state to all consumers through `WebSocketContext`.

| Exposed field  | Type                                                              | Notes                                                                                    |
| -------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `status`       | `'connecting' \| 'connected' \| 'disconnected' \| 'reconnecting'` | Connection lifecycle (FR-1, FR-6).                                                       |
| `lastMessage`  | `PlanSelectionResponse \| null`                                   | Most recent server message.                                                              |
| `isProcessing` | `boolean`                                                         | `true` while selection is `inProgress` or pending connect → disables all select buttons. |
| `send`         | `(planId: string) => void`                                        | Sends `SelectPlanRequest`; no-op when `readyState !== OPEN`.                             |
| `reconnect`    | `() => void`                                                      | Explicitly triggers reconnect if `disconnected`.                                         |

**Singleton guarantees**:

- Exactly one `WebSocket` connection for the app lifetime — consumers never instantiate sockets.
- The connection is created once in the provider's mount effect (HMR-guarded) and reused across all selection attempts.
- Any component importing `useWebSocket()` (from the same module) re-renders when `status` / `lastMessage` change, without additional wiring.
