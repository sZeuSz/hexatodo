import { jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../domain/errors/app.error.js';
import { authMiddleware } from './auth.middleware.js';

const makeReq = (headers: Record<string, string> = {}): Request =>
  ({ headers }) as unknown as Request;

const makeRes = (): Response => ({}) as Response;
const makeNext = (): NextFunction => jest.fn() as unknown as NextFunction;

const validPayload = { sub: 'user-id-1', email: 'test@test.com' };

describe('authMiddleware', () => {
  it('should call next with AppError 401 when Authorization header is missing', () => {
    const next = makeNext();
    authMiddleware(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0]![0] as AppError;
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Token não fornecido');
  });

  it('should call next with AppError 401 when Authorization header does not start with Bearer', () => {
    const next = makeNext();
    authMiddleware(
      makeReq({ authorization: 'Basic token123' }),
      makeRes(),
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0]![0] as AppError;
    expect(error.statusCode).toBe(401);
  });

  it('should call next with AppError 401 when token is invalid', () => {
    const next = makeNext();
    authMiddleware(
      makeReq({ authorization: 'Bearer invalid.token' }),
      makeRes(),
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0]![0] as AppError;
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Token inválido ou expirado');
  });

  it('should call next with AppError 401 when token is expired', () => {
    const token = jwt.sign(validPayload, process.env.JWT_SECRET ?? 'secret', {
      expiresIn: -1,
    });
    const next = makeNext();
    authMiddleware(
      makeReq({ authorization: `Bearer ${token}` }),
      makeRes(),
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0]![0] as AppError;
    expect(error.statusCode).toBe(401);
  });

  it('should populate req.user and call next without error when token is valid', () => {
    const token = jwt.sign(validPayload, process.env.JWT_SECRET ?? 'secret');
    const req = makeReq({ authorization: `Bearer ${token}` });
    const next = makeNext();

    authMiddleware(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(
      (req as Request & { user?: typeof validPayload }).user,
    ).toMatchObject(validPayload);
  });
});
