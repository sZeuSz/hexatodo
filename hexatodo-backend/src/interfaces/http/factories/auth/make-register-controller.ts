import { LoginUseCase } from '@application/use-cases/auth/login.usecase.js';
import { RegisterUseCase } from '@application/use-cases/auth/register.usecase.js';
import { env } from '@config/env.js';
import { MongoUserRepository } from '@infrastructure/database/mongoose/user/user.repository.js';
import { RegisterController } from '../../controllers/auth/register.controller.js';

export function makeRegisterController(): RegisterController {
  const repository = new MongoUserRepository();
  const registerUseCase = new RegisterUseCase(repository);
  const loginUseCase = new LoginUseCase(repository, env.JWT_SECRET);
  return new RegisterController(registerUseCase, loginUseCase);
}
