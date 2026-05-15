import { GetTaskUseCase } from '@application/use-cases/task/get-task.usecase.js';
import { MongoTaskRepository } from '@infrastructure/database/mongoose/task/task.repository.js';
import { GetTaskController } from '../../controllers/task/get-task.controller.js';

export function makeGetTaskController(): GetTaskController {
  const repository = new MongoTaskRepository();
  const useCase = new GetTaskUseCase(repository);
  return new GetTaskController(useCase);
}
