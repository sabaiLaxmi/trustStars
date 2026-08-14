const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const forms = await prisma.form.findMany();
  for (let form of forms) {
    if (form.images) {
      try {
        JSON.parse(form.images);
        console.log(form.id, 'VALID');
      } catch (e) {
        console.log(form.id, 'INVALID:', e.message);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
