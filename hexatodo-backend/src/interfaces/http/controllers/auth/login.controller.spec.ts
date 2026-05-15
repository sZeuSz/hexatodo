import { jest } from '@jest/globals';

jest.unstable_mockModule('@config/env.js', () => ({
  env: {
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret-32-chars-minimum-ok',
    JWT_EXPIRES_IN: '7d',
    PORT: 3000,
    MONGODB_URI: 'mongodb://localhost/test',
    REDIS_URL: 'redis://localhost:6379',
    FRONTEND_URL: 'http://localhost',
  },
}));

const { LoginController } = await import('./login.controller.js');
const { AppError } = await import('@domain/errors/app.error.js');
const { jest: jestObj } = await import('@jest/globals');

import type { LoginUseCase } from '@application/use-cases/auth/login.usecase.js';
import type { HttpRequest } from '../../ports/http-controller.js';

const makeUseCase = (): jest.Mocked<LoginUseCase> =>
  ({ execute: jest.fn() }) as unknown as jest.Mocked<LoginUseCase>;

const makeRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  body: { email: 'test@test.com', password: 'senha123' },
  params: {},
  query: {},
  headers: {},
  cookies: {},
  user: undefined,
  ...overrides,
});

describe('LoginController', () => {
  it('should return 200 with email', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue({ token: 'jwt-token' });

    const controller = new LoginController(useCase);
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ email: 'test@test.com' });
  });

  it('should call use case with correct credentials', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue({ token: 'jwt-token' });

    const controller = new LoginController(useCase);
    await controller.handle(makeRequest());

    expect(useCase.execute).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'senha123',
    });
  });

  it('should propagate AppError 401 from use case', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockRejectedValue(
      new AppError('Credenciais inválidas', 401),
    );

    const controller = new LoginController(useCase);

    await expect(controller.handle(makeRequest())).rejects.toThrow(
      'Credenciais inválidas',
    );
  });

  it('should throw ZodError when email is invalid', async () => {
    const controller = new LoginController(makeUseCase());

    await expect(
      controller.handle(
        makeRequest({ body: { email: 'invalid', password: 'senha123' } }),
      ),
    ).rejects.toThrow();
  });

  it('should throw ZodError when fields are missing', async () => {
    const controller = new LoginController(makeUseCase());

    await expect(
      controller.handle(makeRequest({ body: {} })),
    ).rejects.toThrow();
  });
});
