"use client";

import { setDemoRole } from "@/lib/auth-actions";
import { ROLES, type Role } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SHORT_LABEL: Record<Role, string> = {
  CORPORATE: "Corporate",
  REGIONAL: "Regional",
  DISTRICT: "District",
  GM: "GM",
};

/**
 * Demo-only role switcher shown in the admin top bar. Each button instantly
 * sets the session to a seeded demo user for that role, so reviewers can see
 * how the cascading RBAC scopes the same screens — no login required.
 */
export function DemoRoleSwitcher({ currentRole }: { currentRole: Role }) {
  return (
    <div
      role="group"
      aria-label="Demo: view the admin as a different role"
      className="flex w-max flex-nowrap items-center gap-1 rounded-lg border border-border bg-muted/60 p-1"
    >
      <span className="hidden whitespace-nowrap px-2 text-xs font-medium text-muted-foreground sm:inline">
        View as
      </span>
      {ROLES.map((role) => {
        const active = role === currentRole;
        return (
          <form key={role} action={setDemoRole.bind(null, role)}>
            <button
              type="submit"
              aria-current={active ? "true" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:bg-background hover:text-foreground",
              )}
            >
              {SHORT_LABEL[role]}
            </button>
          </form>
        );
      })}
    </div>
  );
}
