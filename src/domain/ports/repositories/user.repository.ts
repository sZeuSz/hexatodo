import type { CreateUserDTO, User } from '../entities/user.entity.js';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
}
