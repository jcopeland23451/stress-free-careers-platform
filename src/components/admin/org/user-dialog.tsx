"use client";

import { useState, useTransition } from "react";
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
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import type { Role } from "@/lib/constants";
import { createUser, updateUser, deleteUser } from "@/app/admin/org/actions";
import { toast } from "sonner";

type OrgOption = { id: string; name: string };

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  regionId: string | null;
  districtId: string | null;
  locationId: string | null;
};

// ---- Create Dialog ----

export function CreateUserDialog({
  regions,
  districts,
  locations,
}: {
  regions: OrgOption[];
  districts: OrgOption[];
  locations: OrgOption[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("GM");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("role", role);
    startTransition(async () => {
      const res = await createUser(fd);
      if (res.error) {
        setError(res.error);
      } else {
        toast.success("User created");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Admin User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor="user-name">Full name</Label>
            <Input id="user-name" name="name" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="user-email">Email</Label>
            <Input id="user-email" name="email" type="email" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="user-password">Password</Label>
            <Input id="user-password" name="password" type="password" required minLength={8} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="user-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {role === "REGIONAL" && (
            <div className="space-y-1">
              <Label htmlFor="user-region">Region</Label>
              <Select name="regionId">
                <SelectTrigger id="user-region">
                  <SelectValue placeholder="Select region…" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {role === "DISTRICT" && (
            <div className="space-y-1">
              <Label htmlFor="user-district">District</Label>
              <Select name="districtId">
                <SelectTrigger id="user-district">
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
          )}
          {role === "GM" && (
            <div className="space-y-1">
              <Label htmlFor="user-location">Location</Label>
              <Select name="locationId">
                <SelectTrigger id="user-location">
                  <SelectValue placeholder="Select location…" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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

// ---- Edit Dialog ----

export function EditUserDialog({
  user,
  regions,
  districts,
  locations,
}: {
  user: UserRow;
  regions: OrgOption[];
  districts: OrgOption[];
  locations: OrgOption[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(user.role as Role);
  const [regionId, setRegionId] = useState(user.regionId ?? "");
  const [districtId, setDistrictId] = useState(user.districtId ?? "");
  const [locationId, setLocationId] = useState(user.locationId ?? "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("role", role);
    fd.set("regionId", regionId);
    fd.set("districtId", districtId);
    fd.set("locationId", locationId);
    startTransition(async () => {
      const res = await updateUser(user.id, fd);
      if (res.error) {
        setError(res.error);
      } else {
        toast.success("User updated");
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={`Edit ${user.name}`}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor={`edit-user-name-${user.id}`}>Full name</Label>
            <Input
              id={`edit-user-name-${user.id}`}
              name="name"
              defaultValue={user.name}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edit-user-role-${user.id}`}>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id={`edit-user-role-${user.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {role === "REGIONAL" && (
            <div className="space-y-1">
              <Label htmlFor={`edit-user-region-${user.id}`}>Region</Label>
              <Select value={regionId} onValueChange={setRegionId}>
                <SelectTrigger id={`edit-user-region-${user.id}`}>
                  <SelectValue placeholder="Select region…" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {role === "DISTRICT" && (
            <div className="space-y-1">
              <Label htmlFor={`edit-user-district-${user.id}`}>District</Label>
              <Select value={districtId} onValueChange={setDistrictId}>
                <SelectTrigger id={`edit-user-district-${user.id}`}>
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
          )}
          {role === "GM" && (
            <div className="space-y-1">
              <Label htmlFor={`edit-user-location-${user.id}`}>Location</Label>
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id={`edit-user-location-${user.id}`}>
                  <SelectValue placeholder="Select location…" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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

export function DeleteUserButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteUser(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("User deleted");
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
