import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./constants";

const rawSecret = process.env.AUTH_SECRET;
if (!rawSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "AUTH_SECRET environment variable must be set in production.",
  );
}
const secret = new TextEncoder().encode(
  rawSecret ?? "dev-only-insecure-secret-change-me",
);
const COOKIE_NAME = "sf_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  regionId: string | null;
  districtId: string | null;
  locationId: string | null;
};

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as Role,
      regionId: (payload.regionId as string | null) ?? null,
      districtId: (payload.districtId as string | null) ?? null,
      locationId: (payload.locationId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

/** Alias matching the Next docs convention. */
export const auth = getCurrentUser;

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/admin");
  return user;
}
