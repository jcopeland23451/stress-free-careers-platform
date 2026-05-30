import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Prisma 7 requires a driver adapter at runtime. We use libsql (prebuilt
// binaries — no native compile, which matters on bleeding-edge Node).
// The url is CWD-relative on purpose: commands run from the project root,
// and a relative path avoids URL-encoding issues with the space in the
// absolute project path.
const adapter = new PrismaLibSql({ url: "file:dev.db" });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
