/**
 * validation.spec.ts
 *
 * Negative input-validation tests:
 *
 *   1. Wrong password on /login shows an error and stays on /login.
 *
 *   2. Submitting the apply form without checking the consent checkbox does
 *      NOT navigate to a confirmation page (stays on the apply URL).
 *      The form either shows a consent error message or the browser's native
 *      constraint prevents the submit entirely.
 */

import { test, expect } from "@playwright/test";

const CORPORATE_EMAIL = "corporate@stressfree.test";

// ---------------------------------------------------------------------------
// 1. Login: wrong password
// ---------------------------------------------------------------------------

test.describe("Login validation", () => {
  test("wrong password shows error message and stays on /login", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.fill("#email", CORPORATE_EMAIL);
    await page.fill("#password", "wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // The login action returns { error: "Invalid email or password." }, rendered
    // as <p role="alert">. Match by text to avoid Next's empty route-announcer
    // (which also has role="alert").
    const error = page.getByText(/invalid email or password/i);
    await expect(error).toBeVisible({ timeout: 10_000 });

    // Must still be on /login.
    await expect(page).toHaveURL(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// 2. Apply form: missing consent
// ---------------------------------------------------------------------------

test.describe("Apply form consent validation", () => {
  /**
   * Helper: navigate to the first job's apply page from /jobs.
   * Returns the apply page URL so we can assert we're still on it.
   */
  async function gotoFirstApplyPage(page: import("@playwright/test").Page) {
    await page.goto("/jobs");
    const firstViewJob = page.getByRole("link", { name: /view job/i }).first();
    const jobHref = await firstViewJob.getAttribute("href");
    expect(jobHref).toBeTruthy();
    const applyUrl = `${jobHref}/apply`;
    await page.goto(applyUrl);
    return applyUrl;
  }

  test(
    "submitting without consent stays on apply page and does not navigate to confirmation",
    async ({ page }) => {
      const applyUrl = await gotoFirstApplyPage(page);

      // Fill required personal fields so consent is the only missing piece.
      await page.fill("#name", "Consent Test User");
      await page.fill("#email", `consent.test.${Date.now()}@example.com`);

      // Intentionally do NOT check the consent checkbox.

      // Attempt to submit.
      await page.getByRole("button", { name: /submit application/i }).click();

      // Give the page a moment to respond (server action or browser validation).
      await page.waitForTimeout(1500);

      // Must NOT have navigated to a confirmation page.
      expect(page.url()).not.toMatch(/\/apply\/.+\/confirmation/);

      // Two possible outcomes depending on whether the browser native `required`
      // attribute fires or the server-side action runs first:
      //
      //   a) Browser blocks submit via HTML constraint validation: we simply
      //      remain on the apply URL — checked above.
      //
      //   b) Server action fires and returns a fieldErrors.consent response:
      //      the form renders a "You must consent" error message.
      //
      // We test both by checking we're still on the apply page (a) OR an
      // error message is visible (b).  At least one must be true.
      const stillOnApplyPage = page.url().includes("/apply");
      const consentError = page.getByRole("alert").filter({
        hasText: /consent/i,
      });
      const errorCount = await consentError.count();

      // At least one of the conditions must hold.
      expect(
        stillOnApplyPage || errorCount > 0,
        "Expected to remain on the apply page OR see a consent-related error, " +
          `but URL is: ${page.url()} and no consent error element was found.`,
      ).toBe(true);

      // Narrower assertion: we must NOT be on confirmation.
      await expect(page).not.toHaveURL(/confirmation/);
    },
  );
});
