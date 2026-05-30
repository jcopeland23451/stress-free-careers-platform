import { prisma } from "@/lib/db";

async function main() {
  const n = await prisma.organization.count();
  console.log("DB OK. organizations:", n);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
