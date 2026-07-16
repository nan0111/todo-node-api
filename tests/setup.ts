import prisma, { pool } from '../src/config/prisma';

afterAll(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }

  // コネクションプール終了
  if (pool) {
    await pool.end();
  }
});
