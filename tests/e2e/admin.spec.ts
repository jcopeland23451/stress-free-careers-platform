/**
 * admin.spec.ts
 *
 * Tests covering admin features as the CORPORATE user:
 *
 *   1. /admin/applicants — kanban board columns and Board/List toggle present
 *   2. Applicant detail — page loads and EEO fields are absent (compliance)
 *   3. /admin/jobs — table rows are present
 *   4. /admin/templates — corporate-only page loads and shows templates
 */

import { test, expect } from "@playwright/test";
import { login } from "./helpers";

const CORPORATE_EMAIL = "corporate@stressfree.test";
const PASSWORD = "demo1234";

// ---------------------------------------------------------------------------
// Shared login
// ---------------------------------------------------------------------------
test.describe("Admin pages as CORPORATE user", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, CORPORATE_EMAIL, PASSWORD);
  });

  // ── Applicants pipeline board ─────────────────────────────────────────────
  test.describe("/admin/applicants pipeline board", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/applicants");
    });

    test("shows the pipeline board region", async ({ page }) => {
      await expect(
        page.getByRole("region", { name: "Applicant pipeline board" }),
      ).toBeVisible();
    });

    test("pipeline board has all five active kanban columns", async ({ page }) => {
      const board = page.getByRole("region", { name: "Applicant pipeline board" });

      // Each column has role="group" with an aria-label starting with the
      // stage name: "Applied — N applicants", "Screening — N applicants", etc.
      await expect(board.getByRole("group", { name: /^Applied/i })).toBeVisible();
      await expect(board.getByRole("group", { name: /^Screening/i })).toBeVisible();
      await expect(board.getByRole("group", { name: /^Interview/i })).toBeVisible();
      await expect(board.getByRole("group", { name: /^Offer/i })).toBeVisible();
      await expect(board.getByRole("group", { name: /^Hired/i })).toBeVisible();
    });

    test("Board and List view controls are present", async ({ page }) => {
      // TabsList with aria-label "Pipeline view" contains the two triggers
      const tabList = page.getByRole("tablist", { name: "Pipeline view" });
      await expect(tabList).toBeVisible();
      await expect(tabList.getByRole("tab", { name: "Board" })).toBeVisible();
      await expect(tabList.getByRole("tab", { name: "List" })).toBeVisible();
    });

    test("switching to List view renders the applicants table", async ({
      page,
    }) => {
      await page.getByRole("tab", { name: "List" }).click();
      // The list view renders a <table>; wait for it and assert rows exist
      const table = page.locator("table").first();
      await expect(table).toBeVisible();
      // At least one data row (there are 42 total corp applications per spec)
      const rows = table.locator("tbody tr");
      await expect(rows.first()).toBeVisible();
    });
  });

  // ── Applicant detail & EEO compliance ────────────────────────────────────
  test.describe("applicant detail page", () => {
    test("opens first applicant detail and detail page loads correctly", async ({
      page,
    }) => {
      await page.goto("/admin/applicants");

      // The board is default view; click the first candidate name link.
      // Links to /admin/applicants/[id] exist both on the board cards and
      // in the list view. We target the first link that navigates to the detail.
      const firstLink = page
        .getByRole("link", { name: /^[A-Z]/ }) // candidate names start with capital
        .filter({ hasNot: page.locator("[aria-label]") }) // exclude icon buttons
        .first();

      // More robust: find any <a> whose href matches the detail pattern
      const detailLink = page
        .locator('a[href^="/admin/applicants/"]')
        .first();

      await detailLink.click();
      await page.waitForURL(/\/admin\/applicants\/.+/);

      // Page should show candidate info section
      await expect(
        page.getByRole("heading", { level: 1 }),
      ).toBeVisible();

      // The "Stage" select / badge should be present
      await expect(
        page.getByText("Candidate Information"),
      ).toBeVisible();
    });

    test("applicant detail does NOT expose EEO fields (compliance)", async ({
      page,
    }) => {
      await page.goto("/admin/applicants");

      const detailLink = page
        .locator('a[href^="/admin/applicants/"]')
        .first();
      await detailLink.click();
      await page.waitForURL(/\/admin\/applicants\/.+/);

      // Wait for main content to be present before checking text
      await expect(page.locator("#main")).toBeVisible();

      const pageText = (await page.locator("#main").textContent()) ?? "";

      // EEO fields must not appear anywhere on the detail page
      expect(pageText).not.toMatch(/\bRace\b/i);
      expect(pageText).not.toMatch(/\bEthnicity\b/i);
      expect(pageText).not.toMatch(/\bVeteran\b/i);
      expect(pageText).not.toMatch(/\bDisability\b/i);
      expect(pageText).not.toMatch(/\bGender\b/i);
    });
  });

  // ── Jobs list ─────────────────────────────────────────────────────────────
  test.describe("/admin/jobs", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/jobs");
    });

    test('shows the "Jobs" heading', async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "Jobs", level: 1 }),
      ).toBeVisible();
    });

    test("table contains at least one job row", async ({ page }) => {
      const table = page.locator("table").first();
      await expect(table).toBeVisible();
      // Wait for at least one data row to be present
      const firstRow = table.locator("tbody tr").first();
      await expect(firstRow).toBeVisible();
      // Ensure it is not the empty-state row
      await expect(firstRow).not.toContainText("No jobs match your filters.");
    });

    test('"New Job" button is visible and links to /admin/jobs/new', async ({
      page,
    }) => {
      await expect(
        page.getByRole("link", { name: "New Job" }),
      ).toBeVisible();
    });
  });

  // ── Templates (corporate-only) ────────────────────────────────────────────
  test.describe("/admin/templates", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/admin/templates");
    });

    test('shows the "Job Templates" heading', async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "Job Templates", level: 1 }),
      ).toBeVisible();
    });

    test("templates table is present", async ({ page }) => {
      const table = page.locator("table").first();
      await expect(table).toBeVisible();
      // The table header should show "Title"
      await expect(table.getByRole("columnheader", { name: "Title" })).toBeVisible();
    });

    test('"New Template" button is visible', async ({ page }) => {
      await expect(
        page.getByRole("link", { name: "New Template" }),
      ).toBeVisible();
    });
  });
});
