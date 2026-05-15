import type { Task } from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';
import type { CacheService } from '@domain/ports/services/cache.service.js';
import { jest } from '@jest/globals';
import { CreateTaskUseCase } from './create-task.usecase.js';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-id-1',
  title: 'Tarefa teste',
  completed: false,
  userId: 'user-id-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = (): jest.Mocked<TaskRepository> => ({
  create: jest.fn(),
  createMany: jest.fn(),
  findById: jest.fn(),
  findAllByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const makeCache = (): jest.Mocked<CacheService> =>
  ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delByPattern: jest.fn().mockResolvedValue(void 0 as never),
  }) as unknown as jest.Mocked<CacheService>;

describe('CreateTaskUseCase', () => {
  it('should call repository.create with correct data', async () => {
    const repository = makeRepository();
    const cache = makeCache();
    repository.create.mockResolvedValue(makeTask());

    const useCase = new CreateTaskUseCase(repository, cache);
    const dto = { title: 'Tarefa teste', userId: 'user-id-1' };
    await useCase.execute(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
  });

  it('should return the task created by repository', async () => {
    const repository = makeRepository();
    const cache = makeCache();
    const task = makeTask({ title: 'Minha tarefa', description: 'Descrição' });
    repository.create.mockResolvedValue(task);

    const useCase = new CreateTaskUseCase(repository, cache);
    const result = await useCase.execute({
      title: 'Minha tarefa',
      description: 'Descrição',
      userId: 'user-id-1',
    });

    expect(result).toEqual(task);
  });

  it('should invalidate cache after creating task', async () => {
    const repository = makeRepository();
    const cache = makeCache();
    repository.create.mockResolvedValue(makeTask());

    const useCase = new CreateTaskUseCase(repository, cache);
    await useCase.execute({ title: 'Tarefa', userId: 'user-id-1' });

    expect(cache.delByPattern).toHaveBeenCalledWith('tasks:user-id-1:*');
  });

  it('should propagate repository errors', async () => {
    const repository = makeRepository();
    const cache = makeCache();
    repository.create.mockRejectedValue(new Error('DB error'));

    const useCase = new CreateTaskUseCase(repository, cache);

    await expect(
      useCase.execute({ title: 'Tarefa', userId: 'user-id-1' }),
    ).rejects.toThrow('DB error');
  });
});
