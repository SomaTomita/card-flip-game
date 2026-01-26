import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cardRoutes from './routes/cardRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

dotenv.config();

/**
 * Expressアプリケーションを作成する
 */
function createApp(): Application {
  const app = express();

  // CORS設定
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.use(
    cors({
      origin: corsOrigin.split(',').map((o) => o.trim()),
      credentials: true,
    })
  );

  // リクエストボディのパース
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ヘルスチェック
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // APIルート
  app.use('/api/cards', cardRoutes);

  // 404ハンドラー
  app.use(notFoundHandler);

  // エラーハンドラー
  app.use(errorHandler);

  return app;
}

export { createApp };
