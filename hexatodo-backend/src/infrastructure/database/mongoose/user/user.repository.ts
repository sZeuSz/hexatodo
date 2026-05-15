import type {
  CreateUserDTO,
  User,
} from '@domain/ports/entities/user.entity.js';
import type { UserRepository } from '@domain/ports/repositories/user.repository.js';
import { UserModel } from './user.model.js';

function toUser(doc: InstanceType<typeof UserModel>): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    passwordHash: doc.passwordHash,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });
    return doc ? toUser(doc) : null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const doc = await UserModel.create(data);
    return toUser(doc);
  }
}
