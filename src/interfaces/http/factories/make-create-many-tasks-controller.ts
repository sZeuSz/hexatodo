import { CreateManyTasksUseCase } from '@application/use-cases/task/create-many-tasks.usecase.js';
import { MongoTaskRepository } from '@infrastructure/database/mongoose/task.repository.js';
import { CreateManyTasksController } from '../controllers/create-many-tasks.controller.js';

export function makeCreateManyTasksController(): CreateManyTasksController {
  const repository = new MongoTaskRepository();
  const useCase = new CreateManyTasksUseCase(repository);
  return new CreateManyTasksController(useCase);
}
