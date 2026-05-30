import type { Page } from "@playwright/test";

/**
 * Log in via the /login form and wait for the redirect to /admin.
 *
 * The form uses:
 *   - `#email`    — email input
 *   - `#password` — password input
 *   - A submit button whose label is "Sign in" (or "Signing in…" while pending)
 *
 * We fire the click and the waitForURL concurrently so that even if the
 * navigation resolves before the await chain resumes, we don't miss it.
 */
export async function login(
  page: Page,
  email: string,
  password = "demo1234",
): Promise<void> {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await Promise.all([
    page.waitForURL("**/admin"),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]);
}

/**
 * Robustly fill and submit the job application form, then wait for the
 * confirmation page. Handles every screening field type (boolean radios,
 * number, text, Radix selects) plus consent and optional resume. The form
 * uses `noValidate`, so EVERY required field must be satisfied server-side.
 */
export async function completeApplication(
  page: Page,
  opts: { name: string; email: string; attachResume?: boolean },
): Promise<void> {
  await page.fill("#name", opts.name);
  await page.fill("#email", opts.email);
  if ((await page.locator("#phone").count()) > 0) {
    await page.fill("#phone", "5551234567");
  }

  // Cover letter (FULL-flow jobs only).
  if ((await page.locator("#coverLetter").count()) > 0) {
    await page.fill(
      "#coverLetter",
      "I'm excited about this role and believe I'd be a strong fit.",
    );
  }

  // Resume upload.
  if (opts.attachResume) {
    await page.locator('input[type="file"]').setInputFiles({
      name: "resume.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Experienced auto technician with ASE certifications."),
    });
  }

  // Boolean screening questions → "Yes".
  const yesRadios = page.locator('input[type="radio"][value="true"]');
  for (let i = 0; i < (await yesRadios.count()); i++) {
    await yesRadios.nth(i).check();
  }

  // Number screening questions.
  const numbers = page.locator('input[type="number"]');
  for (let i = 0; i < (await numbers.count()); i++) {
    await numbers.nth(i).fill("5");
  }

  // Free-text screening questions (skip number/radio/checkbox/file).
  const texts = page.locator(
    'input[name^="question_"]:not([type="number"]):not([type="radio"]):not([type="checkbox"]):not([type="file"]), textarea[name^="question_"]',
  );
  for (let i = 0; i < (await texts.count()); i++) {
    const el = texts.nth(i);
    if (await el.isVisible()) await el.fill("Available immediately");
  }

  // Radix selects (e.g. Availability) — click trigger, wait for the option,
  // then pick the first one. Skip hidden ones (e.g. a collapsed EEO section).
  const triggers = page.locator('[role="combobox"]');
  for (let i = 0; i < (await triggers.count()); i++) {
    const trigger = triggers.nth(i);
    if (!(await trigger.isVisible())) continue;
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const option = page.locator('[role="option"]').first();
    await option.waitFor({ state: "visible" });
    await option.click();
  }

  // Required consent.
  await page.getByLabel(/I consent to Stress-Free Auto Care/i).check();

  // Submit and wait for the confirmation redirect.
  await Promise.all([
    page.waitForURL(/\/apply\/.+\/confirmation/, { timeout: 30_000 }),
    page.getByRole("button", { name: /submit application/i }).click(),
  ]);
}
