#!/usr/bin/env node

/**
 * Conditional migration script
 * Only runs prisma migrate deploy if DATABASE_URL is set
 * Silently continues even if migrations fail
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const configCandidates = [
  'prisma.config.ts',
  'prisma.config.js',
  'prisma.config.mjs',
];
const hasPrismaConfig = configCandidates.some((file) =>
  fs.existsSync(path.join(process.cwd(), file))
);

if (!process.env.DATABASE_URL) {
  console.log('⚠️  DATABASE_URL is not set. Skipping database migrations.');
  process.exit(0);
}

if (!hasPrismaConfig) {
  console.log('⚠️  Prisma config file not found. Skipping database migrations.');
  process.exit(0);
}

try {
  console.log('Running Prisma migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.warn('⚠️  Migration warning:', error.message);
  console.log('Continuing with build despite migration issues...');
  // Don't exit with error - allow build to continue
  process.exit(0);
}
