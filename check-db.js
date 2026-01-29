const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking admins in database...');
  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      restrictions: true
    }
  });
  console.log('Admins found:', JSON.stringify(admins, null, 2));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
