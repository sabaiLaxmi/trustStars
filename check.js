import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.session.findMany().then(sessions => {
  console.log(JSON.stringify(sessions, null, 2));
}).finally(() => prisma.$disconnect());
