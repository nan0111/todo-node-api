/**
 * Expressアプリケーションの構成。
 * セッション管理、ミドルウェア、ルーティングを設定し、アプリケーションインスタンスを構築する。
 */
import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import { logHandler } from './middlewares/logHandler';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import systemRoutes from './routes/systemRoutes';

const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is required`);
  }
});

const app = express();

app.set('trust proxy', 1);

app.disable('x-powered-by');

app.use(express.json());

app.use(logHandler);

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.use('/', systemRoutes);

app.use((_req, _res, _next) => {
  _res.status(404).json({
    error: '404 error',
  });
});

app.use(errorHandler);

export default app;
