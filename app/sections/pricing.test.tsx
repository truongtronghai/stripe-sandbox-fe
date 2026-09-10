import { describe, expect, it, afterEach } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
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

function selectLinks() {
  return screen.getAllByRole("link", { name: "Select Plan" });
}

afterEach(() => {
  cleanup();
  MockWebSocket.instances = [];
});

describe("Pricing", () => {
  it("shows a connecting panel, disables all select links on inProgress, and re-enables on success", () => {
    const { socket, restoreWebSocket } = renderPricing();

    expect(screen.getByText("Connecting to plan service...")).toBeInTheDocument();
    selectLinks().forEach((link) => expect(link).toHaveAttribute("aria-disabled", "true"));

    act(() => {
      socket().open();
    });

    expect(screen.queryByText("Connecting to plan service...")).not.toBeInTheDocument();
    selectLinks().forEach((link) => expect(link).toHaveAttribute("aria-disabled", "false"));

    act(() => {
      socket().receive(JSON.stringify({ type: "inProgress", message: "Working..." }));
    });

    expect(screen.getByText("Working...")).toBeInTheDocument();
    selectLinks().forEach((link) => expect(link).toHaveAttribute("aria-disabled", "true"));

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
    selectLinks().forEach((link) => expect(link).toHaveAttribute("aria-disabled", "false"));

    restoreWebSocket();
  });

  it("shows an error panel and re-enables the select links", () => {
    const { socket, restoreWebSocket } = renderPricing();

    act(() => {
      socket().open();
    });

    act(() => {
      socket().receive(
        JSON.stringify({
          type: "error",
          message: "Plan selection temporarily unavailable",
          planId: "pro",
        }),
      );
    });

    expect(screen.getByText("Plan selection temporarily unavailable")).toBeInTheDocument();
    selectLinks().forEach((link) => expect(link).toHaveAttribute("aria-disabled", "false"));

    restoreWebSocket();
  });
});
