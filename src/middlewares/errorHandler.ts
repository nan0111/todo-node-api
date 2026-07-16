/**
 * エラーハンドリングミドルウェア。
 * アプリケーション全体で発生したエラーをキャッチし、適切なHTTPステータスコードとレスポンスを返す。
 */
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    const flattened = z.flattenError(err);
    return res.status(400).json({
      error: 'Validation Error',
      details: flattened.fieldErrors,
    });
  }

  console.error('system error:', err.stack);

  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({ error: err.stack });
  }

  res.status(500).json({ error: 'Server Error' });
};
