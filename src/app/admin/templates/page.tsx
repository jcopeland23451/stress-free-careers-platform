import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";
import { formatPay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export const metadata = { title: "Job Templates | Stress-Free Hiring" };

export default async function TemplatesPage() {
  // Corporate only
  await requireRole("CORPORATE");

  const templates = await prisma.jobTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { jobs: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Templates</h1>
          <p className="text-sm text-muted-foreground">
            Reusable templates prefill job postings with default content, pay
            range, and screening questions.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/templates/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Template
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-0" />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default Pay</TableHead>
                <TableHead className="text-right">Jobs Using</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No templates yet.{" "}
                    <Link
                      href="/admin/templates/new"
                      className="underline hover:no-underline"
                    >
                      Create your first template
                    </Link>
                    .
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((tpl) => (
                  <TableRow key={tpl.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/templates/${tpl.id}`}
                        className="hover:underline focus:outline-none focus-visible:underline"
                      >
                        {tpl.title}
                      </Link>
                      {tpl.level && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Level {tpl.level}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tpl.department}
                    </TableCell>
                    <TableCell className="text-sm">
                      {
                        EMPLOYMENT_TYPE_LABELS[
                          tpl.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS
                        ]
                      }
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatPay(tpl.payType, tpl.payMin, tpl.payMax)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {tpl._count.jobs}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tpl.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
