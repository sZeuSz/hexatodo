import type { Task } from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';
import { jest } from '@jest/globals';
import { ListTasksUseCase } from './list-tasks.usecase.js';

const makeRepository = (): jest.Mocked<TaskRepository> =>
  ({
    findAllByUserId: jest.fn(),
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

describe('ListTasksUseCase', () => {
  it('should return all tasks for the user', async () => {
    const repository = makeRepository();
    const tasks = [makeTask(), makeTask({ id: 'task-id-2', title: 'Outra' })];
    repository.findAllByUserId.mockResolvedValue(tasks);

    const useCase = new ListTasksUseCase(repository);
    const result = await useCase.execute('user-id-1');

    expect(result).toEqual(tasks);
    expect(repository.findAllByUserId).toHaveBeenCalledWith('user-id-1');
  });

  it('should return empty array when user has no tasks', async () => {
    const repository = makeRepository();
    repository.findAllByUserId.mockResolvedValue([]);

    const useCase = new ListTasksUseCase(repository);
    const result = await useCase.execute('user-id-1');

    expect(result).toEqual([]);
  });

  it('should propagate repository errors', async () => {
    const repository = makeRepository();
    repository.findAllByUserId.mockRejectedValue(new Error('DB error'));

    const useCase = new ListTasksUseCase(repository);

    await expect(useCase.execute('user-id-1')).rejects.toThrow('DB error');
  });
});
