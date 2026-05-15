import type { RegisterUseCase } from '@application/use-cases/auth/register.usecase.js';
import type { User } from '@domain/ports/entities/user.entity.js';
import { jest } from '@jest/globals';
import type { HttpRequest } from '../../ports/http-controller.js';
import { RegisterController } from './register.controller.js';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-id-1',
  email: 'test@test.com',
  passwordHash: 'hashed',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeUseCase = (): jest.Mocked<RegisterUseCase> =>
  ({ execute: jest.fn() }) as unknown as jest.Mocked<RegisterUseCase>;

const makeRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  body: { email: 'test@test.com', password: 'senha123' },
  params: {},
  query: {},
  headers: {},
  user: undefined,
  ...overrides,
});

describe('RegisterController', () => {
  it('should return 201 without passwordHash', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue(makeUser());

    const controller = new RegisterController(useCase);
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(201);
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('should return id, email and createdAt', async () => {
    const useCase = makeUseCase();
    const user = makeUser();
    useCase.execute.mockResolvedValue(user);

    const controller = new RegisterController(useCase);
    const response = await controller.handle(makeRequest());

    expect(response.body).toEqual({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
  });

  it('should call use case with correct data', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue(makeUser());

    const controller = new RegisterController(useCase);
    await controller.handle(makeRequest());

    expect(useCase.execute).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'senha123',
    });
  });

  it('should throw ZodError when email is invalid', async () => {
    const useCase = makeUseCase();
    const controller = new RegisterController(useCase);

    await expect(
      controller.handle(
        makeRequest({ body: { email: 'invalid', password: 'senha123' } }),
      ),
    ).rejects.toThrow();
  });

  it('should throw ZodError when password is too short', async () => {
    const useCase = makeUseCase();
    const controller = new RegisterController(useCase);

    await expect(
      controller.handle(
        makeRequest({ body: { email: 'test@test.com', password: '123' } }),
      ),
    ).rejects.toThrow();
  });

  it('should throw ZodError when fields are missing', async () => {
    const useCase = makeUseCase();
    const controller = new RegisterController(useCase);

    await expect(
      controller.handle(makeRequest({ body: {} })),
    ).rejects.toThrow();
  });
});
