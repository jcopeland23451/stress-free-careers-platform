import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/jobs", label: "Open Jobs" },
      { href: "/locations", label: "Locations" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/why-stress-free", label: "Why Stress-Free" },
      { href: "/benefits", label: "Benefits" },
      { href: "/growth", label: "Growth & Training" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy & Your Data" },
      { href: "/accessibility", label: "Accessibility" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/brand/mark.png" alt="" width={28} height={28} className="rounded-full" />
            <p className="font-heading text-lg font-extrabold text-primary">
              {COMPANY.name}
            </p>
          </div>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            {COMPANY.tagline} Careers across California &amp; Texas.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground">
          <p>{COMPANY.eoeStatement}</p>
          <p className="mt-2">
            © {new Date().getFullYear()} {COMPANY.name}. Demo build.
          </p>
        </div>
      </div>
    </footer>
  );
}
