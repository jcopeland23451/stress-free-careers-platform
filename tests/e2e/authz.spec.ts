/**
 * authz.spec.ts
 *
 * Negative-authorization tests:
 *
 *   1. GM role is blocked from corporate-only pages (/admin/templates,
 *      /admin/org, /admin/content) and is redirected back to /admin.
 *
 *   2. GM is denied access to an out-of-scope applicant detail page
 *      (IDOR-class): corporate user discovers a non-Mountain-View applicant
 *      href, then a separate GM context attempts to load it and must receive
 *      a 404 response (Next renders not-found for out-of-scope ids).
 */

import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const CORPORATE_EMAIL = "corporate@stressfree.test";
const GM_EMAIL = "gm@stressfree.test";

// ---------------------------------------------------------------------------
// 1. GM blocked from corporate-only pages
// ---------------------------------------------------------------------------

test.describe("GM blocked from corporate-only admin pages", () => {
  const CORPORATE_ONLY_PATHS = [
    "/admin/templates",
    "/admin/org",
    "/admin/content",
  ] as const;

  for (const path of CORPORATE_ONLY_PATHS) {
    test(`visiting ${path} as GM redirects to /admin`, async ({ page }) => {
      await login(page, GM_EMAIL);

      await page.goto(path);

      // After the server-side requireRole redirect lands, the final URL must
      // be exactly /admin (not the requested corporate-only path).
      await expect(page).toHaveURL(/\/admin$/);

      // Confirm we did NOT reach the requested page.
      expect(page.url()).not.toContain(path);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. GM denied an out-of-scope applicant detail (IDOR-class)
// ---------------------------------------------------------------------------

test("GM receives 404 for an applicant detail outside their scope", async ({
  browser,
}) => {
  // ---- Step 1: Corporate discovers a non-Mountain-View applicant href -------
  const corpCtx = await browser.newContext();
  const corpPage = await corpCtx.newPage();

  let outOfScopeHref: string | null = null;

  try {
    await login(corpPage, CORPORATE_EMAIL);
    await corpPage.goto("/admin/applicants");

    // Switch to list view to get tabular rows with a reliable location column.
    await corpPage.getByRole("tab", { name: "List" }).click();

    // Wait for the table body to appear.
    const table = corpPage.locator("table").first();
    await expect(table).toBeVisible();

    // Each row: [Candidate, Job, Location (td:nth-child(3)), Stage, Applied, Flags]
    const rows = table.locator("tbody tr");
    const rowCount = await rows.count();

    expect(rowCount).toBeGreaterThan(0);

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);
      const locationCell = row.locator("td:nth-child(3)");
      const locationText = (await locationCell.textContent()) ?? "";

      if (!locationText.includes("Mountain View")) {
        // Found a row outside the GM's scope — read the detail link href.
        const link = row.locator('a[href^="/admin/applicants/"]').first();
        outOfScopeHref = await link.getAttribute("href");
        break;
      }
    }
  } finally {
    await corpCtx.close();
  }

  if (!outOfScopeHref) {
    throw new Error(
      "Test setup failed: could not find a non-Mountain-View applicant row " +
        "on /admin/applicants in list view. Corporate should see all 29 shops — " +
        "check the seed data or the list view location column selector (td:nth-child(3)).",
    );
  }

  // ---- Step 2: GM tries to access the out-of-scope detail -------------------
  const gmCtx = await browser.newContext();
  const gmPage = await gmCtx.newPage();

  try {
    await login(gmPage, GM_EMAIL);

    const resp = await gmPage.goto(outOfScopeHref);

    // The applicant detail page enforces RBAC scope server-side and calls
    // notFound() for ids outside the user's scope — Next renders a 404 page.
    expect(resp?.status()).toBe(404);
  } finally {
    await gmCtx.close();
  }
});
