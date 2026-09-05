import { test, expect } from "@playwright/test";

test("selecting a plan drives the flow over WebSocket without any REST call", async ({ page }) => {
  const selectRequests: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/api/plans/select")) {
      selectRequests.push(request.url());
    }
  });

  await page.goto("/");

  await page.getByRole("heading", { name: "Pricing" }).scrollIntoViewIfNeeded();

  const selectPlanButton = page.getByRole("button", { name: "Select Plan" }).first();
  await expect(selectPlanButton).toBeEnabled();

  await selectPlanButton.click();

  await expect(page.getByRole("button", { name: "Selecting..." })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Select Plan" })).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Select Plan" }).first()).toBeDisabled();

  await expect(page.getByText("Successfully selected plan: starter")).toBeVisible({
    timeout: 3000,
  });

  await expect(page.getByRole("button", { name: "Select Plan" })).toHaveCount(3);
  await expect(page.getByRole("button", { name: "Select Plan" }).first()).toBeEnabled();

  expect(selectRequests).toEqual([]);
});
