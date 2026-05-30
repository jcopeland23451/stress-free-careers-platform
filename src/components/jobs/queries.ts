import { prisma } from "@/lib/db";

export type JobWithLocations = Awaited<ReturnType<typeof getOpenJobs>>[number];
export type LocationWithJobs = Awaited<ReturnType<typeof getLocationsWithJobs>>[number];

export async function getOpenJobs() {
  return prisma.job.findMany({
    where: { status: "OPEN" },
    include: {
      locations: {
        include: { location: { include: { district: { include: { region: true } } } } },
      },
      _count: { select: { applications: true } },
    },
    orderBy: { postedAt: "desc" },
  });
}

export async function getOpenJobById(id: string) {
  return prisma.job.findFirst({
    where: { id, status: "OPEN" },
    include: {
      locations: {
        include: { location: { include: { district: { include: { region: true } } } } },
      },
    },
  });
}

export async function getLocationsWithJobs() {
  return prisma.location.findMany({
    include: {
      district: { include: { region: true } },
      jobLinks: {
        include: {
          job: { select: { id: true, status: true } },
        },
      },
    },
    orderBy: [{ state: "asc" }, { city: "asc" }],
  });
}

export async function getLocationBySlug(slug: string) {
  return prisma.location.findUnique({
    where: { slug },
    include: {
      district: { include: { region: true } },
      jobLinks: {
        include: {
          job: {
            select: {
              id: true,
              title: true,
              department: true,
              level: true,
              employmentType: true,
              payType: true,
              payMin: true,
              payMax: true,
              status: true,
              postedAt: true,
              isRemote: true,
            },
          },
        },
        where: { job: { status: "OPEN" } },
      },
    },
  });
}
