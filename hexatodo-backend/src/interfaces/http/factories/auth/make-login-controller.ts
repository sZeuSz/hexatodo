import { LoginUseCase } from '@application/use-cases/auth/login.usecase.js';
import { MongoUserRepository } from '@infrastructure/database/mongoose/user/user.repository.js';
import { env } from '@config/env.js';
import { LoginController } from '../../controllers/auth/login.controller.js';

export function makeLoginController(): LoginController {
  const repository = new MongoUserRepository();
  const useCase = new LoginUseCase(repository, env.JWT_SECRET);
  return new LoginController(useCase);
}
