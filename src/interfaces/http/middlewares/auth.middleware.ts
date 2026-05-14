import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env.js';

export interface JwtPayload {
  sub: string;
  email: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}
