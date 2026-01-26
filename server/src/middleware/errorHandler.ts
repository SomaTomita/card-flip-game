import { Request, Response, NextFunction } from 'express';

/**
 * アプリケーションエラークラス
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * グローバルエラーハンドラーミドルウェア
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV === 'development';

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // 予期しないエラー
  console.error('Unexpected error:', err);

  const statusCode = err.message.includes('見つかりません') ? 404 : 500;
  const message = err.message || 'サーバーエラーが発生しました';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(isDev && { stack: err.stack }),
  });
}

/**
 * 404ハンドラー
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'エンドポイントが見つかりません',
  });
}
