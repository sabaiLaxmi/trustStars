import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  const db = prisma;
  try {
    const form = await db.form.create({
      data: {
        shop: 'truststars-pmrpinot.myshopify.com',
        title: 'Test Template',
        description: 'Test',
        submitText: 'Submit',
        templateId: 1,
        fields: {
          create: [{ type: 'TEXT', label: 'Full Name', placeholder: 'Jane Doe', required: true, order: 0 }]
        }
      }
    });
    console.log('Success:', form.id);
    await db.form.delete({ where: { id: form.id } });
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
