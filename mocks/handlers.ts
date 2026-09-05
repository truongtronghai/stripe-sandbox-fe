import { ws } from "msw";
import type { SelectPlanRequest } from "@/types/plan-message";

let simulateError = false;

export function toggleErrorMode() {
  simulateError = !simulateError;
}

const plansSocket = ws.link("wss://plans.local/ws");

export const handlers = [
  plansSocket.addEventListener("connection", ({ client }) => {
    client.addEventListener("message", (event) => {
      const data = event.data;

      if (typeof data !== "string") return;

      let frame: unknown;
      try {
        frame = JSON.parse(data);
      } catch {
        return;
      }

      const isSelectPlanRequest = (value: unknown): value is SelectPlanRequest =>
        typeof value === "object" &&
        value !== null &&
        (value as Record<string, unknown>).type === "selectPlan" &&
        typeof (value as Record<string, unknown>).planId === "string";

      if (!isSelectPlanRequest(frame)) return;

      const { planId } = frame;

      client.send(
        JSON.stringify({
          type: "inProgress",
          message: "Processing your selection...",
          planId,
        }),
      );

      setTimeout(() => {
        if (simulateError) {
          client.send(
            JSON.stringify({
              type: "error",
              message: "Plan selection temporarily unavailable",
              planId,
            }),
          );
          return;
        }

        client.send(
          JSON.stringify({
            type: "success",
            message: `Successfully selected plan: ${planId.toUpperCase()}`,
            planId,
          }),
        );
      }, 500);
    });
  }),
];
