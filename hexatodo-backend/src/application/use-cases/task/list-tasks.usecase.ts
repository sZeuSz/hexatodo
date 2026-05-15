import type { Task } from '@domain/ports/entities/task.entity.js';
import type {
  PaginatedResult,
  PaginationParams,
  TaskRepository,
} from '@domain/ports/repositories/task.repository.js';
import type { CacheService } from '@domain/ports/services/cache.service.js';

const CACHE_TTL = 60;

export class ListTasksUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Task>> {
    const cacheKey = `tasks:${userId}:page:${pagination.page}:limit:${pagination.limit}`;

    const cached = await this.cacheService.get<PaginatedResult<Task>>(cacheKey);
    if (cached) return cached;

    const result = await this.taskRepository.findAllByUserId(
      userId,
      pagination,
    );
    await this.cacheService.set(cacheKey, result, CACHE_TTL);

    return result;
  }
}
