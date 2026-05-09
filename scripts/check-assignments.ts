import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const complaints = await prisma.complaint.findMany({
    select: {
      id: true,
      status: { select: { name: true } },
      assignedToId: true,
      user: { select: { name: true, role: true } }
    }
  });

  console.log("All Complaints:");
  console.log(JSON.stringify(complaints, null, 2));

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true
    }
  });

  console.log("All Users:");
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
