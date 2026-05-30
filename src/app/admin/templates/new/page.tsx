import { requireRole } from "@/lib/auth";
import { TemplateForm } from "@/components/admin/templates/template-form";
import { createTemplate } from "@/app/admin/templates/actions";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "New Template | Stress-Free Hiring" };

export default async function NewTemplatePage() {
  await requireRole("CORPORATE");

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
        <span className="text-foreground">New Template</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Create Job Template</h1>

      <TemplateForm action={createTemplate} submitLabel="Create Template" />
    </div>
  );
}
