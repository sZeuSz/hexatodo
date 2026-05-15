import type { GetTaskUseCase } from '@application/use-cases/task/get-task.usecase.js';
import { TaskNotFoundException } from '@domain/errors/task-not-found.exception.js';
import type { Task } from '@domain/ports/entities/task.entity.js';
import { jest } from '@jest/globals';
import type { HttpRequest } from '../../ports/http-controller.js';
import { GetTaskController } from './get-task.controller.js';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-id-1',
  title: 'Tarefa teste',
  completed: false,
  userId: 'user-id-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeUseCase = (): jest.Mocked<GetTaskUseCase> =>
  ({ execute: jest.fn() }) as unknown as jest.Mocked<GetTaskUseCase>;

const makeRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  body: {},
  params: { id: 'task-id-1' },
  query: {},
  headers: {},
  user: { sub: 'user-id-1', email: 'test@test.com' },
  ...overrides,
});

describe('GetTaskController', () => {
  it('should return 200 with task', async () => {
    const useCase = makeUseCase();
    const task = makeTask();
    useCase.execute.mockResolvedValue(task);

    const controller = new GetTaskController(useCase);
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(task);
  });

  it('should call use case with correct id and userId', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue(makeTask());

    const controller = new GetTaskController(useCase);
    await controller.handle(makeRequest());

    expect(useCase.execute).toHaveBeenCalledWith('task-id-1', 'user-id-1');
  });

  it('should throw UnauthorizedException when user is not present', async () => {
    const useCase = makeUseCase();
    const controller = new GetTaskController(useCase);

    await expect(
      controller.handle(makeRequest({ user: undefined })),
    ).rejects.toThrow('Acesso não autorizado');
  });

  it('should propagate TaskNotFoundException from use case', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockRejectedValue(new TaskNotFoundException());

    const controller = new GetTaskController(useCase);

    await expect(controller.handle(makeRequest())).rejects.toThrow(
      TaskNotFoundException,
    );
  });
});
