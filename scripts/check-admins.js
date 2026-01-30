/**
 * Simple script to check admins in the database
 * Run with: node scripts/check-admins.js
 */

// Load environment variables from .env file
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Create Prisma client with pg adapter
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const useSsl = !/localhost|127\.0\.0\.1/i.test(databaseUrl);
const poolConfig = {
  connectionString: databaseUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
};

const prisma = new PrismaClient({
  adapter: new PrismaPg(poolConfig),
});

async function checkAdmins() {
  try {
    console.log('Checking admins in database...\n');

    const admins = await prisma.admin.findMany({
      orderBy: { id: 'asc' }
    });

    console.log(`Found ${admins.length} admin(s):\n`);

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Organization: ${admin.organizationName}`);
      console.log(`   Online: ${admin.online}`);
      console.log(`   ID: ${admin.id}`);
      console.log('');
    });

    if (admins.length === 0) {
      console.log('No admins found in database. You need to create one first!');
      console.log('\nYou can create an admin by:');
      console.log('1. Going to the home page (/) and clicking "Register"');
      console.log('2. Or using the registration form on the home page\n');
    }
  } catch (error) {
    console.error('Error checking admins:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();
