import { TaskNotFoundException } from '@domain/errors/task-not-found.exception.js';
import type { Task } from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';

export class GetTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findById(id, userId);
    if (!task) throw new TaskNotFoundException();
    return task;
  }
}
