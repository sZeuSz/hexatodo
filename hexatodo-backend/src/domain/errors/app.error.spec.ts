import { AppError } from './app.error.js';

describe('AppError', () => {
  it('should set message and default statusCode 400', () => {
    const error = new AppError('Erro genérico');
    expect(error.message).toBe('Erro genérico');
    expect(error.statusCode).toBe(400);
    expect(error).toBeInstanceOf(Error);
  });

  it('should set custom statusCode', () => {
    const error = new AppError('Não encontrado', 404);
    expect(error.statusCode).toBe(404);
  });

  it('should set name to class name', () => {
    const error = new AppError('Erro');
    expect(error.name).toBe('AppError');
  });
});
