import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "Admin Sign In" };

const DEMO_LOGINS = [
  ["corporate@stressfree.test", "Corporate / HR — sees all shops"],
  ["regional@stressfree.test", "Regional — one region"],
  ["district@stressfree.test", "District — 3–5 shops"],
  ["gm@stressfree.test", "GM — a single shop"],
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Link
            href="/"
            className="mx-auto flex items-center gap-2 font-heading text-lg font-extrabold text-primary"
          >
            <Image src="/brand/mark.png" alt="" width={32} height={32} className="rounded-full" />
            {COMPANY.name}
          </Link>
          <CardTitle className="mt-2">Hiring portal sign in</CardTitle>
          <CardDescription>Admin &amp; manager access</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">
              Demo logins — password: <code>demo1234</code>
            </p>
            <ul className="mt-1 space-y-0.5">
              {DEMO_LOGINS.map(([email, desc]) => (
                <li key={email}>
                  <code>{email}</code> — {desc}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
