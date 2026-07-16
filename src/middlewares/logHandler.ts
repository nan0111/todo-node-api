/**
 * リクエストログ出力ミドルウェア。
 * すべてのリクエストに対して、IPアドレス、メソッド、URL、ステータスコード、レスポンスサイズを記録する。
 */
import { Request, Response, NextFunction } from 'express';

export const logHandler = (req: Request, res: Response, next: NextFunction): void => {
  const timestamp = `[${new Date().toISOString()}]`;
  const ip = req.ip || req.socket.remoteAddress || '-';

  res.on('finish', () => {
    const method = req.method;
    const url = req.originalUrl;
    const httpVersion = `HTTP/${req.httpVersion}`;
    const status = res.statusCode;
    const size = res.get('Content-Length') || '-';

    console.log(
      `logHandler ${ip} - - ${timestamp} "${method} ${url} ${httpVersion}" ${status} ${size}`,
    );
  });

  next();
};
