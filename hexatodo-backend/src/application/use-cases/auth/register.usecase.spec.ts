import { AppError } from '@domain/errors/app.error.js';
import type { User } from '@domain/ports/entities/user.entity.js';
import type { UserRepository } from '@domain/ports/repositories/user.repository.js';
import { jest } from '@jest/globals';
import { RegisterUseCase } from './register.usecase.js';

const makeRepository = (): jest.Mocked<UserRepository> =>
  ({
    findByEmail: jest.fn(),
    create: jest.fn(),
  }) as unknown as jest.Mocked<UserRepository>;

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-id-1',
  email: 'test@test.com',
  passwordHash: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('RegisterUseCase', () => {
  it('should create user and return it', async () => {
    const repository = makeRepository();
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(makeUser());

    const useCase = new RegisterUseCase(repository);
    const result = await useCase.execute({
      email: 'test@test.com',
      password: 'senha123',
    });

    expect(result.email).toBe('test@test.com');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@test.com' }),
    );
  });

  it('should hash password before saving', async () => {
    const repository = makeRepository();
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockResolvedValue(makeUser());

    const useCase = new RegisterUseCase(repository);
    await useCase.execute({ email: 'test@test.com', password: 'senha123' });

    const dto = repository.create.mock.calls[0]![0];
    expect(dto.passwordHash).not.toBe('senha123');
    expect(dto.passwordHash.length).toBeGreaterThan(0);
  });

  it('should throw AppError 409 when email already exists', async () => {
    const repository = makeRepository();
    repository.findByEmail.mockResolvedValue(makeUser());

    const useCase = new RegisterUseCase(repository);

    await expect(
      useCase.execute({ email: 'test@test.com', password: 'senha123' }),
    ).rejects.toThrow(AppError);
    await expect(
      useCase.execute({ email: 'test@test.com', password: 'senha123' }),
    ).rejects.toThrow('E-mail já cadastrado');
  });

  it('should not call create when email already exists', async () => {
    const repository = makeRepository();
    repository.findByEmail.mockResolvedValue(makeUser());

    const useCase = new RegisterUseCase(repository);

    await expect(
      useCase.execute({ email: 'test@test.com', password: 'senha123' }),
    ).rejects.toThrow();
    expect(repository.create).not.toHaveBeenCalled();
  });
});
