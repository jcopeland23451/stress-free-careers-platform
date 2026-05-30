/**
 * a11y-admin.spec.ts
 *
 * Accessibility audit for every major admin page, logged in as CORPORATE.
 *
 * Strategy:
 *   - Run @axe-core/playwright with WCAG 2.0 A + 2.0 AA tags.
 *   - Collect all violations, filter to impact "critical" or "serious".
 *   - Assert the filtered list is empty, surfacing the serialised violations
 *     as the failure message so developers can act on them immediately.
 *
 * Pages audited:
 *   /admin               — Dashboard
 *   /admin/jobs          — Jobs list
 *   /admin/applicants    — Applicants pipeline
 *   /admin/org           — Organization (corporate-only)
 *   /admin/content       — Content (corporate-only)
 *   /admin/notifications — Notifications
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { login } from "./helpers";

const CORPORATE_EMAIL = "corporate@stressfree.test";
const PASSWORD = "demo1234";

/**
 * Impact levels that block a release. "moderate" and "minor" are reported
 * by axe but treated as warnings, not failures, in this suite.
 */
const BLOCKING_IMPACTS = new Set(["critical", "serious"]);

const PAGES: Array<{ name: string; path: string }> = [
  { name: "Dashboard",      path: "/admin" },
  { name: "Jobs",           path: "/admin/jobs" },
  { name: "Applicants",     path: "/admin/applicants" },
  { name: "Organization",   path: "/admin/org" },
  { name: "Content",        path: "/admin/content" },
  { name: "Notifications",  path: "/admin/notifications" },
];

test.describe("Admin accessibility audits (WCAG 2.0 A + AA)", () => {
  // Log in once before each test.  Each test gets its own page context so the
  // session cookie is preserved within a describe block.
  test.beforeEach(async ({ page }) => {
    await login(page, CORPORATE_EMAIL, PASSWORD);
  });

  for (const { name, path } of PAGES) {
    test(`${name} (${path}) has no critical/serious axe violations`, async ({
      page,
    }) => {
      await page.goto(path);

      // Wait for the main content region to be present before running axe so
      // that dynamically rendered content is included in the audit.
      await page.locator("#main").waitFor({ state: "visible" });

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        // Exclude third-party iframes that we don't control (charts library
        // may inject them; axe cannot fully audit cross-origin iframes).
        .exclude("iframe[src]")
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact && BLOCKING_IMPACTS.has(v.impact),
      );

      // Serialise for readable failure messages
      const message =
        blocking.length > 0
          ? `Found ${blocking.length} critical/serious axe violation(s) on ${path}:\n` +
            blocking
              .map(
                (v) =>
                  `  [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n` +
                  v.nodes
                    .map((n) => `    • ${n.html}`)
                    .slice(0, 3)
                    .join("\n"),
              )
              .join("\n\n")
          : "";

      expect(blocking, message).toEqual([]);
    });
  }
});
