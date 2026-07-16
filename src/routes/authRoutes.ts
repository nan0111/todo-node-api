/**
 * 認証ルート定義。
 * ユーザー登録、ログイン、ユーザー情報取得のエンドポイントを定義する。
 */
import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validate';

const router = Router();

const authSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8),
  }),
});

router.post('/signup', authRateLimiter, validate(authSchema), authController.signUp);
router.post('/signin', authRateLimiter, validate(authSchema), authController.signIn);

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    userId: req.userId as string | null,
  });
});

export default router;
