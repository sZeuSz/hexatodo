import type { DeleteTaskUseCase } from '@application/use-cases/task/delete-task.usecase.js';
import { TaskNotFoundException } from '@domain/errors/task-not-found.exception.js';
import { jest } from '@jest/globals';
import type { HttpRequest } from '../../ports/http-controller.js';
import { DeleteTaskController } from './delete-task.controller.js';

const makeUseCase = (): jest.Mocked<DeleteTaskUseCase> =>
  ({ execute: jest.fn() }) as unknown as jest.Mocked<DeleteTaskUseCase>;

const makeRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  body: {},
  params: { id: 'task-id-1' },
  query: {},
  headers: {},
  user: { sub: 'user-id-1', email: 'test@test.com' },
  ...overrides,
});

describe('DeleteTaskController', () => {
  it('should return 204 with null body', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue(undefined);

    const controller = new DeleteTaskController(useCase);
    const response = await controller.handle(makeRequest());

    expect(response.statusCode).toBe(204);
    expect(response.body).toBeNull();
  });

  it('should call use case with correct id and userId', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockResolvedValue(undefined);

    const controller = new DeleteTaskController(useCase);
    await controller.handle(makeRequest());

    expect(useCase.execute).toHaveBeenCalledWith('task-id-1', 'user-id-1');
  });

  it('should throw UnauthorizedException when user is not present', async () => {
    const useCase = makeUseCase();
    const controller = new DeleteTaskController(useCase);

    await expect(
      controller.handle(makeRequest({ user: undefined })),
    ).rejects.toThrow('Acesso não autorizado');
  });

  it('should propagate TaskNotFoundException from use case', async () => {
    const useCase = makeUseCase();
    useCase.execute.mockRejectedValue(new TaskNotFoundException());

    const controller = new DeleteTaskController(useCase);

    await expect(controller.handle(makeRequest())).rejects.toThrow(
      TaskNotFoundException,
    );
  });
});
