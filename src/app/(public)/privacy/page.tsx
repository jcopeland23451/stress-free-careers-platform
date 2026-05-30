import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: "Privacy & Your Data",
  description:
    "How Stress-Free Auto Care collects, uses, and protects your personal information during the job application process.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Privacy &amp; Your Data
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: May 2025
      </p>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        {COMPANY.name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;) is committed to protecting your privacy. This
        policy explains what personal information we collect when you apply
        for a job or interact with our careers site, how we use it, and what
        rights you have.
      </p>

      {/* ── What We Collect ── */}
      <section aria-labelledby="collect-heading" className="mt-10">
        <h2 id="collect-heading" className="text-xl font-bold">
          1. What We Collect
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">Application data</strong> —
            When you submit an application we collect your name, email address,
            phone number (optional), and any answers to job-specific screening
            questions. If you upload a resume we store that file securely; it
            is used only to evaluate your application.
          </p>
          <p>
            <strong className="text-foreground">Cover letter &amp; notes</strong>{" "}
            — Any cover letter or free-text answers you provide in the
            application form.
          </p>
          <p>
            <strong className="text-foreground">
              Voluntary EEO self-identification
            </strong>{" "}
            — We ask applicants to voluntarily self-identify race/ethnicity,
            gender, veteran status, and disability status to comply with OFCCP
            and EEO reporting obligations. See Section&nbsp;4 for how this
            data is treated.
          </p>
          <p>
            <strong className="text-foreground">Usage data</strong> — Standard
            web server logs (IP address, browser type, pages visited) collected
            automatically. We do not use cross-site tracking cookies on this
            careers site.
          </p>
        </div>
      </section>

      {/* ── How We Use It ── */}
      <section aria-labelledby="use-heading" className="mt-10">
        <h2 id="use-heading" className="text-xl font-bold">
          2. How We Use Your Information
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>To evaluate your application and communicate about it</li>
          <li>
            To track application status through our hiring pipeline (Applied →
            Screening → Interview → Offer → Decision)
          </li>
          <li>
            To contact you about future roles if you consent (we will always
            ask separately before adding you to a talent pipeline)
          </li>
          <li>
            To satisfy legal obligations (EEO/OFCCP aggregate reporting,
            CCPA compliance, employment law recordkeeping)
          </li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          We do <strong className="text-foreground">not</strong> sell or rent
          your personal information to third parties, and we do not use it for
          advertising targeting.
        </p>
      </section>

      {/* ── Consent & Legal Basis ── */}
      <section aria-labelledby="consent-heading" className="mt-10">
        <h2 id="consent-heading" className="text-xl font-bold">
          3. Consent &amp; Legal Basis
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          By submitting an application you consent to the collection and use of
          your data as described in this policy. In jurisdictions where
          applicable (including California under CCPA/CPRA and the European
          Economic Area under GDPR), our legal basis for processing
          application data is &ldquo;legitimate interest&rdquo; in evaluating
          candidates and &ldquo;compliance with a legal obligation&rdquo; for
          EEO/OFCCP reporting.
        </p>
      </section>

      {/* ── EEO Data ── */}
      <section aria-labelledby="eeo-heading" className="mt-10">
        <h2 id="eeo-heading" className="text-xl font-bold">
          4. Voluntary EEO Self-Identification Data
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Providing EEO self-identification information is entirely voluntary
            and will not affect your application.
          </p>
          <p className="rounded-lg border border-border bg-secondary/40 px-4 py-3 font-medium text-foreground">
            EEO self-identification data is stored in a separate,
            access-controlled table. Hiring managers and interviewers{" "}
            <strong>never</strong> see this data. It is used{" "}
            <strong>only</strong> for aggregate federal EEO/OFCCP reporting and
            is never used in any hiring decision.
          </p>
          <p>
            Aggregate reports are produced at the organizational level and
            contain no individually identifiable information.
          </p>
        </div>
      </section>

      {/* ── Data Retention ── */}
      <section aria-labelledby="retention-heading" className="mt-10">
        <h2 id="retention-heading" className="text-xl font-bold">
          5. Data Retention
        </h2>
        <div className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">Active applicants</strong> —
            Data retained for the duration of the hiring process plus 24 months
            (required by federal employment recordkeeping rules).
          </p>
          <p>
            <strong className="text-foreground">Hired candidates</strong> —
            Application data becomes part of your employment record and is
            governed by our HR data retention policy (typically 7 years post
            employment).
          </p>
          <p>
            <strong className="text-foreground">Rejected / withdrawn</strong>{" "}
            — Retained for 24 months, then deleted or anonymized.
          </p>
          <p>
            <strong className="text-foreground">Resumes</strong> — Deleted 30
            days after a final decision unless you are hired.
          </p>
        </div>
      </section>

      {/* ── Your Rights ── */}
      <section aria-labelledby="rights-heading" className="mt-10">
        <h2 id="rights-heading" className="text-xl font-bold">
          6. Your Rights
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Depending on where you live, you may have the right to:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Access</strong> — request a
            copy of the personal data we hold about you
          </li>
          <li>
            <strong className="text-foreground">Deletion</strong> — ask us to
            delete your data (subject to legal retention obligations)
          </li>
          <li>
            <strong className="text-foreground">Correction</strong> — update
            inaccurate or incomplete information
          </li>
          <li>
            <strong className="text-foreground">Portability</strong> — receive
            your data in a machine-readable format
          </li>
          <li>
            <strong className="text-foreground">Opt-out</strong> — withdraw
            consent for talent pipeline communications at any time
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          California residents have additional rights under the CCPA/CPRA,
          including the right to know, delete, and opt-out of the sale of
          personal information. We do not sell personal information.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          To exercise any of these rights, email{" "}
          <a
            href="mailto:privacy@stressfreeautocare.com"
            className="text-accent underline underline-offset-4 hover:text-primary"
          >
            privacy@stressfreeautocare.com
          </a>{" "}
          with &ldquo;Privacy Request&rdquo; in the subject line. We will
          respond within 45 days.
        </p>
      </section>

      {/* ── Security ── */}
      <section aria-labelledby="security-heading" className="mt-10">
        <h2 id="security-heading" className="text-xl font-bold">
          7. Security
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          We use industry-standard security measures including encrypted
          connections (TLS), access controls, and regular security reviews.
          No data transmission over the internet is 100% secure; if you have
          concerns, contact us at the address above.
        </p>
      </section>

      {/* ── EOE Statement ── */}
      <section aria-labelledby="eoe-heading" className="mt-10">
        <h2 id="eoe-heading" className="text-xl font-bold">
          8. Equal Opportunity
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {COMPANY.eoeStatement}
        </p>
      </section>

      {/* ── Contact ── */}
      <section aria-labelledby="contact-heading" className="mt-10">
        <h2 id="contact-heading" className="text-xl font-bold">
          9. Contact Us
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Questions about this policy?{" "}
          <a
            href="mailto:privacy@stressfreeautocare.com"
            className="text-accent underline underline-offset-4 hover:text-primary"
          >
            privacy@stressfreeautocare.com
          </a>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          For accessibility feedback see the{" "}
          <a
            href="/accessibility"
            className="text-accent underline underline-offset-4 hover:text-primary"
          >
            Accessibility Statement
          </a>
          .
        </p>
      </section>
    </div>
  );
}
