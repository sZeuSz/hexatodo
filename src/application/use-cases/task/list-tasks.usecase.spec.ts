import type { Task } from '@domain/ports/entities/task.entity.js';
import type {
  PaginatedResult,
  TaskRepository,
} from '@domain/ports/repositories/task.repository.js';
import type { CacheService } from '@domain/ports/services/cache.service.js';
import { jest } from '@jest/globals';
import { ListTasksUseCase } from './list-tasks.usecase.js';

const makeRepository = (): jest.Mocked<TaskRepository> =>
  ({
    findAllByUserId: jest.fn(),
  }) as unknown as jest.Mocked<TaskRepository>;

const makeCache = (): jest.Mocked<CacheService> =>
  ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delByPattern: jest.fn(),
  }) as unknown as jest.Mocked<CacheService>;

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-id-1',
  title: 'Tarefa teste',
  completed: false,
  userId: 'user-id-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePaginated = (tasks: Task[]): PaginatedResult<Task> => ({
  data: tasks,
  total: tasks.length,
  page: 1,
  limit: 20,
  totalPages: 1,
});

const pagination = { page: 1, limit: 20 };

describe('ListTasksUseCase', () => {
  it('should return tasks from repository and cache result', async () => {
    const repository = makeRepository();
    const cache = makeCache();
    const tasks = [makeTask(), makeTask({ id: 'task-id-2' })];
    const paginated = makePaginated(tasks);

    cache.get.mockResolvedValue(null);
    repository.findAllByUserId.mockResolvedValue(paginated);
    cache.set.mockResolvedValue(undefined);

    const useCase = new ListTasksUseCase(repository, cache);
    const result = await useCase.execute('user-id-1', pagination);

    expect(result).toEqual(paginated);
    expect(repository.findAllByUserId).toHaveBeenCalledWith(
      'user-id-1',
      pagination,
    );
    expect(cache.set).toHaveBeenCalled();
  });

  it('should return cached result without hitting repository', async () => {
    const repository = makeRepository();
    const cache = makeCache();
    const paginated = makePaginated([makeTask()]);

    cache.get.mockResolvedValue(paginated);

    const useCase = new ListTasksUseCase(repository, cache);
    const result = await useCase.execute('user-id-1', pagination);

    expect(result).toEqual(paginated);
    expect(repository.findAllByUserId).not.toHaveBeenCalled();
  });

  it('should return empty data when user has no tasks', async () => {
    const repository = makeRepository();
    const cache = makeCache();
    const paginated = makePaginated([]);

    cache.get.mockResolvedValue(null);
    repository.findAllByUserId.mockResolvedValue(paginated);
    cache.set.mockResolvedValue(undefined);

    const useCase = new ListTasksUseCase(repository, cache);
    const result = await useCase.execute('user-id-1', pagination);

    expect(result.data).toEqual([]);
  });

  it('should propagate repository errors', async () => {
    const repository = makeRepository();
    const cache = makeCache();

    cache.get.mockResolvedValue(null);
    repository.findAllByUserId.mockRejectedValue(new Error('DB error'));

    const useCase = new ListTasksUseCase(repository, cache);

    await expect(useCase.execute('user-id-1', pagination)).rejects.toThrow(
      'DB error',
    );
  });
});
