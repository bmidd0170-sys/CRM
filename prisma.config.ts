import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export default defineConfig({
    migrations: {
        seed: 'node prisma/seed.js',
    },
    datasource: {
        url: process.env.DATABASE_URL!,
    },
});
