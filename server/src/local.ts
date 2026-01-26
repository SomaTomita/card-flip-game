import { createApp } from './app';

/**
 * ローカル開発用サーバーを起動する
 */
async function startLocalServer(): Promise<void> {
  const app = createApp();
  const port = parseInt(process.env.PORT || '3000', 10);

  app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📍 Health check: http://localhost:${port}/health`);
    console.log(`📍 API: http://localhost:${port}/api/cards`);
    console.log(`\nEnvironment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startLocalServer().catch(console.error);
