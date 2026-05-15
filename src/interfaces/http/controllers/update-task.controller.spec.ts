import type { UpdateTaskUseCase } from '@application/use-cases/task/update-task.usecase.js';
import { TaskNotFoundException } from '@domain/errors/task-not-found.exception.js';
import type { Task } from '@domain/ports/entities/task.entity.js';
import { jest } from '@jest/globals';
import type { HttpRequest } from '../ports/http-controller.js';
import { UpdateTaskController } from './update-task.controller.js';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-id-1',
  title: 'Tarefa teste',
  completed: false,
  userId: 'user-id-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeUseCase = (): jest.Mocked<UpdateTaskUseCase> =>
  ({ execute: jest.fn() }) as unknown as jest.Mocked<UpdateTaskUseCase>;

const makeRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  body: { title: 'Atualizada' },
  params: { id: 'task-id-1' },
  query: {},
  headers: {},
  user: { sub: 'user-id-1', email: 'test@test.com' },
  ...overrides,
});

describe('UpdateTaskController', () => {
  it('should return 200 with updated task', async () => {
    const useCase = makeUseCase();
    const task = makeTask({ title: 'Atualizada' });
    useCase.execute.mockResolvedValue(task);

    const controller = new UpdateTaskController(useCase);
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(task);
  });

  it('should call use case with correct params', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue(makeTask());

    const controller = new UpdateTaskController(useCase);
    await controller.handle(
      makeRequest({ body: { title: 'Nova', completed: true } }),
    );

    expect(useCase.execute).toHaveBeenCalledWith('task-id-1', 'user-id-1', {
      title: 'Nova',
      completed: true,
    });
  });

  it('should throw UnauthorizedException when user is not present', async () => {
    const useCase = makeUseCase();
    const controller = new UpdateTaskController(useCase);

    await expect(
      controller.handle(makeRequest({ user: undefined })),
    ).rejects.toThrow('Acesso não autorizado');
  });

  it('should propagate TaskNotFoundException from use case', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockRejectedValue(new TaskNotFoundException());

    const controller = new UpdateTaskController(useCase);

    await expect(controller.handle(makeRequest())).rejects.toThrow(
      TaskNotFoundException,
    );
  });

  it('should throw ZodError when body is invalid', async () => {
    const useCase = makeUseCase();
    const controller = new UpdateTaskController(useCase);

    await expect(
      controller.handle(makeRequest({ body: { completed: 'not-a-boolean' } })),
    ).rejects.toThrow();
  });

  it('should allow partial updates', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue(makeTask({ completed: true }));

    const controller = new UpdateTaskController(useCase);
    const response = await controller.handle(
      makeRequest({ body: { completed: true } }),
    );

    expect(response.statusCode).toBe(200);
  });
});
