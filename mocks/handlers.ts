import { http, HttpResponse, delay } from 'msw';

let simulateError = false;

export function toggleErrorMode() {
  simulateError = !simulateError;
}

export const handlers = [
  http.post('/api/plans/select', async ({ request }) => {
    const body = (await request.json()) as { planId: string };
    await delay(500);

    if (simulateError) {
      return HttpResponse.json(
        { success: false, error: 'Plan selection temporarily unavailable' },
        { status: 503 },
      );
    }

    return HttpResponse.json({
      success: true,
      planId: body.planId,
      message: `Successfully selected plan: ${body.planId}`,
    });
  }),
];
