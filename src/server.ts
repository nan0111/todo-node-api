/**
 * サーバーのエントリーポイント。
 * HTTPサーバーを起動し、SIGTERMシグナル受信時にリソースを解放して正常終了する。
 */
import app from './app';
import dotenv from 'dotenv';
import { validateEnv } from './config/env';
import prisma from './config/prisma';

dotenv.config();
validateEnv();

const PORT = 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(async () => {
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch (err) {
        console.error('Error disconnecting Prisma:', err);
      }
    }

    process.exit(0);
  });
});
