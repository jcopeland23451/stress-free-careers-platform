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
  createBenefit,
  updateBenefit,
  deleteBenefit,
} from "@/app/admin/content/actions";
import { toast } from "sonner";

type BenefitRow = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  order: number;
};

export function CreateBenefitDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createBenefit(fd);
      if (res.error) {
        setError(res.error);
      } else {
        toast.success("Benefit created");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Benefit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Benefit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor="benefit-title">Title</Label>
            <Input id="benefit-title" name="title" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="benefit-description">Description</Label>
            <Textarea id="benefit-description" name="description" rows={3} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="benefit-icon">Icon name (optional, e.g. Heart)</Label>
            <Input id="benefit-icon" name="icon" placeholder="Heart" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="benefit-order">Display order</Label>
            <Input id="benefit-order" name="order" type="number" defaultValue="0" />
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

export function EditBenefitDialog({ benefit }: { benefit: BenefitRow }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateBenefit(benefit.id, fd);
      if (res.error) {
        setError(res.error);
      } else {
        toast.success("Benefit updated");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Edit benefit: ${benefit.title}`}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Benefit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor={`edit-benefit-title-${benefit.id}`}>Title</Label>
            <Input
              id={`edit-benefit-title-${benefit.id}`}
              name="title"
              defaultValue={benefit.title}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-benefit-desc-${benefit.id}`}>Description</Label>
            <Textarea
              id={`edit-benefit-desc-${benefit.id}`}
              name="description"
              rows={3}
              defaultValue={benefit.description}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-benefit-icon-${benefit.id}`}>Icon name</Label>
            <Input
              id={`edit-benefit-icon-${benefit.id}`}
              name="icon"
              defaultValue={benefit.icon ?? ""}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-benefit-order-${benefit.id}`}>Display order</Label>
            <Input
              id={`edit-benefit-order-${benefit.id}`}
              name="order"
              type="number"
              defaultValue={benefit.order}
            />
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

export function DeleteBenefitButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={pending}
      aria-label={`Delete benefit: ${title}`}
      onClick={() => {
        if (!confirm(`Delete benefit "${title}"?`)) return;
        startTransition(async () => {
          const res = await deleteBenefit(id);
          if (res.error) toast.error(res.error);
          else toast.success("Deleted");
        });
      }}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
