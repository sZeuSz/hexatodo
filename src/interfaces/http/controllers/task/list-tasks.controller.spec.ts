import type { ListTasksUseCase } from '@application/use-cases/task/list-tasks.usecase.js';
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
  it('should return 200 with list of tasks', async () => {
    const useCase = makeUseCase();
    const tasks = [makeTask(), makeTask({ id: 'task-id-2' })];
    useCase.execute.mockResolvedValue(tasks);

    const controller = new ListTasksController(useCase);
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(tasks);
  });

  it('should return 200 with empty array when user has no tasks', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue([]);

    const controller = new ListTasksController(useCase);
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should call use case with correct userId', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue([]);

    const controller = new ListTasksController(useCase);
    await controller.handle(makeRequest());

    expect(useCase.execute).toHaveBeenCalledWith('user-id-1');
  });

  it('should throw UnauthorizedException when user is not present', async () => {
    const useCase = makeUseCase();
    const controller = new ListTasksController(useCase);

    await expect(
      controller.handle(makeRequest({ user: undefined })),
    ).rejects.toThrow('Acesso não autorizado');
  });
});
