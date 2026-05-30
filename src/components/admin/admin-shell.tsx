"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, ChevronDown, Menu } from "lucide-react";
import { ADMIN_NAV } from "@/lib/nav";
import { type Role } from "@/lib/constants";
import { DemoRoleSwitcher } from "@/components/admin/demo-role-switcher";
import { logoutAction } from "@/lib/auth-actions";
import { cn, initials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

type ShellUser = { name: string; email: string; role: Role };

export function AdminShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const nav = ADMIN_NAV.filter((i) => i.roles.includes(user.role));
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  // Shared link list — rendered in both the desktop sidebar and the mobile
  // drawer so navigation stays identical and reachable at every width.
  const navLinks = (onNavigate?: () => void) =>
    nav.map((item) => {
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground",
            isActive(item.href) &&
              "bg-primary/10 text-primary hover:bg-primary/10",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {item.label}
        </Link>
      );
    });

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-secondary/30 md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4 font-heading font-extrabold text-primary">
          <Image src="/brand/mark.png" alt="" width={28} height={28} className="rounded-full" />
          Hiring
        </div>
        <nav aria-label="Admin" className="flex-1 space-y-1 p-3">
          {navLinks()}
        </nav>
      </aside>

      {/* Mobile nav drawer (sidebar is hidden below md) */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0">
          <div className="flex h-14 items-center gap-2 border-b px-4 font-heading font-extrabold text-primary">
            <Image src="/brand/mark.png" alt="" width={28} height={28} className="rounded-full" />
            <SheetTitle className="font-heading font-extrabold text-primary">
              Hiring
            </SheetTitle>
          </div>
          <nav
            aria-label="Admin"
            className="flex-1 space-y-1 overflow-y-auto p-3"
          >
            {navLinks(() => setMobileNavOpen(false))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b bg-background px-3 sm:px-4">
          {/* Hamburger — only when the sidebar is hidden */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Role switcher scrolls horizontally instead of wrapping/clipping */}
          <div className="min-w-0 flex-1 overflow-x-auto">
            <DemoRoleSwitcher currentRole={user.role} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {initials(user.name)}
              </span>
              <span className="hidden sm:inline">{user.name}</span>
              <ChevronDown className="h-4 w-4 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="font-normal">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  void logoutAction();
                }}
              >
                <LogOut className="h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main id="main" className="flex-1 bg-muted/30 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
