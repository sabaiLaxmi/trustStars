const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT pg_advisory_unlock(72707369)`;
    console.log('Unlock result:', result);
  } catch (e) {
    console.error('Error unlocking:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
