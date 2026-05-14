import { AppError } from './app.error.js';

export class UnauthorizedException extends AppError {
  constructor(message = 'Acesso não autorizado') {
    super(message, 403);
  }
}
