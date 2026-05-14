import type {
  CreateTaskDTO,
  Task,
  UpdateTaskDTO,
} from '@domain/ports/entities/task.entity.js';
import type { TaskRepository } from '@domain/ports/repositories/task.repository.js';
import { TaskModel } from './task.model.js';

function toTask(doc: InstanceType<typeof TaskModel>): Task {
  const task: Task = {
    id: doc._id.toString(),
    title: doc.title,
    completed: doc.completed,
    userId: doc.userId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  if (doc.description !== undefined) {
    task.description = doc.description;
  }

  return task;
}

export class MongoTaskRepository implements TaskRepository {
  async create(data: CreateTaskDTO): Promise<Task> {
    const doc = await TaskModel.create(data);
    return toTask(doc);
  }

  async createMany(_data: CreateTaskDTO[]): Promise<Task[]> {
    throw new Error('Not implemented');
  }

  async findById(_id: string, _userId: string): Promise<Task | null> {
    throw new Error('Not implemented');
  }

  async findAllByUserId(userId: string): Promise<Task[]> {
    const docs = await TaskModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map(toTask);
  }

  async update(
    _id: string,
    _userId: string,
    _data: UpdateTaskDTO,
  ): Promise<Task | null> {
    throw new Error('Not implemented');
  }

  async delete(_id: string, _userId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
