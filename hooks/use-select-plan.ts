import { useMutation } from '@tanstack/react-query';

interface SelectPlanRequest {
  planId: string;
}

interface SelectPlanResponse {
  success: boolean;
  planId?: string;
  message?: string;
  error?: string;
}

async function selectPlan(data: SelectPlanRequest): Promise<SelectPlanResponse> {
  const res = await fetch('/api/plans/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("There's an error. The selection of plan cannot processed.");
  }

  return res.json();
}

export function useSelectPlan() {
  return useMutation({
    mutationFn: selectPlan,
  });
}
