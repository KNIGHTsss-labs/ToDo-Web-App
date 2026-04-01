// Backend/prisma.config.ts
import 'dotenv/config';  // เพิ่มบรรทัดนี้
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});