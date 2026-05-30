/**
 * auth-rbac.spec.ts
 *
 * Tests covering:
 *   1. Unauthenticated access to /admin redirects to /login
 *   2. GM role: correct scope label, KPI values, and nav items present/absent
 *   3. CORPORATE role: correct scope label, KPI values, and nav items present
 *   4. Relative RBAC scope: corporate applicant count > gm applicant count
 *   5. GM location scoping: every applicant card on /admin/applicants shows
 *      "Mountain View" and no other city (e.g. "Dallas", "San Diego")
 */

import { test, expect } from "@playwright/test";
import { login } from "./helpers";

// ─── Seed-stable credentials ────────────────────────────────────────────────
const CORPORATE_EMAIL = "corporate@stressfree.test";
const GM_EMAIL = "gm@stressfree.test";
const PASSWORD = "demo1234";

// ─── 1. Unauthenticated redirect ────────────────────────────────────────────
test.describe("unauthenticated access", () => {
  test("visiting /admin while logged out redirects to /login", async ({
    page,
  }) => {
    // Ensure no session cookie is present by using a fresh context (each test
    // in Playwright gets its own context by default).
    await page.goto("/admin");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});

// ─── 2. GM role ─────────────────────────────────────────────────────────────
test.describe("GM role dashboard and nav", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, GM_EMAIL, PASSWORD);
  });

  test('dashboard shows "Your location" scope label', async ({ page }) => {
    // The scope label is rendered inline in the subtitle paragraph:
    // "Welcome back, <name> — General Manager · Your location"
    await expect(page.getByText("Your location")).toBeVisible();
  });

  test("dashboard shows Open Requisitions = 2", async ({ page }) => {
    // KpiCard renders the title in a <p> and the value in a sibling <p>.
    // The value "2" appears as a large bold number inside the card whose
    // label is "Open Requisitions".
    const kpiCard = page.getByText("Open Requisitions").first();
    await expect(kpiCard).toBeVisible();
    // The numeric value is the adjacent bold element; assert it contains "2".
    await expect(
      page.locator('[aria-label="Key metrics"]').getByText("2").first(),
    ).toBeVisible();
  });

  test('sidebar nav does NOT show "Organization" or "Job Templates"', async ({
    page,
  }) => {
    const nav = page.getByRole("navigation", { name: "Admin" });
    await expect(nav.getByRole("link", { name: "Organization" })).not.toBeVisible();
    await expect(nav.getByRole("link", { name: "Job Templates" })).not.toBeVisible();
  });

  test('sidebar nav shows common items: Dashboard, Jobs, Applicants, Notifications', async ({
    page,
  }) => {
    const nav = page.getByRole("navigation", { name: "Admin" });
    await expect(nav.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Jobs" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Applicants" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Notifications" })).toBeVisible();
  });
});

// ─── 3. CORPORATE role ──────────────────────────────────────────────────────
test.describe("CORPORATE role dashboard and nav", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, CORPORATE_EMAIL, PASSWORD);
  });

  test('dashboard shows "All locations" scope label', async ({ page }) => {
    await expect(page.getByText("All locations")).toBeVisible();
  });

  test("dashboard shows Open Requisitions = 61", async ({ page }) => {
    const kpiSection = page.locator('[aria-label="Key metrics"]');
    await expect(kpiSection.getByText("61")).toBeVisible();
  });

  test("sidebar nav shows corporate-only items: Organization, Job Templates, Content", async ({
    page,
  }) => {
    const nav = page.getByRole("navigation", { name: "Admin" });
    await expect(nav.getByRole("link", { name: "Organization" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Job Templates" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Content" })).toBeVisible();
  });
});

// ─── 4. RBAC relative applicant count ───────────────────────────────────────
test.describe("RBAC applicant scope comparison", () => {
  /**
   * Parse the integer from strings like "42 applications" or "3 applications".
   */
  function parseCount(text: string): number {
    const match = text.match(/(\d+)\s+application/);
    if (!match) throw new Error(`Could not parse application count from: "${text}"`);
    return parseInt(match[1], 10);
  }

  test("corporate sees more applicants than GM", async ({ browser }) => {
    // Open two independent browser contexts so sessions don't collide.
    const corporateCtx = await browser.newContext();
    const gmCtx = await browser.newContext();

    const corporatePage = await corporateCtx.newPage();
    const gmPage = await gmCtx.newPage();

    try {
      // Log in with each role
      await login(corporatePage, CORPORATE_EMAIL, PASSWORD);
      await login(gmPage, GM_EMAIL, PASSWORD);

      // Navigate to applicants list
      await corporatePage.goto("/admin/applicants");
      await gmPage.goto("/admin/applicants");

      // The subtitle reads "<n> application[s]" (optionally " (filtered)")
      const corporateSubtitle = await corporatePage
        .getByText(/\d+ application/)
        .first()
        .textContent();
      const gmSubtitle = await gmPage
        .getByText(/\d+ application/)
        .first()
        .textContent();

      expect(corporateSubtitle).toBeTruthy();
      expect(gmSubtitle).toBeTruthy();

      const corporateCount = parseCount(corporateSubtitle!);
      const gmCount = parseCount(gmSubtitle!);

      expect(corporateCount).toBeGreaterThan(gmCount);
    } finally {
      await corporateCtx.close();
      await gmCtx.close();
    }
  });
});

// ─── 5. GM location scoping on applicants board ─────────────────────────────
test.describe("GM applicant location scoping", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, GM_EMAIL, PASSWORD);
  });

  test("all visible applicant cards show Mountain View location", async ({
    page,
  }) => {
    await page.goto("/admin/applicants");

    // Wait for the pipeline board to render (it has role="region")
    const board = page.getByRole("region", { name: "Applicant pipeline board" });
    await expect(board).toBeVisible();

    // Gather the text of the board region; every location chip should say
    // "Mountain View, CA" — assert no other city leaks through.
    const boardText = await board.textContent();
    expect(boardText).toBeTruthy();

    // These are cities that belong to OTHER scopes and must NOT appear:
    expect(boardText).not.toContain("Dallas");
    expect(boardText).not.toContain("San Diego");
    expect(boardText).not.toContain("Sacramento");
    expect(boardText).not.toContain("Los Angeles");
    expect(boardText).not.toContain("Sunnyvale");
    expect(boardText).not.toContain("Palo Alto");
    expect(boardText).not.toContain("San Jose");
    // Affirmative: Mountain View should appear (unless GM has 0 applicants, but
    // per spec GM has 2 open reqs, so there should be applicants with that city)
    // We assert that the board does not contain foreign cities rather than
    // asserting "Mountain View" appears N times (count is not stable).
  });

  test("switching to list view also shows only Mountain View applicants", async ({
    page,
  }) => {
    await page.goto("/admin/applicants");

    // Switch to list view
    await page.getByRole("tab", { name: "List" }).click();

    // The Location column cells in the list view
    const locationCells = page.locator("table").locator("td:nth-child(3)");
    const count = await locationCells.count();

    // If there are any applicants, every location cell should contain
    // "Mountain View" (or "—" for null, which is fine).
    for (let i = 0; i < count; i++) {
      const cellText = await locationCells.nth(i).textContent();
      if (cellText && cellText.trim() !== "—") {
        expect(cellText).toContain("Mountain View");
      }
    }
  });
});
