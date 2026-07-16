/**
 * 認証用レート制限ミドルウェア。
 * ブルートフォース攻撃を防ぐため、認証エンドポイントへのアクセスを制限する。
 */
import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
