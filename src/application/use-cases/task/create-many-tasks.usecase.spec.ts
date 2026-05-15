import { AppError } from '@domain/errors/app.error.js';
import type {
  CreateTaskDTO,
  Task,
} from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';
import { jest } from '@jest/globals';
import { CreateManyTasksUseCase } from './create-many-tasks.usecase.js';

const makeRepository = (): jest.Mocked<TaskRepository> =>
  ({
    createMany: jest.fn(),
  }) as unknown as jest.Mocked<TaskRepository>;

const makeDTO = (overrides: Partial<CreateTaskDTO> = {}): CreateTaskDTO => ({
  title: 'Tarefa teste',
  userId: 'user-id-1',
  ...overrides,
});

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-id-1',
  title: 'Tarefa teste',
  completed: false,
  userId: 'user-id-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('CreateManyTasksUseCase', () => {
  it('should create multiple tasks', async () => {
    const repository = makeRepository();
    const tasks = [makeTask(), makeTask({ id: 'task-id-2' })];
    repository.createMany.mockResolvedValue(tasks);

    const useCase = new CreateManyTasksUseCase(repository);
    const result = await useCase.execute([makeDTO(), makeDTO()]);

    expect(result).toEqual(tasks);
    expect(repository.createMany).toHaveBeenCalledWith([makeDTO(), makeDTO()]);
  });

  it('should throw AppError when tasks array is empty', async () => {
    const repository = makeRepository();
    const useCase = new CreateManyTasksUseCase(repository);

    await expect(useCase.execute([])).rejects.toThrow(AppError);
    await expect(useCase.execute([])).rejects.toThrow(
      'Nenhuma tarefa informada',
    );
  });

  it('should throw AppError when tasks exceed 1000', async () => {
    const repository = makeRepository();
    const useCase = new CreateManyTasksUseCase(repository);
    const tasks = Array.from({ length: 1001 }, () => makeDTO());

    await expect(useCase.execute(tasks)).rejects.toThrow(AppError);
    await expect(useCase.execute(tasks)).rejects.toThrow(
      'Limite máximo de 1000',
    );
  });

  it('should allow exactly 1000 tasks', async () => {
    const repository = makeRepository();
    const tasks = Array.from({ length: 1000 }, (_, i) =>
      makeTask({ id: `task-id-${i}` }),
    );
    repository.createMany.mockResolvedValue(tasks);

    const useCase = new CreateManyTasksUseCase(repository);
    const dtos = Array.from({ length: 1000 }, () => makeDTO());
    const result = await useCase.execute(dtos);

    expect(result).toHaveLength(1000);
  });

  it('should propagate repository errors', async () => {
    const repository = makeRepository();
    repository.createMany.mockRejectedValue(new Error('DB error'));

    const useCase = new CreateManyTasksUseCase(repository);

    await expect(useCase.execute([makeDTO()])).rejects.toThrow('DB error');
  });
});
