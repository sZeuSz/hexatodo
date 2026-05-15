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

const { RegisterController } = await import('./register.controller.js');

import type { LoginUseCase } from '@application/use-cases/auth/login.usecase.js';
import type { RegisterUseCase } from '@application/use-cases/auth/register.usecase.js';
import type { User } from '@domain/ports/entities/user.entity.js';
import type { HttpRequest } from '../../ports/http-controller.js';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-id-1',
  email: 'test@test.com',
  passwordHash: 'hashed',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRegisterUseCase = (): jest.Mocked<RegisterUseCase> =>
  ({ execute: jest.fn() }) as unknown as jest.Mocked<RegisterUseCase>;

const makeLoginUseCase = (): jest.Mocked<LoginUseCase> =>
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

describe('RegisterController', () => {
  it('should return 201 with email', async () => {
    const registerUseCase = makeRegisterUseCase();
    const loginUseCase = makeLoginUseCase();
    registerUseCase.execute.mockResolvedValue(makeUser());
    loginUseCase.execute.mockResolvedValue({ token: 'jwt-token' });

    const controller = new RegisterController(registerUseCase, loginUseCase);
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ email: 'test@test.com' });
  });

  it('should not expose passwordHash', async () => {
    const registerUseCase = makeRegisterUseCase();
    const loginUseCase = makeLoginUseCase();
    registerUseCase.execute.mockResolvedValue(makeUser());
    loginUseCase.execute.mockResolvedValue({ token: 'jwt-token' });

    const controller = new RegisterController(registerUseCase, loginUseCase);
    const response = await controller.handle(makeRequest());

    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('should call register use case with correct data', async () => {
    const registerUseCase = makeRegisterUseCase();
    const loginUseCase = makeLoginUseCase();
    registerUseCase.execute.mockResolvedValue(makeUser());
    loginUseCase.execute.mockResolvedValue({ token: 'jwt-token' });

    const controller = new RegisterController(registerUseCase, loginUseCase);
    await controller.handle(makeRequest());

    expect(registerUseCase.execute).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'senha123',
    });
  });

  it('should throw ZodError when email is invalid', async () => {
    const controller = new RegisterController(
      makeRegisterUseCase(),
      makeLoginUseCase(),
    );

    await expect(
      controller.handle(
        makeRequest({ body: { email: 'invalid', password: 'senha123' } }),
      ),
    ).rejects.toThrow();
  });

  it('should throw ZodError when password is too short', async () => {
    const controller = new RegisterController(
      makeRegisterUseCase(),
      makeLoginUseCase(),
    );

    await expect(
      controller.handle(
        makeRequest({ body: { email: 'test@test.com', password: '123' } }),
      ),
    ).rejects.toThrow();
  });

  it('should throw ZodError when fields are missing', async () => {
    const controller = new RegisterController(
      makeRegisterUseCase(),
      makeLoginUseCase(),
    );

    await expect(
      controller.handle(makeRequest({ body: {} })),
    ).rejects.toThrow();
  });
});
