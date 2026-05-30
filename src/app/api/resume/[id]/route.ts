import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { requireUser } from "@/lib/auth";
import { applicationScopeWhere } from "@/lib/rbac";
import { prisma } from "@/lib/db";

// --------------------------------------------------------------------------
// GET /api/resume/[id]
// Auth-gated — admin only. Streams the resume file from disk.
// --------------------------------------------------------------------------

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: Context) {
  // Auth + object-level authorization: the requester must be a signed-in admin
  // AND the resume must belong to an application within their RBAC scope. This
  // prevents IDOR — e.g. a GM downloading another shop's candidate resume by id.
  const user = await requireUser();
  const scopeWhere = await applicationScopeWhere(user);

  const { id } = await context.params;

  const resumeFile = await prisma.resumeFile.findFirst({
    where: { id, applications: { some: { ...scopeWhere } } },
  });

  if (!resumeFile) {
    return new NextResponse("Resume not found", { status: 404 });
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(resumeFile.storagePath);
  } catch {
    return new NextResponse("File not found on server", { status: 404 });
  }

  const safeFilename = resumeFile.filename.replace(/[^\w.\-]/g, "_");

  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": resumeFile.mime || "application/octet-stream",
      "Content-Disposition": `inline; filename="${safeFilename}"`,
      "Content-Length": String(fileBuffer.byteLength),
      // Don't cache resumes in the browser
      "Cache-Control": "private, no-store",
    },
  });
}
