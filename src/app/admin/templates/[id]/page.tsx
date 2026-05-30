import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TemplateForm } from "@/components/admin/templates/template-form";
import { updateTemplate, deleteTemplate } from "@/app/admin/templates/actions";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { formatPay } from "@/lib/utils";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/constants";

export const metadata = { title: "Edit Template | Stress-Free Hiring" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: PageProps) {
  await requireRole("CORPORATE");

  const { id } = await params;

  const template = await prisma.jobTemplate.findUnique({
    where: { id },
    include: {
      _count: { select: { jobs: true } },
    },
  });

  if (!template) notFound();

  // Bound actions
  async function boundUpdateTemplate(formData: FormData) {
    "use server";
    await updateTemplate(id, formData);
  }

  async function boundDeleteTemplate() {
    "use server";
    await deleteTemplate(id);
  }

  // Parse screening JSON — cast to the shape TemplateForm expects
  type ScreeningItem = {
    prompt: string;
    type: string;
    options: string[];
    required: boolean;
    isKnockout: boolean;
    order: number;
  };

  const screening: ScreeningItem[] = Array.isArray(template.screening)
    ? (template.screening as ScreeningItem[])
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/admin/templates"
          className="flex items-center gap-1 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Templates
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">{template.title}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{template.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {
              EMPLOYMENT_TYPE_LABELS[
                template.employmentType as keyof typeof EMPLOYMENT_TYPE_LABELS
              ]
            }{" "}
            &middot; {formatPay(template.payType, template.payMin, template.payMax)}
          </p>
        </div>
        <Badge variant="secondary">
          {template._count.jobs} job{template._count.jobs !== 1 ? "s" : ""}
        </Badge>
      </div>

      <TemplateForm
        defaultValues={{
          title: template.title,
          department: template.department,
          level: template.level ?? "",
          employmentType: template.employmentType,
          payType: template.payType,
          payMin: template.payMin,
          payMax: template.payMax,
          description: template.description,
          requirements: template.requirements,
          screening,
        }}
        action={boundUpdateTemplate}
        deleteAction={boundDeleteTemplate}
        submitLabel="Save Changes"
      />
    </div>
  );
}
