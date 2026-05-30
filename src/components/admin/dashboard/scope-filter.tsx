"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/**
 * Lets Corporate / Regional / District managers narrow the dashboard to a
 * single location within their scope. Hidden for GMs (one location).
 */
export function DashboardScopeFilter({
  locations,
  current,
}: {
  locations: { id: string; label: string }[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === "ALL") sp.delete("loc");
    else sp.set("loc", value);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Select value={current || "ALL"} onValueChange={handleChange}>
        <SelectTrigger
          className="w-[210px]"
          aria-label="Filter dashboard by location"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All my locations</SelectItem>
          {locations.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {l.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
