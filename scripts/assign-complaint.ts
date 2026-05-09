import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const worker = await prisma.user.findFirst({
    where: { role: 'OFFICER' }
  });

  if (!worker) {
    console.log("No worker found");
    return;
  }

  const complaints = await prisma.complaint.findMany({
    take: 2
  });

  if (complaints.length === 0) {
    console.log("No complaints found");
    return;
  }

  const newStatus = await prisma.status.upsert({
    where: { name: 'Assigned' },
    update: {},
    create: { name: 'Assigned' }
  });

  for (const c of complaints) {
    await prisma.complaint.update({
      where: { id: c.id },
      data: {
        assignedToId: worker.id,
        statusId: newStatus.id
      }
    });
    console.log(`Assigned complaint ${c.id} to worker ${worker.id}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
