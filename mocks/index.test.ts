import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  toggleErrorMode: vi.fn(),
  workerStart: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./handlers", () => ({
  toggleErrorMode: mocks.toggleErrorMode,
}));

vi.mock("./browser", () => ({
  worker: { start: mocks.workerStart },
}));

import { startMocking } from "./index";

describe("startMocking", () => {
  beforeEach(() => {
    delete window.__mswStarted;
    mocks.toggleErrorMode.mockClear();
    mocks.workerStart.mockClear();
  });

  it("guards against concurrent invocation to start the worker exactly once", async () => {
    const firstCall = startMocking();
    const secondCall = startMocking();

    await Promise.all([firstCall, secondCall]);

    expect(mocks.workerStart).toHaveBeenCalledTimes(1);
  });

  it("only toggles error mode once under concurrent invocation", async () => {
    const firstCall = startMocking();
    const secondCall = startMocking();

    await Promise.all([firstCall, secondCall]);

    expect(mocks.toggleErrorMode).toHaveBeenCalledTimes(1);
  });
});
