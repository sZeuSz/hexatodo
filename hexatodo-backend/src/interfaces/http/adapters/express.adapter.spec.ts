import { jest } from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../ports/http-controller.js';
import { adaptRoute } from './express.adapter.js';

const makeReq = (overrides: Partial<Request> = {}): Request =>
  ({
    body: { key: 'value' },
    params: { id: '1' },
    query: { page: '1' },
    headers: { authorization: 'Bearer token' },
    cookies: {},
    user: { sub: 'user-id', email: 'test@test.com' },
    ...overrides,
  }) as unknown as Request;

const makeRes = (): jest.Mocked<Response> =>
  ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  }) as unknown as jest.Mocked<Response>;

const makeNext = (): NextFunction => jest.fn() as unknown as NextFunction;

const makeController = (response: HttpResponse): HttpController => ({
  handle: jest
    .fn<(req: HttpRequest) => Promise<HttpResponse>>()
    .mockResolvedValue(response),
});

describe('adaptRoute', () => {
  it('should call controller with mapped HttpRequest', async () => {
    const controller = makeController({ statusCode: 200, body: { ok: true } });
    const req = makeReq();
    const res = makeRes();

    await adaptRoute(controller)(req, res, makeNext());

    expect(controller.handle).toHaveBeenCalledWith({
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
      cookies: req.cookies,
      user: req.user,
    });
  });

  it('should respond with statusCode and body from controller', async () => {
    const controller = makeController({ statusCode: 201, body: { id: '1' } });
    const res = makeRes();

    await adaptRoute(controller)(makeReq(), res, makeNext());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: '1' });
  });

  it('should set cookies when controller returns cookies', async () => {
    const controller = makeController({
      statusCode: 200,
      body: {},
      cookies: [{ name: 'auth_token', value: 'jwt', httpOnly: true, path: '/' }],
    });
    const res = makeRes();

    await adaptRoute(controller)(makeReq(), res, makeNext());

    expect(res.cookie).toHaveBeenCalledWith('auth_token', 'jwt', { httpOnly: true, path: '/' });
  });

  it('should clear cookies when controller returns clearCookies', async () => {
    const controller = makeController({
      statusCode: 200,
      body: {},
      clearCookies: ['auth_token'],
    });
    const res = makeRes();

    await adaptRoute(controller)(makeReq(), res, makeNext());

    expect(res.clearCookie).toHaveBeenCalledWith('auth_token', { path: '/' });
  });

  it('should call next with error when controller throws', async () => {
    const error = new Error('Controller error');
    const controller: HttpController = {
      handle: jest
        .fn<(req: HttpRequest) => Promise<HttpResponse>>()
        .mockRejectedValue(error),
    };
    const next = makeNext();

    await adaptRoute(controller)(makeReq(), makeRes(), next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
