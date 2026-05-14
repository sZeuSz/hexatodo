import { ListTasksUseCase } from '@application/use-cases/task/list-tasks.usecase.js';
import { MongoTaskRepository } from '@infrastructure/database/mongoose/task.repository.js';
import { ListTasksController } from '../controllers/list-tasks.controller.js';

export function makeListTasksController(): ListTasksController {
  const repository = new MongoTaskRepository();
  const useCase = new ListTasksUseCase(repository);
  return new ListTasksController(useCase);
}
