import type {
  CreateTaskDTO,
  Task,
} from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';
import type { CacheService } from '@domain/ports/services/cache.service.js';

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(data: CreateTaskDTO): Promise<Task> {
    const task = await this.taskRepository.create(data);
    await this.cacheService.delByPattern(`tasks:${data.userId}:*`);
    return task;
  }
}
