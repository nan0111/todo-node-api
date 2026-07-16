/**
 * リクエストバリデーションミドルウェア。
 * Zodスキーマを使用して、リクエストのbody、query、paramsを検証する。
 */
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (!result.success) {
        console.error('Validation failed:', result.error.message);
        return res.status(400).json({ errors: 'Validation failed' });
      }
      // 検証済みデータを req.body に上書き
      req.body = result.data.body;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Validation error:', error.message);
        return res.status(400).json({
          error: 'Validation failed',
        });
      }
      next(error);
    }
  };
};
