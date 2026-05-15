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
  // cookie HttpOnly tem prioridade; Bearer token como fallback (ex: testes via curl)
  const cookieToken: string | undefined = req.cookies?.auth_token;
  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;

  const token = cookieToken ?? bearerToken;

  if (!token) {
    next(new AppError('Token não fornecido', 401));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch {
    next(new AppError('Token inválido ou expirado', 401));
  }
}
