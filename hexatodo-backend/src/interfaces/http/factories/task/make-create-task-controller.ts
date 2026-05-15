import { CreateTaskUseCase } from '@application/use-cases/task/create-task.usecase.js';
import { RedisCacheService } from '@infrastructure/cache/redis-cache.service.js';
import { MongoTaskRepository } from '@infrastructure/database/mongoose/task/task.repository.js';
import { CreateTaskController } from '../../controllers/task/create-task.controller.js';

export function makeCreateTaskController(): CreateTaskController {
  const repository = new MongoTaskRepository();
  const cache = new RedisCacheService();
  const useCase = new CreateTaskUseCase(repository, cache);
  return new CreateTaskController(useCase);
}
