import { RegisterUseCase } from '@application/use-cases/auth/register.usecase.js';
import { MongoUserRepository } from '@infrastructure/database/mongoose/user/user.repository.js';
import { RegisterController } from '../../controllers/auth/register.controller.js';

export function makeRegisterController(): RegisterController {
  const repository = new MongoUserRepository();
  const useCase = new RegisterUseCase(repository);
  return new RegisterController(useCase);
}
