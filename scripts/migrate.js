#!/usr/bin/env node

/**
 * Conditional migration script
 * Only runs prisma migrate deploy if DATABASE_URL is set
 */

const { execSync } = require('child_process');

if (!process.env.DATABASE_URL) {
  console.log('⚠️  DATABASE_URL is not set. Skipping database migrations.');
  console.log('Set DATABASE_URL environment variable to enable migrations.');
  process.exit(0);
}

try {
  console.log('Running Prisma migrations...');
  execSync('prisma migrate deploy --skip-generate', { stdio: 'inherit' });
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
