"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { setSessionCookie, clearSessionCookie } from "./auth";
import type { Role } from "./constants";

export type LoginState = { error?: string };

// Basic in-memory login throttle (demo-grade — per server instance). For a
// real deploy use a shared store (Redis) and key on IP + email.
const attempts = new Map<string, { count: number; first: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function allowAttempt(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return true;
  }
  rec.count += 1;
  return rec.count <= MAX_ATTEMPTS;
}

function resetAttempts(key: string): void {
  attempts.delete(key);
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");

  if (!allowAttempt(email)) {
    return {
      error: "Too many sign-in attempts. Please wait a few minutes and try again.",
    };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  resetAttempts(email);

  await setSessionCookie({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    regionId: user.regionId,
    districtId: user.districtId,
    locationId: user.locationId,
  });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
