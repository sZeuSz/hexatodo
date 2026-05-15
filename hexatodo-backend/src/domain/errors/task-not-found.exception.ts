import { AppError } from './app.error.js';

export class TaskNotFoundException extends AppError {
  constructor() {
    super('Tarefa não encontrada', 404);
  }
}
