import { TaskNotFoundException } from '@domain/errors/task-not-found.exception.js';
import type { Task } from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';
import { jest } from '@jest/globals';
import { DeleteTaskUseCase } from './delete-task.usecase.js';

const makeRepository = (): jest.Mocked<TaskRepository> =>
  ({
    findById: jest.fn(),
    delete: jest.fn(),
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

describe('DeleteTaskUseCase', () => {
  it('should delete task when found', async () => {
    const repository = makeRepository();
    repository.findById.mockResolvedValue(makeTask());
    repository.delete.mockResolvedValue(undefined);

    const useCase = new DeleteTaskUseCase(repository);
    await useCase.execute('task-id-1', 'user-id-1');

    expect(repository.delete).toHaveBeenCalledWith('task-id-1', 'user-id-1');
  });

  it('should throw TaskNotFoundException when task not found', async () => {
    const repository = makeRepository();
    repository.findById.mockResolvedValue(null);

    const useCase = new DeleteTaskUseCase(repository);

    await expect(useCase.execute('task-id-1', 'user-id-1')).rejects.toThrow(
      TaskNotFoundException,
    );
  });

  it('should throw TaskNotFoundException when task belongs to another user', async () => {
    const repository = makeRepository();
    repository.findById.mockResolvedValue(null);

    const useCase = new DeleteTaskUseCase(repository);

    await expect(useCase.execute('task-id-1', 'other-user')).rejects.toThrow(
      TaskNotFoundException,
    );
  });

  it('should not call delete when task not found', async () => {
    const repository = makeRepository();
    repository.findById.mockResolvedValue(null);

    const useCase = new DeleteTaskUseCase(repository);

    await expect(useCase.execute('task-id-1', 'user-id-1')).rejects.toThrow();
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
