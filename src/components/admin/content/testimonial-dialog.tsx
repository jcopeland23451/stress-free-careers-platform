"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/app/admin/content/actions";
import { toast } from "sonner";

type TestimonialRow = {
  id: string;
  name: string;
  role: string;
  locationName: string | null;
  quote: string;
  photoUrl: string | null;
  order: number;
};

export function CreateTestimonialDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createTestimonial(fd);
      if (res.error) {
        setError(res.error);
      } else {
        toast.success("Testimonial created");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Testimonial
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Testimonial</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor="test-name">Name</Label>
            <Input id="test-name" name="name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="test-role">Role / Title</Label>
            <Input id="test-role" name="role" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="test-location">Location name (optional)</Label>
            <Input id="test-location" name="locationName" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="test-quote">Quote</Label>
            <Textarea id="test-quote" name="quote" rows={4} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="test-photo">Photo URL (optional)</Label>
            <Input id="test-photo" name="photoUrl" type="url" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="test-order">Display order</Label>
            <Input id="test-order" name="order" type="number" defaultValue="0" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditTestimonialDialog({ testimonial }: { testimonial: TestimonialRow }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateTestimonial(testimonial.id, fd);
      if (res.error) {
        setError(res.error);
      } else {
        toast.success("Testimonial updated");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Edit testimonial by ${testimonial.name}`}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Testimonial</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor={`edit-test-name-${testimonial.id}`}>Name</Label>
            <Input id={`edit-test-name-${testimonial.id}`} name="name" defaultValue={testimonial.name} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-test-role-${testimonial.id}`}>Role / Title</Label>
            <Input id={`edit-test-role-${testimonial.id}`} name="role" defaultValue={testimonial.role} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-test-location-${testimonial.id}`}>Location name (optional)</Label>
            <Input id={`edit-test-location-${testimonial.id}`} name="locationName" defaultValue={testimonial.locationName ?? ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-test-quote-${testimonial.id}`}>Quote</Label>
            <Textarea id={`edit-test-quote-${testimonial.id}`} name="quote" rows={4} defaultValue={testimonial.quote} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-test-photo-${testimonial.id}`}>Photo URL (optional)</Label>
            <Input id={`edit-test-photo-${testimonial.id}`} name="photoUrl" type="url" defaultValue={testimonial.photoUrl ?? ""} />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-test-order-${testimonial.id}`}>Display order</Label>
            <Input id={`edit-test-order-${testimonial.id}`} name="order" type="number" defaultValue={testimonial.order} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteTestimonialButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={pending}
      aria-label={`Delete testimonial by ${name}`}
      onClick={() => {
        if (!confirm(`Delete testimonial by "${name}"?`)) return;
        startTransition(async () => {
          const res = await deleteTestimonial(id);
          if (res.error) toast.error(res.error);
          else toast.success("Deleted");
        });
      }}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
