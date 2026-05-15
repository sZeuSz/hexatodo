import { AppError } from '@domain/errors/app.error.js';
import type {
  CreateTaskDTO,
  Task,
} from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';

const MAX_BULK_SIZE = 1000;

export class CreateManyTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(tasks: CreateTaskDTO[]): Promise<Task[]> {
    if (tasks.length === 0) throw new AppError('Nenhuma tarefa informada', 400);
    if (tasks.length > MAX_BULK_SIZE) {
      throw new AppError(
        `Limite máximo de ${MAX_BULK_SIZE} tarefas por operação`,
        400,
      );
    }

    return this.taskRepository.createMany(tasks);
  }
}
