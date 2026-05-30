import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: "Accessibility Statement",
  description:
    "Our commitment to digital accessibility — WCAG 2.1 AA compliance, how to report issues, and how to reach us.",
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Accessibility Statement
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last reviewed: May 2025
      </p>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        {COMPANY.name} is committed to ensuring this careers site is accessible
        to everyone, including people with disabilities. We aim to conform to
        the{" "}
        <strong className="text-foreground">
          Web Content Accessibility Guidelines (WCAG) 2.1, Level AA
        </strong>
        .
      </p>

      {/* ── Our Commitment ── */}
      <section aria-labelledby="commitment-heading" className="mt-10">
        <h2 id="commitment-heading" className="text-xl font-bold">
          Our Commitment
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <strong className="text-foreground">Perceivable</strong> — All
            non-text content has text alternatives; color is not used as the
            sole means of conveying information; sufficient contrast ratios are
            maintained.
          </li>
          <li>
            <strong className="text-foreground">Operable</strong> — All
            functionality is accessible via keyboard; no content flashes more
            than three times per second; there is a skip-navigation link at the
            top of every page.
          </li>
          <li>
            <strong className="text-foreground">Understandable</strong> —
            Pages are in plain English; form labels are associated with their
            controls; error messages identify the field and describe the
            problem.
          </li>
          <li>
            <strong className="text-foreground">Robust</strong> — We use
            semantic HTML and ARIA roles so assistive technologies can reliably
            interpret the site.
          </li>
        </ul>
      </section>

      {/* ── Standards & Tools ── */}
      <section aria-labelledby="standards-heading" className="mt-10">
        <h2 id="standards-heading" className="text-xl font-bold">
          Standards &amp; Evaluation
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            We evaluate this site against WCAG 2.1 Level AA criteria. Our
            development process includes:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Automated scanning (axe-core) on every pull request
            </li>
            <li>
              Manual keyboard navigation testing for all interactive components
            </li>
            <li>
              Color-contrast checks on all text and interactive elements
            </li>
            <li>
              Screen-reader testing with VoiceOver (macOS) and NVDA (Windows)
            </li>
          </ul>
        </div>
      </section>

      {/* ── Known Limitations ── */}
      <section aria-labelledby="limitations-heading" className="mt-10">
        <h2 id="limitations-heading" className="text-xl font-bold">
          Known Limitations
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          This site is actively developed. We are aware of no current WCAG 2.1
          AA failures at the time of this review. If you encounter a barrier,
          please tell us using the contact information below.
        </p>
      </section>

      {/* ── How to Report ── */}
      <section aria-labelledby="report-heading" className="mt-10">
        <h2 id="report-heading" className="text-xl font-bold">
          How to Report an Issue
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            If you experience any accessibility barrier on this site, please
            contact us. We take all feedback seriously and aim to respond
            within <strong className="text-foreground">5 business days</strong>
            .
          </p>
          <ul className="list-none space-y-2">
            <li>
              <strong className="text-foreground">Email:</strong>{" "}
              <a
                href="mailto:accessibility@stressfreeautocare.com"
                className="text-accent underline underline-offset-4 hover:text-primary"
              >
                accessibility@stressfreeautocare.com
              </a>
            </li>
            <li>
              <strong className="text-foreground">Subject line:</strong>{" "}
              &ldquo;Accessibility Feedback&rdquo;
            </li>
          </ul>
          <p>
            Please describe the barrier you encountered, the page URL, and the
            browser and assistive technology you were using. This helps us
            reproduce and fix the issue quickly.
          </p>
        </div>
      </section>

      {/* ── Alternative Access ── */}
      <section aria-labelledby="alternative-heading" className="mt-10">
        <h2 id="alternative-heading" className="text-xl font-bold">
          Need Help Applying?
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          If a disability prevents you from applying online, email{" "}
          <a
            href="mailto:careers@stressfreeautocare.com"
            className="text-accent underline underline-offset-4 hover:text-primary"
          >
            careers@stressfreeautocare.com
          </a>{" "}
          and we will work with you to complete your application through an
          accessible alternative process.
        </p>
      </section>

      {/* ── EOE ── */}
      <section aria-labelledby="eoe-a11y-heading" className="mt-10">
        <h2 id="eoe-a11y-heading" className="text-xl font-bold">
          Equal Opportunity
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {COMPANY.eoeStatement}
        </p>
      </section>
    </div>
  );
}
