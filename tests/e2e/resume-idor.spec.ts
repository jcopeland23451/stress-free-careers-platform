/**
 * resume-idor.spec.ts — validates the resume endpoint's object-level
 * authorization (the IDOR fix).
 *
 * An applicant uploads a resume to a TEXAS job (outside the GM's Mountain
 * View, CA scope). The corporate admin CAN download it (200); the GM CANNOT
 * (404) even with the exact resume URL.
 */

import { test, expect } from "@playwright/test";
import { login, completeApplication } from "./helpers";

const CORPORATE_EMAIL = "corporate@stressfree.test";
const GM_EMAIL = "gm@stressfree.test";

test("resume endpoint returns 200 for corporate and 404 for an out-of-scope GM", async ({
  browser,
}) => {
  const email = `idor.${Date.now()}@example.com`;
  const name = "IDOR Test Applicant";

  const applicantCtx = await browser.newContext();
  const corpCtx = await browser.newContext();
  const gmCtx = await browser.newContext();
  const applicantPage = await applicantCtx.newPage();
  const corpPage = await corpCtx.newPage();
  const gmPage = await gmCtx.newPage();

  try {
    // Apply (with a resume) to a Texas technician job — out of the GM's scope.
    await applicantPage.goto(
      `/jobs?state=TX&dept=${encodeURIComponent("Repair & Maintenance")}`,
    );
    await applicantPage
      .getByRole("link", { name: /view job/i })
      .first()
      .click();
    await applicantPage.waitForURL(/\/jobs\/.+/);
    await applicantPage.getByRole("link", { name: /apply now/i }).click();
    await applicantPage.waitForURL(/\/jobs\/.+\/apply$/);

    await completeApplication(applicantPage, {
      name,
      email,
      attachResume: true,
    });
    await expect(applicantPage).toHaveURL(/\/apply\/.+\/confirmation/);

    // Corporate opens the applicant detail and reads the resume link.
    await login(corpPage, CORPORATE_EMAIL);
    await corpPage.goto(`/admin/applicants?q=${encodeURIComponent(email)}`);
    await corpPage.getByRole("tab", { name: "List" }).click();
    const detailLink = corpPage
      .locator('a[href^="/admin/applicants/"]')
      .first();
    await detailLink.click();
    await corpPage.waitForURL(/\/admin\/applicants\/.+/);

    const resumeLink = corpPage.locator('a[href^="/api/resume/"]').first();
    await expect(resumeLink).toBeVisible({ timeout: 10_000 });
    const resumeHref = await resumeLink.getAttribute("href");
    expect(resumeHref).toBeTruthy();

    // Corporate (in scope) may download → 200.
    const corpResp = await corpPage.request.get(resumeHref!);
    expect(corpResp.status()).toBe(200);

    // GM (out of scope) must be denied → 404, even with the exact URL.
    await login(gmPage, GM_EMAIL);
    const gmResp = await gmPage.request.get(resumeHref!);
    expect(gmResp.status()).toBe(404);
  } finally {
    await applicantCtx.close();
    await corpCtx.close();
    await gmCtx.close();
  }
});
