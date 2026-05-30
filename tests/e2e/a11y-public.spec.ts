import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// ---------------------------------------------------------------------------
// Helper — run axe on a page and assert no critical/serious violations.
// ---------------------------------------------------------------------------

async function assertNoSeriousViolations(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );

  expect(
    serious,
    JSON.stringify(
      serious.map((v) => ({ id: v.id, nodes: v.nodes.length })),
      null,
      2,
    ),
  ).toEqual([]);
}

// ---------------------------------------------------------------------------
// Discover a real job ID from the board so we can test detail + apply URLs.
// Runs once before the parameterized tests, stored in module scope.
// ---------------------------------------------------------------------------

let jobDetailPath = "/jobs/unknown";
let jobApplyPath = "/jobs/unknown/apply";

// Use a test.beforeAll in a describe block to share state.
test.describe("Accessibility — public pages", () => {
  test.beforeAll(async ({ browser }) => {
    // Spin up a short-lived page just to discover the first job URL.
    const page = await browser.newPage();
    try {
      await page.goto("/jobs");
      const firstViewJobLink = page
        .getByRole("link", { name: /view job/i })
        .first();
      const href = await firstViewJobLink.getAttribute("href");
      if (href) {
        jobDetailPath = href;
        jobApplyPath = `${href}/apply`;
      }
    } finally {
      await page.close();
    }
  });

  // -------------------------------------------------------------------------
  // Static paths — known at write time
  // -------------------------------------------------------------------------

  const staticPaths = [
    "/",
    "/jobs",
    "/login",
    "/benefits",
    "/why-stress-free",
    "/growth",
    "/testimonials",
    "/privacy",
    "/accessibility",
  ];

  for (const path of staticPaths) {
    test(`no critical/serious axe violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      // Wait for the main content to settle
      await page.waitForLoadState("networkidle");
      await assertNoSeriousViolations(page);
    });
  }

  // -------------------------------------------------------------------------
  // Dynamic paths — resolved from the live seed at runtime
  // -------------------------------------------------------------------------

  test("no critical/serious axe violations on job detail page", async ({
    page,
  }) => {
    await page.goto(jobDetailPath);
    await page.waitForLoadState("networkidle");
    await assertNoSeriousViolations(page);
  });

  test("no critical/serious axe violations on job apply page", async ({
    page,
  }) => {
    await page.goto(jobApplyPath);
    await page.waitForLoadState("networkidle");
    await assertNoSeriousViolations(page);
  });
});
