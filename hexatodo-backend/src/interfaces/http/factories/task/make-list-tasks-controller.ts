import { ListTasksUseCase } from '@application/use-cases/task/list-tasks.usecase.js';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service.js';
import { MongoTaskRepository } from '@infrastructure/database/mongoose/task/task.repository.js';
import { ListTasksController } from '../../controllers/task/list-tasks.controller.js';

export function makeListTasksController(): ListTasksController {
  const repository = new MongoTaskRepository();
  const cache = new RedisCacheService();
  const useCase = new ListTasksUseCase(repository, cache);
  return new ListTasksController(useCase);
}
