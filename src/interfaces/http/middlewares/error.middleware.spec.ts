import { jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../../domain/errors/app.error.js';
import { errorMiddleware } from './error.middleware.js';

const makeRes = () =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }) as unknown as jest.Mocked<Response>;

const makeReq = (): Request => ({}) as Request;
const makeNext = (): NextFunction => jest.fn() as unknown as NextFunction;

describe('errorMiddleware', () => {
  it('should return statusCode and message from AppError', () => {
    const res = makeRes();
    const error = new AppError('Recurso não encontrado', 404);

    errorMiddleware(error, makeReq(), res, makeNext());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: 'Recurso não encontrado',
    });
  });

  it('should return 422 with field errors for ZodError', () => {
    const res = makeRes();
    const zodError = new ZodError([
      {
        path: ['title'],
        message: 'Required',
        code: 'invalid_type',
        expected: 'string',
      },
    ]);

    errorMiddleware(zodError, makeReq(), res, makeNext());

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: true, message: 'Dados inválidos' }),
    );
  });

  it('should return 400 for SyntaxError with body property', () => {
    const res = makeRes();
    const syntaxError = Object.assign(new SyntaxError('Unexpected token'), {
      body: '{ bad json',
    });

    errorMiddleware(syntaxError, makeReq(), res, makeNext());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: 'JSON inválido',
    });
  });

  it('should return 500 for unknown errors without leaking details', () => {
    const res = makeRes();

    errorMiddleware(new Error('DB crashed'), makeReq(), res, makeNext());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: 'Erro interno do servidor',
    });
  });

  it('should return 500 for non-Error unknowns', () => {
    const res = makeRes();

    errorMiddleware('string error', makeReq(), res, makeNext());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: 'Erro interno do servidor',
    });
  });
});
