import { UpdateTaskUseCase } from '@application/use-cases/task/update-task.usecase.js';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service.js';
import { MongoTaskRepository } from '@infrastructure/database/mongoose/task/task.repository.js';
import { UpdateTaskController } from '../../controllers/task/update-task.controller.js';

export function makeUpdateTaskController(): UpdateTaskController {
  const repository = new MongoTaskRepository();
  const cache = new RedisCacheService();
  const useCase = new UpdateTaskUseCase(repository, cache);
  return new UpdateTaskController(useCase);
}
