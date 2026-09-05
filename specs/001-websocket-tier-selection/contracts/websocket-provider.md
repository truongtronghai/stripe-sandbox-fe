# UI Contract: WebSocketProvider / WebSocketContext / useWebSocket

**Kind**: React context + provider component contract (application-wide singleton connection).
**Location**: `components/websocket-provider.tsx` (single file exporting all three).
**Rendered once**: `WebSocketProvider` mounted inside `app/providers.tsx`, wrapping the whole app.

## Provider

```tsx
import { WebSocketProvider } from "@/components/websocket-provider";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>{children}</WebSocketProvider>
    </QueryClientProvider>
  );
}
```

`WebSocketProvider` is a `'use client'` component. It creates exactly one `WebSocket` connection on mount (stored in a ref, HMR-guarded) and tears it down on unmount.

## Context value (what consumers read)

```ts
interface WebSocketContextValue {
  status: "connecting" | "connected" | "disconnected" | "reconnecting";
  lastMessage: PlanSelectionResponse | null;
  isProcessing: boolean;
  send: (planId: string) => void;
  reconnect: () => void;
}
```

## Consumer hook

```ts
// any deeply nested client component
const { status, lastMessage, isProcessing, send } = useWebSocket();
```

- `useWebSocket()` throws a descriptive error if called outside `<WebSocketProvider>` (fail-fast, no silent undefined).
- **Singleton guarantee**: no consumer ever constructs a `WebSocket`; all consumers share the provider's single connection.
- Consumers re-render automatically when `status` or `lastMessage` changes (Context state).

## Behaviour rules

- `send(planId)` serializes a `SelectPlanRequest` and transmits only when `readyState === OPEN`; otherwise it is a no-op (callers gate UI on `status` / `isProcessing`).
- `isProcessing === true` whenever `lastMessage?.type === 'inProgress'` or the connection is not yet `connected` after a selection attempt — the Pricing section uses this to disable all "Select Plan" buttons (FR-4, FR-7).
- Reconnect uses the capped backoff described in the message contract; the provider keeps retrying from `reconnecting` until `connected`.
- Incoming frames are parsed by the shared guard (`types/plan-message.ts`); malformed frames are ignored.

## References

- Message protocol & sequence: [websocket-plan-selection.md](./websocket-plan-selection.md)
- Context state transitions: [../data-model.md](../data-model.md)
