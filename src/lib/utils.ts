import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPay(
  payType: string,
  min: number,
  max: number,
): string {
  const fmt = (n: number) =>
    payType === "HOURLY"
      ? `$${n.toFixed(2)}`
      : `$${(n / 1000).toFixed(0)}k`;
  const unit = payType === "HOURLY" ? "/hr" : "/yr";
  if (min === max) return `${fmt(min)}${unit}`;
  return `${fmt(min)}–${fmt(max)}${unit}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
