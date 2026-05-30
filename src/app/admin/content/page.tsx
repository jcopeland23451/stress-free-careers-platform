import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CreateTestimonialDialog,
  EditTestimonialDialog,
  DeleteTestimonialButton,
} from "@/components/admin/content/testimonial-dialog";
import {
  CreateBenefitDialog,
  EditBenefitDialog,
  DeleteBenefitButton,
} from "@/components/admin/content/benefit-dialog";
import {
  CreateTrainingDialog,
  EditTrainingDialog,
  DeleteTrainingButton,
} from "@/components/admin/content/training-dialog";

export default async function ContentPage() {
  await requireRole("CORPORATE");

  const [testimonials, benefits, trainingPrograms] = await Promise.all([
    prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
    prisma.benefit.findMany({ orderBy: { order: "asc" } }),
    prisma.trainingProgram.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Content</h1>
        <p className="text-sm text-muted-foreground">
          Manage employer-branding content: testimonials, benefits, and training programs.
        </p>
      </div>

      <Tabs defaultValue="testimonials">
        <TabsList aria-label="Content sections">
          <TabsTrigger value="testimonials">
            Testimonials ({testimonials.length})
          </TabsTrigger>
          <TabsTrigger value="benefits">
            Benefits ({benefits.length})
          </TabsTrigger>
          <TabsTrigger value="training">
            Training ({trainingPrograms.length})
          </TabsTrigger>
        </TabsList>

        {/* ---- TESTIMONIALS ---- */}
        <TabsContent value="testimonials" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Testimonials</h2>
            <CreateTestimonialDialog />
          </div>
          <div className="rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Quote (preview)</TableHead>
                  <TableHead className="w-8">Order</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No testimonials yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  testimonials.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>{t.role}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.locationName ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {t.quote}
                      </TableCell>
                      <TableCell className="text-center">{t.order}</TableCell>
                      <TableCell className="text-right">
                        <EditTestimonialDialog testimonial={t} />
                        <DeleteTestimonialButton id={t.id} name={t.name} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ---- BENEFITS ---- */}
        <TabsContent value="benefits" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Benefits</h2>
            <CreateBenefitDialog />
          </div>
          <div className="rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead className="w-8">Order</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No benefits yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  benefits.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.title}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {b.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.icon ?? "—"}
                      </TableCell>
                      <TableCell className="text-center">{b.order}</TableCell>
                      <TableCell className="text-right">
                        <EditBenefitDialog benefit={b} />
                        <DeleteBenefitButton id={b.id} title={b.title} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ---- TRAINING PROGRAMS ---- */}
        <TabsContent value="training" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Training Programs</h2>
            <CreateTrainingDialog />
          </div>
          <div className="rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="w-8">Order</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainingPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No training programs yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  trainingPrograms.map((tp) => (
                    <TableRow key={tp.id}>
                      <TableCell className="font-medium">{tp.title}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {tp.slug}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {tp.summary}
                      </TableCell>
                      <TableCell className="text-center">{tp.order}</TableCell>
                      <TableCell className="text-right">
                        <EditTrainingDialog program={tp} />
                        <DeleteTrainingButton id={tp.id} title={tp.title} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
