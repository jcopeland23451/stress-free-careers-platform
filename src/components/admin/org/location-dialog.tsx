"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { US_STATES } from "@/lib/constants";
import {
  createLocation,
  updateLocation,
  deleteLocation,
} from "@/app/admin/org/actions";
import { toast } from "sonner";

type District = { id: string; name: string };

type LocationRow = {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  zip: string;
  phone: string | null;
  districtId: string;
};

// ---- Create Dialog ----

export function CreateLocationDialog({ districts }: { districts: District[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [districtId, setDistrictId] = useState("");
  const [state, setState] = useState("CA");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("districtId", districtId);
    fd.set("state", state);
    startTransition(async () => {
      const res = await createLocation(fd);
      if (res.error) {
        setError(res.error);
      } else {
        toast.success("Location created");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Location
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor="loc-name">Name</Label>
            <Input id="loc-name" name="name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="loc-address">Address</Label>
            <Input id="loc-address" name="address" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="loc-city">City</Label>
              <Input id="loc-city" name="city" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="loc-state">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger id="loc-state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(US_STATES).map(([code, label]) => (
                    <SelectItem key={code} value={code}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="loc-zip">Zip</Label>
              <Input id="loc-zip" name="zip" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="loc-phone">Phone</Label>
              <Input id="loc-phone" name="phone" type="tel" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="loc-lat">Latitude</Label>
              <Input id="loc-lat" name="lat" type="number" step="0.0001" defaultValue="0" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="loc-lng">Longitude</Label>
              <Input id="loc-lng" name="lng" type="number" step="0.0001" defaultValue="0" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="loc-district">District</Label>
            <Select value={districtId} onValueChange={setDistrictId} required>
              <SelectTrigger id="loc-district">
                <SelectValue placeholder="Select district…" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending || !districtId}>
              {pending ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Edit Dialog ----

export function EditLocationDialog({
  location,
}: {
  location: LocationRow;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState(location.state);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("state", state);
    startTransition(async () => {
      const res = await updateLocation(location.id, fd);
      if (res.error) {
        setError(res.error);
      } else {
        toast.success("Location updated");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Edit ${location.name}`}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor={`edit-loc-name-${location.id}`}>Name</Label>
            <Input
              id={`edit-loc-name-${location.id}`}
              name="name"
              defaultValue={location.name}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-loc-address-${location.id}`}>Address</Label>
            <Input
              id={`edit-loc-address-${location.id}`}
              name="address"
              defaultValue={location.address}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor={`edit-loc-city-${location.id}`}>City</Label>
              <Input
                id={`edit-loc-city-${location.id}`}
                name="city"
                defaultValue={location.city}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-loc-state-${location.id}`}>State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger id={`edit-loc-state-${location.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(US_STATES).map(([code, label]) => (
                    <SelectItem key={code} value={code}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor={`edit-loc-zip-${location.id}`}>Zip</Label>
              <Input
                id={`edit-loc-zip-${location.id}`}
                name="zip"
                defaultValue={location.zip}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-loc-phone-${location.id}`}>Phone</Label>
              <Input
                id={`edit-loc-phone-${location.id}`}
                name="phone"
                type="tel"
                defaultValue={location.phone ?? ""}
              />
            </div>
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

// ---- Delete Button ----

export function DeleteLocationButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete location "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteLocation(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Location deleted");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={handleDelete}
      disabled={pending}
      aria-label={`Delete ${name}`}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
