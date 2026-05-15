import { CreateManyTasksUseCase } from '@application/use-cases/task/create-many-tasks.usecase.js';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service.js';
import { MongoTaskRepository } from '@infrastructure/database/mongoose/task/task.repository.js';
import { CreateManyTasksController } from '../../controllers/task/create-many-tasks.controller.js';

export function makeCreateManyTasksController(): CreateManyTasksController {
  const repository = new MongoTaskRepository();
  const cache = new RedisCacheService();
  const useCase = new CreateManyTasksUseCase(repository, cache);
  return new CreateManyTasksController(useCase);
}
