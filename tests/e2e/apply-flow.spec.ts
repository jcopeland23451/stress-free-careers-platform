/**
 * apply-flow.spec.ts — write-path happy path.
 *
 * An anonymous applicant completes a (quick-flow) technician application and
 * lands on the confirmation page; the corporate admin then finds the new
 * applicant in the ATS, proving the submission persisted.
 */

import { test, expect } from "@playwright/test";
import { login, completeApplication } from "./helpers";

const CORPORATE_EMAIL = "corporate@stressfree.test";

test("applicant can submit an application and it appears in the ATS", async ({
  browser,
}) => {
  const uniqueEmail = `applicant.${Date.now()}@example.com`;
  const applicantName = "E2E Happy Path Applicant";

  const applicantCtx = await browser.newContext();
  const applicantPage = await applicantCtx.newPage();
  const corpCtx = await browser.newContext();
  const corpPage = await corpCtx.newPage();

  try {
    // Repair & Maintenance = quick flow (resume/cover letter not required).
    await applicantPage.goto(
      `/jobs?dept=${encodeURIComponent("Repair & Maintenance")}`,
    );
    await applicantPage
      .getByRole("link", { name: /view job/i })
      .first()
      .click();
    await applicantPage.waitForURL(/\/jobs\/.+/);
    await applicantPage.getByRole("link", { name: /apply now/i }).click();
    await applicantPage.waitForURL(/\/jobs\/.+\/apply$/);

    await completeApplication(applicantPage, {
      name: applicantName,
      email: uniqueEmail,
    });

    await expect(applicantPage).toHaveURL(/\/apply\/.+\/confirmation/);
    expect(await applicantPage.locator("body").textContent()).toMatch(
      /submitted|received|thank/i,
    );

    // Corporate verifies the application persisted and is visible in the ATS.
    await login(corpPage, CORPORATE_EMAIL);
    await corpPage.goto(
      `/admin/applicants?q=${encodeURIComponent(uniqueEmail)}`,
    );
    await corpPage.getByRole("tab", { name: "List" }).click();

    const row = corpPage
      .locator("tbody tr")
      .filter({ hasText: applicantName });
    await expect(row.first()).toBeVisible({ timeout: 10_000 });
  } finally {
    await applicantCtx.close();
    await corpCtx.close();
  }
});
