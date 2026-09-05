# WebSocket Tier Selection

## Clarifications

### Session 2026-09-05

- Q: How should the WebSocket connection status be communicated to the user when the connection is unavailable or reconnecting? → A: Persistent status badge near the Pricing header.
- Q: When the WebSocket reconnects after a disconnection, what should happen to a plan selection that was in progress at the time of the drop? → A: Abandon and notify the user to resubmit.
- Q: What backend message types drive the selection flow? → A: Three types — success, inProgress, error — with accompanying messages; while inProgress all select buttons are disabled. Messages shown via the InfoPanel component.

## Overview

Replace the current REST API-based plan selection with a WebSocket-based communication channel. When a user clicks to select a pricing tier, the selection request and response flow through an established WebSocket connection instead of an HTTP POST request.

## User Scenarios & Testing

### Primary Flow

1. User navigates to the Pricing section on the homepage.
2. A WebSocket connection is established automatically when the page loads (simulated with MSW library). An InfoPanel is shown indicating the connecting state.
3. User clicks "Select Plan" on a pricing tier (Starter, Professional, or Enterprise).
4. The selection request is sent through the WebSocket connection as a "selectPlan" message.
5. The backend responds with an "inProgress" message. While in this state, all "Select Plan" buttons in the Pricing section are disabled, and an InfoPanel displays the in-progress message.
6. When the backend sends a "success" message, the InfoPanel displays the success message and the buttons are re-enabled.

### Error Flow

1. User clicks "Select Plan" on a pricing tier.
2. The backend responds with an "inProgress" message, and all "Select Plan" buttons are disabled.
3. The backend then sends an "error" message indicating the selection failed.
4. The InfoPanel displays the error message, the buttons are re-enabled, and the user can retry by clicking the button again.

### Reconnection Flow

1. The WebSocket connection drops unexpectedly.
2. The system automatically attempts to reconnect.
3. Once reconnected, the user can proceed with plan selection normally.

### Acceptance Scenarios

- **Given** the user is on the Pricing section, **When** they click "Select Plan", **Then** a plan selection message is sent over WebSocket, an "inProgress" InfoPanel is shown, all select buttons are disabled, and a success message is displayed when the backend confirms.
- **Given** the WebSocket connection is lost, **When** the user clicks "Select Plan", **Then** the system attempts to reconnect and shows an appropriate error if reconnection fails.
- **Given** a plan selection request is in progress (backend returned "inProgress"), **When** the user attempts to click any tier's "Select Plan" button, **Then** the button is disabled and no additional request is sent.
- **Given** the server returns an error response (backend sent "error"), **When** the user receives the error, **Then** they see a clear error message via InfoPanel, buttons are re-enabled, and the user can retry.

### Edge Cases

- User closes/reloads the page while a selection is in progress — the request is abandoned gracefully.
- Multiple rapid clicks on "Select Plan" — once the backend reports `inProgress`, all select buttons are disabled so only one request is in flight.
- WebSocket server is unavailable at page load — the UI remains functional with a connection status indicator.
- The pricing section displays a persistent connection status badge near the header, showing the current WebSocket state (connected, connecting, disconnected/reconnecting).
- A plan selection in progress when the connection drops is abandoned; the user is notified and must click "Select Plan" again once reconnected.
- If no message has been received yet, the InfoPanel shows a default in-progress message while connecting.

## Functional Requirements

1. **FR-1**: The system establishes a WebSocket connection when the Pricing section becomes visible and maintains it for the duration of the user's session on the page.
2. **FR-2**: When a user clicks "Select Plan", the system sends a plan selection message through the WebSocket connection containing the selected plan identifier.
3. **FR-3**: The backend responds with one of three message types over WebSocket: `success`, `inProgress`, or `error`, each with an accompanying message.
4. **FR-4**: While the backend has reported an `inProgress` state, all "Select Plan" buttons in the Pricing section are disabled until the backend sends either a `success` or `error` message.
5. **FR-5**: The system displays an InfoPanel showing the current message from the backend (success, inProgress, or error) with the appropriate visual treatment.
6. **FR-6**: The system automatically attempts to reconnect if the WebSocket connection is lost, with appropriate backoff.
7. **FR-7**: Only one plan selection request can be in progress at a time — when the backend reports `inProgress`, all select buttons are disabled and subsequent clicks are ignored.
8. **FR-8**: The system handles connection failures gracefully, ensuring the page remains usable even when WebSocket communication is unavailable.
9. **FR-9**: The system displays a persistent connection status badge near the Pricing section header reflecting the current WebSocket state (connected, connecting, disconnected/reconnecting).
10. **FR-10**: The WebSocket communication is simulated using the MSW library for development and testing purposes.

## Success Criteria

- Users can select a pricing tier and receive confirmation within 2 seconds under normal conditions.
- The WebSocket connection re-establishes within 5 seconds after an unexpected disconnection.
- Plan selection works reliably for all three tiers (Starter, Professional, Enterprise).
- Users receive clear feedback (loading, success, or error) for every selection attempt.
- The page remains functional and navigable even when the WebSocket connection is unavailable.

## Key Entities

- **PricingTier**: The available subscription tiers (Starter, Professional, Enterprise) with id, name, price, and features.
- **PlanSelectionRequest**: A message sent over WebSocket containing the selected plan identifier.
- **PlanSelectionResponse**: A message received over WebSocket with a `type` field (`success`, `inProgress`, or `error`) and a user-facing `message`.
- **InfoPanel**: A UI component that renders the backend message with a type-specific indicator (check icon for success, spinner for in-progress, error icon for error).

## Assumptions

- The WebSocket server is hosted at a known endpoint and supports the plan selection message protocol.
- The WebSocket connection is established over a secure protocol (WSS) in production environments.
- The server can handle concurrent plan selection requests from multiple users.
- The mock WebSocket handler will simulate the backend behavior by sending the three message types (success, inProgress, error) over MSW WebSocket.
- Connection management (keep-alive, ping/pong) is handled by the WebSocket protocol and server configuration.
- The Pricing section UI layout and tier data remain unchanged — only the communication mechanism changes.
- The InfoPanel component already exists and renders success, inProgress, and error states with appropriate icons.
