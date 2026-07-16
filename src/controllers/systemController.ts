/**
 * systemコントローラー。
 * アプリケーションのヘルスチェックやデータベース接続確認のリクエストを処理する。
 */
import { Request, Response, NextFunction } from 'express';
import { systemService } from '../services/systemService';

export const systemController = {
  root: async (_req: Request, res: Response, _next: NextFunction) => {
    const task = await systemService.root();
    if (task) {
      res.status(200).json({
        status: 'ok',
      });
    } else {
      res.status(503).json({
        status: 'ng',
      });
    }
  },

  checkDatabase: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await systemService.checkDatabase();
      if (task) {
        res.status(200).json({
          status: 'ok',
        });
      } else {
        res.status(503).json({
          status: 'ng',
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
