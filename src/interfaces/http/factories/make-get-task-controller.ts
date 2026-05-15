import { GetTaskUseCase } from '@application/use-cases/task/get-task.usecase.js';
import { MongoTaskRepository } from '@infrastructure/database/mongoose/task.repository.js';
import { GetTaskController } from '../controllers/get-task.controller.js';

export function makeGetTaskController(): GetTaskController {
  const repository = new MongoTaskRepository();
  const useCase = new GetTaskUseCase(repository);
  return new GetTaskController(useCase);
}
