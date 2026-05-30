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
  createTrainingProgram,
  updateTrainingProgram,
  deleteTrainingProgram,
} from "@/app/admin/content/actions";
import { toast } from "sonner";

type TrainingRow = {
  id: string;
  title: string;
  summary: string;
  body: string;
  order: number;
};

export function CreateTrainingDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createTrainingProgram(fd);
      if (res.error) {
        setError(res.error);
      } else {
        toast.success("Training program created");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Program
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Training Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor="tp-title">Title</Label>
            <Input id="tp-title" name="title" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tp-summary">Summary (short)</Label>
            <Textarea id="tp-summary" name="summary" rows={2} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tp-body">Body (full content)</Label>
            <Textarea id="tp-body" name="body" rows={6} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tp-order">Display order</Label>
            <Input id="tp-order" name="order" type="number" defaultValue="0" />
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

export function EditTrainingDialog({ program }: { program: TrainingRow }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateTrainingProgram(program.id, fd);
      if (res.error) {
        setError(res.error);
      } else {
        toast.success("Program updated");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Edit program: ${program.title}`}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Training Program</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor={`edit-tp-title-${program.id}`}>Title</Label>
            <Input
              id={`edit-tp-title-${program.id}`}
              name="title"
              defaultValue={program.title}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-tp-summary-${program.id}`}>Summary</Label>
            <Textarea
              id={`edit-tp-summary-${program.id}`}
              name="summary"
              rows={2}
              defaultValue={program.summary}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-tp-body-${program.id}`}>Body</Label>
            <Textarea
              id={`edit-tp-body-${program.id}`}
              name="body"
              rows={6}
              defaultValue={program.body}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-tp-order-${program.id}`}>Display order</Label>
            <Input
              id={`edit-tp-order-${program.id}`}
              name="order"
              type="number"
              defaultValue={program.order}
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

export function DeleteTrainingButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      disabled={pending}
      aria-label={`Delete program: ${title}`}
      onClick={() => {
        if (!confirm(`Delete training program "${title}"?`)) return;
        startTransition(async () => {
          const res = await deleteTrainingProgram(id);
          if (res.error) toast.error(res.error);
          else toast.success("Deleted");
        });
      }}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
