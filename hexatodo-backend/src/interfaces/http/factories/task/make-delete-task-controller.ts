import { DeleteTaskUseCase } from '@application/use-cases/task/delete-task.usecase.js';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service.js';
import { MongoTaskRepository } from '@infrastructure/database/mongoose/task/task.repository.js';
import { DeleteTaskController } from '../../controllers/task/delete-task.controller.js';

export function makeDeleteTaskController(): DeleteTaskController {
  const repository = new MongoTaskRepository();
  const cache = new RedisCacheService();
  const useCase = new DeleteTaskUseCase(repository, cache);
  return new DeleteTaskController(useCase);
}
