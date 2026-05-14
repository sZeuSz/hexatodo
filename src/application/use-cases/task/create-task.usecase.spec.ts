import type { Task } from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';
import { jest } from '@jest/globals';
import { CreateTaskUseCase } from './create-task.usecase.js';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-id-1',
  title: 'Tarefa teste',
  completed: false,
  userId: 'user-id-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRepository = (): jest.Mocked<TaskRepository> => ({
  create: jest.fn(),
  createMany: jest.fn(),
  findById: jest.fn(),
  findAllByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('CreateTaskUseCase', () => {
  it('should call repository.create with correct data', async () => {
    const repository = makeRepository();
    const task = makeTask();
    repository.create.mockResolvedValue(task);

    const useCase = new CreateTaskUseCase(repository);
    const dto = { title: 'Tarefa teste', userId: 'user-id-1' };

    await useCase.execute(dto);

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(dto);
  });

  it('should return the task created by repository', async () => {
    const repository = makeRepository();
    const task = makeTask({ title: 'Minha tarefa', description: 'Descrição' });
    repository.create.mockResolvedValue(task);

    const useCase = new CreateTaskUseCase(repository);
    const result = await useCase.execute({
      title: 'Minha tarefa',
      description: 'Descrição',
      userId: 'user-id-1',
    });

    expect(result).toEqual(task);
  });

  it('should propagate repository errors', async () => {
    const repository = makeRepository();
    repository.create.mockRejectedValue(new Error('DB error'));

    const useCase = new CreateTaskUseCase(repository);

    await expect(
      useCase.execute({ title: 'Tarefa', userId: 'user-id-1' }),
    ).rejects.toThrow('DB error');
  });
});
