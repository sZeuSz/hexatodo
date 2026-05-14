import { AppError } from './app.error.js';
import { TaskNotFoundException } from './task-not-found.exception.js';

describe('TaskNotFoundException', () => {
  it('should have status 404 and correct message', () => {
    const error = new TaskNotFoundException();
    expect(error.message).toBe('Tarefa não encontrada');
    expect(error.statusCode).toBe(404);
    expect(error).toBeInstanceOf(AppError);
  });
});
