/**
 * systemルート定義。
 * アプリケーションのヘルスチェックやデータベース接続確認のエンドポイントを定義する。
 */
import { Router } from 'express';
import { systemController } from '../controllers/systemController';

const router = Router();

router.get('/', systemController.root);
router.get('/health', systemController.checkDatabase);

export default router;
