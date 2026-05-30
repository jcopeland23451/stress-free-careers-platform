import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Building2,
  Megaphone,
  Mail,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "./constants";

export type PublicNavItem = { href: string; label: string };

export const PUBLIC_NAV: PublicNavItem[] = [
  { href: "/locations", label: "Locations" },
  { href: "/why-stress-free", label: "Why Stress-Free" },
  { href: "/benefits", label: "Benefits" },
  { href: "/growth", label: "Growth" },
];

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
};

const ALL: Role[] = ["CORPORATE", "REGIONAL", "DISTRICT", "GM"];

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ALL },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase, roles: ALL },
  { href: "/admin/applicants", label: "Applicants", icon: Users, roles: ALL },
  {
    href: "/admin/templates",
    label: "Job Templates",
    icon: FileText,
    roles: ["CORPORATE"],
  },
  {
    href: "/admin/org",
    label: "Organization",
    icon: Building2,
    roles: ["CORPORATE"],
  },
  {
    href: "/admin/content",
    label: "Content",
    icon: Megaphone,
    roles: ["CORPORATE"],
  },
  { href: "/admin/notifications", label: "Notifications", icon: Mail, roles: ALL },
];
