import { describe, expect, it } from "vitest";
import { parsePlanSelectionMessage } from "./plan-message";

describe("parsePlanSelectionMessage", () => {
  it("parses a valid success frame", () => {
    const frame = JSON.stringify({ type: "success", message: "Done!", planId: "starter" });
    expect(parsePlanSelectionMessage(frame)).toEqual({
      type: "success",
      message: "Done!",
      planId: "starter",
    });
  });

  it("parses a valid inProgress frame", () => {
    const frame = JSON.stringify({ type: "inProgress", message: "Working..." });
    expect(parsePlanSelectionMessage(frame)).toEqual({ type: "inProgress", message: "Working..." });
  });

  it("parses a valid error frame", () => {
    const frame = JSON.stringify({ type: "error", message: "Failed", planId: "pro" });
    expect(parsePlanSelectionMessage(frame)).toEqual({
      type: "error",
      message: "Failed",
      planId: "pro",
    });
  });

  it("returns null for malformed JSON", () => {
    expect(parsePlanSelectionMessage("{not json")).toBeNull();
  });

  it("returns null for an unknown type", () => {
    const frame = JSON.stringify({ type: "unknown", message: "hi" });
    expect(parsePlanSelectionMessage(frame)).toBeNull();
  });

  it("returns null when message is missing", () => {
    const frame = JSON.stringify({ type: "success" });
    expect(parsePlanSelectionMessage(frame)).toBeNull();
  });

  it("returns null for non-string frames", () => {
    expect(parsePlanSelectionMessage(null)).toBeNull();
    expect(parsePlanSelectionMessage(42)).toBeNull();
    expect(parsePlanSelectionMessage({ type: "success" })).toBeNull();
    expect(parsePlanSelectionMessage(new Blob(["{}"]))).toBeNull();
  });

  it("drops planId when it is not a string", () => {
    const frame = JSON.stringify({ type: "success", message: "Done!", planId: 7 });
    expect(parsePlanSelectionMessage(frame)).toEqual({ type: "success", message: "Done!" });
  });
});
