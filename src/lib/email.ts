import { prisma } from "./db";
import { COMPANY } from "./constants";

/**
 * "Sends" an email by recording it in the EmailLog table. The admin
 * Notifications view renders these, demonstrating the candidate
 * communication flow without an external SMTP provider.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  body: string;
  applicationId?: string | null;
}) {
  return prisma.emailLog.create({
    data: {
      to: opts.to,
      subject: opts.subject,
      body: opts.body,
      applicationId: opts.applicationId ?? null,
    },
  });
}

export function applicationReceivedEmail(name: string, jobTitle: string) {
  return {
    subject: `We received your application — ${jobTitle}`,
    body: `Hi ${name},

Thanks for applying to the ${jobTitle} role at ${COMPANY.name}. Our hiring team has received your application and will review it shortly. You can check the status of your application any time from your candidate dashboard.

— The ${COMPANY.name} Talent Team`,
  };
}

export function stageChangeEmail(
  name: string,
  jobTitle: string,
  stage: string,
) {
  const messages: Record<string, string> = {
    SCREENING: "Your application is being reviewed by our hiring team.",
    INTERVIEW: "Great news — we'd like to move you forward to an interview. A team member will reach out to schedule.",
    OFFER: "Exciting update — we're preparing an offer for you. Watch for a call from our team.",
    HIRED: "Welcome to the team! Onboarding details are on the way.",
    REJECTED: "After careful review, we've decided to move forward with other candidates for this role. We truly appreciate your interest and encourage you to apply again.",
    WITHDRAWN: "Your application has been withdrawn. If this was a mistake, you're always welcome to re-apply.",
  };
  return {
    subject: `Update on your application — ${jobTitle}`,
    body: `Hi ${name},

${messages[stage] ?? `Your application status has been updated to: ${stage}.`}

— The ${COMPANY.name} Talent Team`,
  };
}
