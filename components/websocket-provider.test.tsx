import { describe, expect, it, afterEach, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WebSocketProvider, useWebSocket } from "./websocket-provider";
import { installMockWebSocket, MockWebSocket } from "@/mocks/mock-websocket";

function Probe() {
  const { status, lastMessage, isProcessing, send, reconnect } = useWebSocket();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="last-message">{lastMessage ? lastMessage.message : ""}</span>
      <span data-testid="last-type">{lastMessage ? lastMessage.type : ""}</span>
      <span data-testid="is-processing">{String(isProcessing)}</span>
      <button onClick={() => send("starter")}>send</button>
      <button onClick={() => reconnect()}>reconnect</button>
    </div>
  );
}

function renderProbe() {
  const restoreWebSocket = installMockWebSocket();

  const renderResult = render(
    <WebSocketProvider>
      <Probe />
    </WebSocketProvider>,
  );

  const getInstances = () => MockWebSocket.instances;
  const latestSocket = () => MockWebSocket.instances.at(-1) as MockWebSocket;

  return {
    ...renderResult,
    getInstances,
    latestSocket,
    status: () => screen.getByTestId("status").textContent,
    lastMessage: () => screen.getByTestId("last-message").textContent,
    lastType: () => screen.getByTestId("last-type").textContent,
    isProcessing: () => screen.getByTestId("is-processing").textContent,
    restoreWebSocket,
  };
}

afterEach(() => {
  cleanup();
  MockWebSocket.instances = [];
  vi.useRealTimers();
});

describe("WebSocketProvider", () => {
  it("throws a descriptive error when useWebSocket is used outside the provider", () => {
    const restoreWebSocket = installMockWebSocket();

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/WebSocketProvider/);
    consoleError.mockRestore();

    restoreWebSocket();
  });

  it("transitions status to connected when the socket opens", () => {
    const probe = renderProbe();
    expect(probe.status()).toBe("connecting");

    act(() => {
      probe.latestSocket().open();
    });

    expect(probe.status()).toBe("connected");
    probe.restoreWebSocket();
  });

  it("makes send a no-op when the connection is not open, and processes messages once connected", () => {
    const probe = renderProbe();
    const socket = probe.latestSocket();

    fireEvent.click(screen.getByText("send"));
    expect(socket.sentMessages).toHaveLength(0);
    expect(probe.status()).toBe("connecting");

    act(() => {
      socket.open();
    });
    expect(probe.status()).toBe("connected");

    fireEvent.click(screen.getByText("send"));
    expect(socket.sentMessages).toEqual([
      JSON.stringify({ type: "selectPlan", planId: "starter" }),
    ]);

    act(() => {
      socket.receive(JSON.stringify({ type: "inProgress", message: "Working..." }));
    });
    expect(probe.isProcessing()).toBe("true");

    act(() => {
      socket.receive(JSON.stringify({ type: "success", message: "Done!", planId: "starter" }));
    });
    expect(probe.isProcessing()).toBe("false");
    expect(probe.lastType()).toBe("success");
    expect(probe.lastMessage()).toBe("Done!");

    probe.restoreWebSocket();
  });

  it("switches to reconnecting, abandons in-flight selection, and escalates backoff until open", () => {
    vi.useFakeTimers();
    const probe = renderProbe();
    const socket = probe.latestSocket();

    act(() => {
      socket.open();
    });
    fireEvent.click(screen.getByText("send"));
    act(() => {
      socket.receive(JSON.stringify({ type: "inProgress", message: "Working..." }));
    });
    expect(probe.isProcessing()).toBe("true");

    act(() => {
      socket.drop();
    });

    expect(probe.status()).toBe("reconnecting");
    expect(probe.lastType()).toBe("error");
    expect(probe.lastMessage()).toBe("Connection lost; please try again");
    expect(probe.isProcessing()).toBe("false");

    const attemptsBeforeReconnect = MockWebSocket.instances.length;

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(MockWebSocket.instances.length).toBe(attemptsBeforeReconnect);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(MockWebSocket.instances.length).toBe(attemptsBeforeReconnect + 1);

    const secondSocket = probe.latestSocket();
    expect(secondSocket).not.toBe(socket);

    act(() => {
      secondSocket.drop(1006);
    });
    expect(probe.status()).toBe("reconnecting");

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(MockWebSocket.instances.length).toBe(attemptsBeforeReconnect + 2);

    const thirdSocket = probe.latestSocket();
    act(() => {
      thirdSocket.drop(1006);
    });

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(MockWebSocket.instances.length).toBe(attemptsBeforeReconnect + 3);

    const fourthSocket = probe.latestSocket();
    act(() => {
      fourthSocket.drop(1006);
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(MockWebSocket.instances.length).toBe(attemptsBeforeReconnect + 4);

    act(() => {
      probe.latestSocket().open();
    });
    expect(probe.status()).toBe("connected");

    const attemptsAfterReconnect = MockWebSocket.instances.length;
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(MockWebSocket.instances.length).toBe(attemptsAfterReconnect);

    fireEvent.click(screen.getByText("send"));
    expect(probe.latestSocket().sentMessages).toEqual([
      JSON.stringify({ type: "selectPlan", planId: "starter" }),
    ]);

    probe.restoreWebSocket();
  });
});
