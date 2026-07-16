/**
 * 環境変数のバリデーション定義。
 * アプリケーション起動時に必要な環境変数が存在し、正しい形式であることを保証する。
 */
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(1),
});

export const validateEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', z.treeifyError(result.error));
    process.exit(1);
  }
};
