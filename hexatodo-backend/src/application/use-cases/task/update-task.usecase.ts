import { TaskNotFoundException } from '@domain/errors/task-not-found.exception.js';
import type {
  Task,
  UpdateTaskDTO,
} from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';
import type { CacheService } from '@domain/ports/services/cache.service.js';

export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    id: string,
    userId: string,
    data: UpdateTaskDTO,
  ): Promise<Task> {
    const task = await this.taskRepository.update(id, userId, data);
    if (!task) throw new TaskNotFoundException();
    await this.cacheService.delByPattern(`tasks:${userId}:*`);
    return task;
  }
}
