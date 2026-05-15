import { AppError } from '@domain/errors/app.error.js';
import type { UserRepository } from '@domain/ports/repositories/user.repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string,
  ) {}

  async execute(data: LoginDTO): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) throw new AppError('Credenciais inválidas', 401);

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new AppError('Credenciais inválidas', 401);

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      this.jwtSecret,
      {
        expiresIn: '7d',
      },
    );

    return { token };
  }
}
