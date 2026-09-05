import { describe, expect, it, afterEach } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Pricing } from "./pricing";
import { WebSocketProvider } from "@/components/websocket-provider";
import { installMockWebSocket, MockWebSocket } from "@/mocks/mock-websocket";

function renderPricing() {
  const restoreWebSocket = installMockWebSocket();

  const renderResult = render(
    <WebSocketProvider>
      <Pricing />
    </WebSocketProvider>,
  );

  const socket = () => MockWebSocket.instances.at(-1) as MockWebSocket;

  return { ...renderResult, socket, restoreWebSocket };
}

function selectButtons() {
  return screen.getAllByRole("button", { name: "Select Plan" });
}

afterEach(() => {
  cleanup();
  MockWebSocket.instances = [];
});

describe("Pricing", () => {
  it("shows a connecting panel, disables all select buttons on inProgress, and re-enables on success", () => {
    const { socket, restoreWebSocket } = renderPricing();

    expect(screen.getByText("Connecting to plan service...")).toBeInTheDocument();
    selectButtons().forEach((button) => expect(button).toBeDisabled());

    act(() => {
      socket().open();
    });

    selectButtons().forEach((button) => expect(button).toBeEnabled());

    fireEvent.click(selectButtons()[0]);

    expect(screen.getByRole("button", { name: "Selecting..." })).toBeDisabled();
    selectButtons().forEach((button) => expect(button).toBeDisabled());

    act(() => {
      socket().receive(
        JSON.stringify({ type: "inProgress", message: "Working...", planId: "starter" }),
      );
    });
    expect(screen.getByText("Working...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Selecting..." })).toBeDisabled();
    selectButtons().forEach((button) => expect(button).toBeDisabled());

    act(() => {
      socket().receive(
        JSON.stringify({
          type: "success",
          message: "Successfully selected plan: starter",
          planId: "starter",
        }),
      );
    });

    expect(screen.getByText("Successfully selected plan: starter")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Selecting..." })).not.toBeInTheDocument();
    selectButtons().forEach((button) => expect(button).not.toBeDisabled());

    restoreWebSocket();
  });

  it("shows an error panel, re-enables buttons, and allows a retry that sends a new selectPlan", () => {
    const { socket, restoreWebSocket } = renderPricing();

    act(() => {
      socket().open();
    });

    const socketInstance = socket();

    fireEvent.click(selectButtons()[1]);

    act(() => {
      socketInstance.receive(JSON.stringify({ type: "inProgress", message: "Working..." }));
    });
    expect(screen.getByText("Working...")).toBeInTheDocument();

    const sendsBeforeError = socketInstance.sentMessages.length;

    act(() => {
      socketInstance.receive(
        JSON.stringify({
          type: "error",
          message: "Plan selection temporarily unavailable",
          planId: "pro",
        }),
      );
    });

    expect(screen.getByText("Plan selection temporarily unavailable")).toBeInTheDocument();
    selectButtons().forEach((button) => expect(button).not.toBeDisabled());

    fireEvent.click(selectButtons()[2]);

    expect(socketInstance.sentMessages.length).toBe(sendsBeforeError + 1);
    expect(JSON.parse(socketInstance.sentMessages.at(-1) ?? "")).toEqual({
      type: "selectPlan",
      planId: "enterprise",
    });

    restoreWebSocket();
  });
});
