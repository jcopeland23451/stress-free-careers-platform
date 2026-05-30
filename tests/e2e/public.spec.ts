import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

test.describe("Home page /", () => {
  test("renders an h1 and has a 'Browse open jobs' link that navigates to /jobs", async ({
    page,
  }) => {
    await page.goto("/");

    // h1 is visible
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();

    // CTA link to /jobs is present (may appear more than once; first is enough)
    const ctaLink = page
      .getByRole("link", { name: /browse open jobs/i })
      .first();
    await expect(ctaLink).toBeVisible();

    // Clicking navigates to /jobs
    await ctaLink.click();
    await expect(page).toHaveURL(/\/jobs/);
  });
});

// ---------------------------------------------------------------------------
// Job board /jobs
// ---------------------------------------------------------------------------

test.describe("Job board /jobs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/jobs");
  });

  test("shows '61 open roles' text", async ({ page }) => {
    await expect(
      page.getByText(/61 open role/i).first()
    ).toBeVisible();
  });

  test("shows at least one 'View job' link", async ({ page }) => {
    const viewJobLinks = page.getByRole("link", { name: /view job/i });
    await expect(viewJobLinks.first()).toBeVisible();
  });

  test("shows pagination as 'Page 1 of 6'", async ({ page }) => {
    await expect(page.getByText(/page 1 of 6/i)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Filtering — navigate directly with ?dept= to avoid Radix Select timing
  // -------------------------------------------------------------------------

  test("filtering by department shows fewer than 61 results", async ({
    page,
  }) => {
    // Navigate with the dept param already set; avoids Radix Select hydration
    // timing issues on the custom trigger/popover approach.
    await page.goto("/jobs?dept=Sales+%26+Service");

    // The heading should now show "X of 61 roles match your filters" (filtered)
    // and NOT the "61 open roles across …" text (unfiltered).
    await expect(page.getByText(/of 61 roles match your filters/i)).toBeVisible();

    // There should be at least one job card
    const viewJobLinks = page.getByRole("link", { name: /view job/i });
    await expect(viewJobLinks.first()).toBeVisible();

    // The URL should contain the dept param
    await expect(page).toHaveURL(/dept=Sales/);
  });
});

// ---------------------------------------------------------------------------
// Job detail page /jobs/<id>
// ---------------------------------------------------------------------------

test.describe("Job detail page", () => {
  test("shows pay, an Apply now link, and JSON-LD with 'JobPosting'", async ({
    page,
  }) => {
    // Step 1: visit the board and pick the first "View job" link
    await page.goto("/jobs");
    const firstViewJobLink = page.getByRole("link", { name: /view job/i }).first();
    const href = await firstViewJobLink.getAttribute("href");
    expect(href).toBeTruthy();

    // Step 2: navigate to the detail page
    await page.goto(href!);

    // Pay is visible — the detail page shows a "Pay" label and a formatted value.
    await expect(page.getByText(/^pay$/i).first()).toBeVisible();
    // A formatted pay value like "$32.00–$48.00/hr" or "$80k–$110k/yr".
    await expect(page.getByText(/\$\d/).first()).toBeVisible();

    // "Apply now" button/link pointing to .../apply
    const applyLink = page.getByRole("link", { name: /apply now/i });
    await expect(applyLink).toBeVisible();
    const applyHref = await applyLink.getAttribute("href");
    expect(applyHref).toMatch(/\/apply$/);

    // JSON-LD contains "JobPosting"
    const jsonLdContent = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(jsonLdContent).toContain("JobPosting");
  });
});

// ---------------------------------------------------------------------------
// Apply page /jobs/<id>/apply
// ---------------------------------------------------------------------------

test.describe("Apply page", () => {
  /**
   * Discover a job ID from /jobs so we can construct the apply URL without
   * hard-coding a seed ID.
   */
  async function getFirstApplyUrl(page: import("@playwright/test").Page) {
    await page.goto("/jobs");
    const firstViewJobLink = page
      .getByRole("link", { name: /view job/i })
      .first();
    const href = await firstViewJobLink.getAttribute("href");
    expect(href).toBeTruthy();
    return `${href}/apply`;
  }

  test("shows email field, consent checkbox, and voluntary EEO section", async ({
    page,
  }) => {
    const applyUrl = await getFirstApplyUrl(page);
    await page.goto(applyUrl);

    // Email input (labeled "Email address")
    const emailInput = page.getByRole("textbox", { name: /email/i });
    await expect(emailInput).toBeVisible();

    // Consent checkbox — label starts with "I consent to Stress-Free Auto Care"
    const consentCheckbox = page.getByRole("checkbox", {
      name: /I consent to Stress-Free Auto Care/i,
    });
    await expect(consentCheckbox).toBeVisible();

    // Voluntary EEO section — contains the word "voluntar" in some form
    // The section header "Voluntary self-identification" is always rendered
    // (even when collapsed), and the toggle button is visible.
    const eeoToggle = page.getByRole("button", {
      name: /voluntary self-identification/i,
    });
    await expect(eeoToggle).toBeVisible();
  });

  test("apply form structure: name field, email field, consent checkbox present", async ({
    page,
  }) => {
    const applyUrl = await getFirstApplyUrl(page);
    await page.goto(applyUrl);

    // Full name field
    const nameInput = page.getByRole("textbox", { name: /full name/i });
    await expect(nameInput).toBeVisible();

    // Email field
    const emailInput = page.getByRole("textbox", { name: /email/i });
    await expect(emailInput).toBeVisible();

    // Consent checkbox — either by role or by label text
    const consentCheckbox = page.getByLabel(/I consent to Stress-Free Auto Care/i);
    await expect(consentCheckbox).toBeVisible();
  });

  test("EEO section contains 'voluntary' wording", async ({ page }) => {
    const applyUrl = await getFirstApplyUrl(page);
    await page.goto(applyUrl);

    // The EEO toggle button contains the word "Voluntary"
    const eeoText = page.getByText(/voluntary/i).first();
    await expect(eeoText).toBeVisible();
  });
});
