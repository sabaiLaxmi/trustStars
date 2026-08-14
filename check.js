import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  try {
    const forms = await prisma.form.findMany({
      select: {
        id: true,
        title: true,
        images: true,
        templateId: true
      }
    });
    const sanitizedForms = forms.map(f => ({
      ...f,
      images: f.images ? `${f.images.substring(0, 100)}... (length: ${f.images.length})` : null
    }));
    console.log('Forms:', JSON.stringify(sanitizedForms, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
