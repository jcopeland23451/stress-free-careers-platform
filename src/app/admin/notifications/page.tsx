import { requireUser } from "@/lib/auth";
import { applicationScopeWhere } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmailBodyDialog } from "@/components/admin/applicants/email-body-dialog";
import Link from "next/link";

export default async function NotificationsPage() {
  const user = await requireUser();

  let emails;

  if (user.role === "CORPORATE") {
    // CORPORATE sees all email logs
    emails = await prisma.emailLog.findMany({
      include: {
        application: {
          select: {
            id: true,
            candidate: { select: { name: true } },
            job: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // Others see only emails for applications within their scope
    const scopeWhere = await applicationScopeWhere(user);
    const scopedApps = await prisma.application.findMany({
      where: scopeWhere,
      select: { id: true },
    });
    const appIds = scopedApps.map((a) => a.id);

    emails = await prisma.emailLog.findMany({
      where: { applicationId: { in: appIds } },
      include: {
        application: {
          select: {
            id: true,
            candidate: { select: { name: true } },
            job: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          {emails.length} email{emails.length !== 1 ? "s" : ""} sent
          {user.role !== "CORPORATE" ? " (filtered to your scope)" : ""}
        </p>
      </div>

      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>To</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead className="w-20">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  No email notifications yet.
                </TableCell>
              </TableRow>
            ) : (
              emails.map((email) => (
                <TableRow key={email.id} className="hover:bg-muted/40">
                  <TableCell className="text-sm">{email.to}</TableCell>
                  <TableCell className="max-w-xs">
                    <span className="line-clamp-1 text-sm">{email.subject}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {email.application ? (
                      <Link
                        href={`/admin/applicants/${email.application.id}`}
                        className="hover:text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        {email.application.candidate.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {email.application?.job.title ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(email.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <EmailBodyDialog
                      subject={email.subject}
                      body={email.body}
                      to={email.to}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
