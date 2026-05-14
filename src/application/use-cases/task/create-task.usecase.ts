import type {
  CreateTaskDTO,
  Task,
} from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(data: CreateTaskDTO): Promise<Task> {
    return this.taskRepository.create(data);
  }
}
