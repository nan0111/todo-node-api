/**
 * systemサービス。
 * アプリケーションのヘルスチェックやデータベース接続確認などの共通機能を提供する。
 */
import prisma from '../config/prisma';

export const systemService = {
  root: () => true,

  checkDatabase: async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  },
};
