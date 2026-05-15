import type { ListTasksUseCase } from '@application/use-cases/task/list-tasks.usecase.js';
import type { PaginatedResult } from '@domain/ports/repositories/task.repository.js';
import type { Task } from '@domain/ports/entities/task.entity.js';
import { jest } from '@jest/globals';
import type { HttpRequest } from '../../ports/http-controller.js';
import { ListTasksController } from './list-tasks.controller.js';

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

const makeUseCase = (): jest.Mocked<ListTasksUseCase> =>
  ({ execute: jest.fn() }) as unknown as jest.Mocked<ListTasksUseCase>;

const makeRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: { sub: 'user-id-1', email: 'test@test.com' },
  ...overrides,
});

describe('ListTasksController', () => {
  it('should return 200 with paginated tasks', async () => {
    const useCase = makeUseCase();
    const paginated = makePaginated([
      makeTask(),
      makeTask({ id: 'task-id-2' }),
    ]);
    useCase.execute.mockResolvedValue(paginated);

    const controller = new ListTasksController(useCase);
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(paginated);
  });

  it('should use default pagination when query is empty', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue(makePaginated([]));

    const controller = new ListTasksController(useCase);
    await controller.handle(makeRequest());

    expect(useCase.execute).toHaveBeenCalledWith('user-id-1', {
      page: 1,
      limit: 20,
    });
  });

  it('should parse page and limit from query', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue(makePaginated([]));

    const controller = new ListTasksController(useCase);
    await controller.handle(makeRequest({ query: { page: '2', limit: '10' } }));

    expect(useCase.execute).toHaveBeenCalledWith('user-id-1', {
      page: 2,
      limit: 10,
    });
  });

  it('should throw ZodError when limit exceeds 100', async () => {
    const useCase = makeUseCase();
    const controller = new ListTasksController(useCase);

    await expect(
      controller.handle(makeRequest({ query: { limit: '101' } })),
    ).rejects.toThrow();
  });

  it('should throw UnauthorizedException when user is not present', async () => {
    const useCase = makeUseCase();
    const controller = new ListTasksController(useCase);

    await expect(
      controller.handle(makeRequest({ user: undefined })),
    ).rejects.toThrow('Acesso não autorizado');
  });
});
