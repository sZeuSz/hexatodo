import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../../../config/logger.js';
import { AppError } from '../../../domain/errors/app.error.js';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: true,
      message: err.message,
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: true,
      message: 'JSON inválido',
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: true,
      message: 'Dados inválidos',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  logger.error('Unhandled error', {
    error: err instanceof Error ? err.message : err,
  });

  res.status(500).json({
    error: true,
    message: 'Erro interno do servidor',
  });
}
