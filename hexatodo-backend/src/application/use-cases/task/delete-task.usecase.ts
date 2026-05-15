import { TaskNotFoundException } from '@domain/errors/task-not-found.exception.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';
import type { CacheService } from '@domain/ports/services/cache.service.js';

export class DeleteTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(id, userId);
    if (!task) throw new TaskNotFoundException();
    await this.taskRepository.delete(id, userId);
    await this.cacheService.delByPattern(`tasks:${userId}:*`);
  }
}
