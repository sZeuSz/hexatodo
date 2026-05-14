import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env.js';
import { AppError } from '../../../domain/errors/app.error.js';
import type { AuthUser } from '../ports/http-controller.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError('Token não fornecido', 401));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch {
    next(new AppError('Token inválido ou expirado', 401));
  }
}
