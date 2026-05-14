import { CreateTaskUseCase } from '@application/use-cases/task/create-task.usecase.js';
import { MongoTaskRepository } from '@infrastructure/database/mongoose/task.repository.js';
import { CreateTaskController } from '../controllers/create-task.controller.js';

export function makeCreateTaskController(): CreateTaskController {
  const repository = new MongoTaskRepository();
  const useCase = new CreateTaskUseCase(repository);
  return new CreateTaskController(useCase);
}
