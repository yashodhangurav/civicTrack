import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'citizen@test.com', name: 'John Citizen', role: Role.CITIZEN },
    { email: 'worker@test.com', name: 'Mike Worker', role: Role.OFFICER },
    { email: 'supervisor@test.com', name: 'Sarah Supervisor', role: Role.SUPERVISOR },
    { email: 'admin@test.com', name: 'Admin User', role: Role.ADMIN },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
      }
    });
  }

  console.log('Seeded 4 users: citizen@test.com, worker@test.com, supervisor@test.com, admin@test.com (Password: password123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
