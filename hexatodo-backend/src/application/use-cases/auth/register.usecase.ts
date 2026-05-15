import { AppError } from '@domain/errors/app.error.js';
import type { User } from '@domain/ports/entities/user.entity.js';
import type { UserRepository } from '@domain/ports/repositories/user.repository.js';
import bcrypt from 'bcrypt';

export interface RegisterDTO {
  email: string;
  password: string;
}

export class RegisterUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(data: RegisterDTO): Promise<User> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new AppError('E-mail já cadastrado', 409);

    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.userRepository.create({ email: data.email, passwordHash });
  }
}
