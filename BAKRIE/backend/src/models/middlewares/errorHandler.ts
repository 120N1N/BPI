import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Parsing status error atau default 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;
  
  // Menjaga rahasia stack trace agar tidak bocor ke user saat di tahap Produksi (Production)
  const isDev = process.env.NODE_ENV !== 'production';

  console.error(`[ERROR] ${req.method} ${req.path} >>`, err);

  res.status(statusCode).json({
    status: 'error',
    message: err.isOperational ? err.message : 'Internal Server Error - Terjadi kesalahan tidak terduga pada server',
    ...(isDev && { stack: err.stack }) // Tampilkan jejak error hanya sat Development
  });
};
