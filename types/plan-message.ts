export interface SelectPlanRequest {
  type: "selectPlan";
  planId: string;
}

export type PlanSelectionResponse =
  | { type: "success"; message: string; planId?: string }
  | { type: "inProgress"; message: string; planId?: string }
  | { type: "error"; message: string; planId?: string };

export function parsePlanSelectionMessage(frame: unknown): PlanSelectionResponse | null {
  if (typeof frame !== "string") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(frame);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;

  const candidate = parsed as Record<string, unknown>;
  const type = candidate.type;
  const message = candidate.message;

  if (type !== "success" && type !== "inProgress" && type !== "error") return null;
  if (typeof message !== "string") return null;

  const planId = typeof candidate.planId === "string" ? candidate.planId : undefined;

  return { type, message, planId };
}
