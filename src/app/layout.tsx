import type { Metadata } from "next";
import { Montserrat, Sofia_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { COMPANY } from "@/lib/constants";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});
const sofia = Sofia_Sans({
  subsets: ["latin"],
  variable: "--font-sofia",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `Careers — ${COMPANY.name}`,
    template: `%s — ${COMPANY.name} Careers`,
  },
  description:
    "Build a career with Stress-Free Auto Care — technicians, service advisors, and management roles across California and Texas.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${sofia.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
