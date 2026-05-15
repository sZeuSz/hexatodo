import { AppError } from './app.error.js';
import { UnauthorizedException } from './unauthorized.exception.js';

describe('UnauthorizedException', () => {
  it('should have status 403 and default message', () => {
    const error = new UnauthorizedException();
    expect(error.message).toBe('Acesso não autorizado');
    expect(error.statusCode).toBe(403);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should accept custom message', () => {
    const error = new UnauthorizedException('Sem permissão');
    expect(error.message).toBe('Sem permissão');
  });
});
