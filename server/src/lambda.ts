import serverlessExpress from '@codegenie/serverless-express';
import { createApp } from './app';

/**
 * Lambda用のExpressアプリケーションハンドラー
 */
const app = createApp();

export const handler = serverlessExpress({ app });
