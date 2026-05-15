import type { CreateManyTasksUseCase } from '@application/use-cases/task/create-many-tasks.usecase.js';
import type { Task } from '@domain/ports/entities/task.entity.js';
import { jest } from '@jest/globals';
import type { HttpRequest } from '../ports/http-controller.js';
import { CreateManyTasksController } from './create-many-tasks.controller.js';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-id-1',
  title: 'Tarefa teste',
  completed: false,
  userId: 'user-id-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeUseCase = (): jest.Mocked<CreateManyTasksUseCase> =>
  ({ execute: jest.fn() }) as unknown as jest.Mocked<CreateManyTasksUseCase>;

const makeRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  body: { tasks: [{ title: 'Tarefa 1' }, { title: 'Tarefa 2' }] },
  params: {},
  query: {},
  headers: {},
  user: { sub: 'user-id-1', email: 'test@test.com' },
  ...overrides,
});

describe('CreateManyTasksController', () => {
  it('should return 201 with created tasks', async () => {
    const useCase = makeUseCase();
    const tasks = [makeTask(), makeTask({ id: 'task-id-2' })];
    useCase.execute.mockResolvedValue(tasks);

    const controller = new CreateManyTasksController(useCase);
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(tasks);
  });

  it('should call use case with correct DTOs including userId', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue([makeTask(), makeTask()]);

    const controller = new CreateManyTasksController(useCase);
    await controller.handle(makeRequest());

    expect(useCase.execute).toHaveBeenCalledWith([
      { title: 'Tarefa 1', userId: 'user-id-1' },
      { title: 'Tarefa 2', userId: 'user-id-1' },
    ]);
  });

  it('should throw UnauthorizedException when user is not present', async () => {
    const useCase = makeUseCase();
    const controller = new CreateManyTasksController(useCase);

    await expect(
      controller.handle(makeRequest({ user: undefined })),
    ).rejects.toThrow('Acesso não autorizado');
  });

  it('should throw ZodError when tasks array is missing', async () => {
    const useCase = makeUseCase();
    const controller = new CreateManyTasksController(useCase);

    await expect(
      controller.handle(makeRequest({ body: {} })),
    ).rejects.toThrow();
  });

  it('should throw ZodError when tasks array is empty', async () => {
    const useCase = makeUseCase();
    const controller = new CreateManyTasksController(useCase);

    await expect(
      controller.handle(makeRequest({ body: { tasks: [] } })),
    ).rejects.toThrow();
  });

  it('should propagate AppError when tasks exceed 1000', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockRejectedValue(
      new Error('Limite máximo de 1000 tarefas por operação'),
    );
    const controller = new CreateManyTasksController(useCase);
    const tasks = Array.from({ length: 1001 }, (_, i) => ({
      title: `Tarefa ${i}`,
    }));

    await expect(
      controller.handle(makeRequest({ body: { tasks } })),
    ).rejects.toThrow('Limite máximo de 1000');
  });

  it('should throw ZodError when a task title is missing', async () => {
    const useCase = makeUseCase();
    const controller = new CreateManyTasksController(useCase);

    await expect(
      controller.handle(
        makeRequest({ body: { tasks: [{ description: 'sem titulo' }] } }),
      ),
    ).rejects.toThrow();
  });
});
