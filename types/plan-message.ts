import z from "zod";
export interface SelectPlanRequest {
  type: "selectPlan";
  planId: string;
  email: string;
  token: string;
}

export const PlanSelectionResponseSchema = z.object({
  type: z.enum(["success", "inProgress", "error"]),
  message: z.string(),
  planId: z.string().optional(),
});

export type PlanSelectionResponse = z.infer<typeof PlanSelectionResponseSchema>;

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

  return { type, message, planId: planId || "No planId" };
}
