"use client";

import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addNote } from "@/app/admin/applicants/actions";
import { toast } from "sonner";

export function NoteForm({ applicationId }: { applicationId: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    startTransition(async () => {
      const result = await addNote(applicationId, body);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Note added");
        ref.current?.reset();
      }
    });
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="note-body" className="text-sm font-medium">
        Add internal note
      </Label>
      <Textarea
        id="note-body"
        name="body"
        placeholder="Add a note visible to your team only…"
        rows={3}
        className="resize-none"
        required
        aria-required="true"
        disabled={pending}
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save note"}
      </Button>
    </form>
  );
}
