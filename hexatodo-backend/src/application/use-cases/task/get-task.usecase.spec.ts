import { TaskNotFoundException } from '@domain/errors/task-not-found.exception.js';
import type { Task } from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';
import { jest } from '@jest/globals';
import { GetTaskUseCase } from './get-task.usecase.js';

const makeRepository = (): jest.Mocked<TaskRepository> =>
  ({
    findById: jest.fn(),
  }) as unknown as jest.Mocked<TaskRepository>;

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-id-1',
  title: 'Tarefa teste',
  completed: false,
  userId: 'user-id-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('GetTaskUseCase', () => {
  it('should return task when found', async () => {
    const repository = makeRepository();
    const task = makeTask();
    repository.findById.mockResolvedValue(task);

    const useCase = new GetTaskUseCase(repository);
    const result = await useCase.execute('task-id-1', 'user-id-1');

    expect(result).toEqual(task);
    expect(repository.findById).toHaveBeenCalledWith('task-id-1', 'user-id-1');
  });

  it('should throw TaskNotFoundException when task not found', async () => {
    const repository = makeRepository();
    repository.findById.mockResolvedValue(null);

    const useCase = new GetTaskUseCase(repository);

    await expect(useCase.execute('task-id-1', 'user-id-1')).rejects.toThrow(
      TaskNotFoundException,
    );
  });

  it('should throw TaskNotFoundException when task belongs to another user', async () => {
    const repository = makeRepository();
    repository.findById.mockResolvedValue(null);

    const useCase = new GetTaskUseCase(repository);

    await expect(useCase.execute('task-id-1', 'other-user')).rejects.toThrow(
      TaskNotFoundException,
    );
  });
});
