import type { CreateTaskUseCase } from '@application/use-cases/task/create-task.usecase.js';
import type { Task } from '@domain/ports/entities/task.entity.js';
import { jest } from '@jest/globals';
import type { HttpRequest } from '../../ports/http-controller.js';
import { CreateTaskController } from './create-task.controller.js';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-id-1',
  title: 'Tarefa teste',
  completed: false,
  userId: 'user-id-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeUseCase = (): jest.Mocked<CreateTaskUseCase> =>
  ({ execute: jest.fn() }) as unknown as jest.Mocked<CreateTaskUseCase>;

const makeRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  body: { title: 'Tarefa teste' },
  params: {},
  query: {},
  headers: {},
  user: { sub: 'user-id-1', email: 'test@test.com' },
  ...overrides,
});

describe('CreateTaskController', () => {
  it('should return 201 with created task', async () => {
    const useCase = makeUseCase();
    const task = makeTask();
    useCase.execute.mockResolvedValue(task);

    const controller = new CreateTaskController(useCase);
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(task);
  });

  it('should call use case with correct DTO', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue(makeTask());

    const controller = new CreateTaskController(useCase);
    await controller.handle(
      makeRequest({ body: { title: 'Nova tarefa', description: 'Desc' } }),
    );

    expect(useCase.execute).toHaveBeenCalledWith({
      title: 'Nova tarefa',
      description: 'Desc',
      userId: 'user-id-1',
    });
  });

  it('should throw UnauthorizedException when user is not present', async () => {
    const useCase = makeUseCase();
    const controller = new CreateTaskController(useCase);

    await expect(
      controller.handle(makeRequest({ user: undefined })),
    ).rejects.toThrow('Acesso não autorizado');
  });

  it('should throw ZodError when title is missing', async () => {
    const useCase = makeUseCase();
    const controller = new CreateTaskController(useCase);

    await expect(
      controller.handle(makeRequest({ body: {} })),
    ).rejects.toThrow();
  });

  it('should throw ZodError when title is not a string', async () => {
    const useCase = makeUseCase();
    const controller = new CreateTaskController(useCase);

    await expect(
      controller.handle(makeRequest({ body: { title: 123 } })),
    ).rejects.toThrow();
  });

  it('should throw ZodError when title is empty', async () => {
    const useCase = makeUseCase();
    const controller = new CreateTaskController(useCase);

    await expect(
      controller.handle(makeRequest({ body: { title: '' } })),
    ).rejects.toThrow();
  });

  it('should create task without description when not provided', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue(makeTask());

    const controller = new CreateTaskController(useCase);
    await controller.handle(makeRequest({ body: { title: 'Só título' } }));

    expect(useCase.execute).toHaveBeenCalledWith({
      title: 'Só título',
      userId: 'user-id-1',
    });
  });

  it('should throw ZodError when title exceeds 255 characters', async () => {
    const useCase = makeUseCase();
    const controller = new CreateTaskController(useCase);

    await expect(
      controller.handle(makeRequest({ body: { title: 'a'.repeat(256) } })),
    ).rejects.toThrow();
  });

  it('should throw ZodError when description exceeds 1000 characters', async () => {
    const useCase = makeUseCase();
    const controller = new CreateTaskController(useCase);

    await expect(
      controller.handle(
        makeRequest({
          body: { title: 'Título válido', description: 'a'.repeat(1001) },
        }),
      ),
    ).rejects.toThrow();
  });
});
