import { TaskNotFoundException } from '@domain/errors/task-not-found.exception.js';
import type { Task } from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';
import { jest } from '@jest/globals';
import { UpdateTaskUseCase } from './update-task.usecase.js';

const makeRepository = (): jest.Mocked<TaskRepository> =>
  ({
    update: jest.fn(),
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

describe('UpdateTaskUseCase', () => {
  it('should return updated task', async () => {
    const repository = makeRepository();
    const updated = makeTask({ title: 'Atualizada', completed: true });
    repository.update.mockResolvedValue(updated);

    const useCase = new UpdateTaskUseCase(repository);
    const result = await useCase.execute('task-id-1', 'user-id-1', {
      title: 'Atualizada',
      completed: true,
    });

    expect(result).toEqual(updated);
    expect(repository.update).toHaveBeenCalledWith('task-id-1', 'user-id-1', {
      title: 'Atualizada',
      completed: true,
    });
  });

  it('should throw TaskNotFoundException when task not found', async () => {
    const repository = makeRepository();
    repository.update.mockResolvedValue(null);

    const useCase = new UpdateTaskUseCase(repository);

    await expect(
      useCase.execute('task-id-1', 'user-id-1', { title: 'Nova' }),
    ).rejects.toThrow(TaskNotFoundException);
  });

  it('should throw TaskNotFoundException when task belongs to another user', async () => {
    const repository = makeRepository();
    repository.update.mockResolvedValue(null);

    const useCase = new UpdateTaskUseCase(repository);

    await expect(
      useCase.execute('task-id-1', 'other-user', { title: 'Nova' }),
    ).rejects.toThrow(TaskNotFoundException);
  });
});
