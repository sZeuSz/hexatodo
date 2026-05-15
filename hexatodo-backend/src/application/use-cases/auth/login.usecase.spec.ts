import { AppError } from '@domain/errors/app.error.js';
import type { User } from '@domain/ports/entities/user.entity.js';
import type { UserRepository } from '@domain/ports/repositories/user.repository.js';
import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import { LoginUseCase } from './login.usecase.js';

const makeRepository = (): jest.Mocked<UserRepository> =>
  ({
    findByEmail: jest.fn(),
  }) as unknown as jest.Mocked<UserRepository>;

const makeUser = async (overrides: Partial<User> = {}): Promise<User> => ({
  id: 'user-id-1',
  email: 'test@test.com',
  passwordHash: await bcrypt.hash('senha123', 10),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const JWT_SECRET = 'test-secret';

describe('LoginUseCase', () => {
  it('should return token when credentials are valid', async () => {
    const repository = makeRepository();
    repository.findByEmail.mockResolvedValue(await makeUser());

    const useCase = new LoginUseCase(repository, JWT_SECRET);
    const result = await useCase.execute({
      email: 'test@test.com',
      password: 'senha123',
    });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
  });

  it('should throw AppError 401 when user not found', async () => {
    const repository = makeRepository();
    repository.findByEmail.mockResolvedValue(null);

    const useCase = new LoginUseCase(repository, JWT_SECRET);

    await expect(
      useCase.execute({ email: 'test@test.com', password: 'senha123' }),
    ).rejects.toThrow(AppError);
    await expect(
      useCase.execute({ email: 'test@test.com', password: 'senha123' }),
    ).rejects.toThrow('Credenciais inválidas');
  });

  it('should throw AppError 401 when password is wrong', async () => {
    const repository = makeRepository();
    repository.findByEmail.mockResolvedValue(await makeUser());

    const useCase = new LoginUseCase(repository, JWT_SECRET);

    await expect(
      useCase.execute({ email: 'test@test.com', password: 'senha-errada' }),
    ).rejects.toThrow(AppError);
    await expect(
      useCase.execute({ email: 'test@test.com', password: 'senha-errada' }),
    ).rejects.toThrow('Credenciais inválidas');
  });

  it('should not leak whether email exists or not', async () => {
    const repository = makeRepository();
    repository.findByEmail.mockResolvedValue(null);

    const useCase = new LoginUseCase(repository, JWT_SECRET);

    const error1 = await useCase
      .execute({ email: 'naoexiste@test.com', password: 'senha123' })
      .catch((e: AppError) => e);

    repository.findByEmail.mockResolvedValue(await makeUser());

    const error2 = await useCase
      .execute({ email: 'test@test.com', password: 'senha-errada' })
      .catch((e: AppError) => e);

    expect((error1 as AppError).message).toBe((error2 as AppError).message);
  });
});
