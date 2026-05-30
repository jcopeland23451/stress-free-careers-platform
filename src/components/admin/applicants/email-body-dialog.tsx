"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  subject: string;
  body: string;
  to: string;
};

export function EmailBodyDialog({ subject, body, to }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          aria-label={`Read full email: ${subject}`}
        >
          <Mail className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          Read
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6">{subject}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">To: {to}</p>
          <div className="rounded-md border bg-muted/30 p-4">
            <pre className="whitespace-pre-wrap text-sm font-sans">{body}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
