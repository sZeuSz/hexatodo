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

  async createMany(data: CreateTaskDTO[]): Promise<Task[]> {
    const docs = await TaskModel.insertMany(data);
    return docs.map(toTask);
  }

  async findById(id: string, userId: string): Promise<Task | null> {
    const doc = await TaskModel.findOne({ _id: id, userId });
    return doc ? toTask(doc) : null;
  }

  async findAllByUserId(userId: string): Promise<Task[]> {
    const docs = await TaskModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map(toTask);
  }

  async update(
    id: string,
    userId: string,
    data: UpdateTaskDTO,
  ): Promise<Task | null> {
    const doc = await TaskModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true },
    );
    return doc ? toTask(doc) : null;
  }

  async delete(id: string, userId: string): Promise<void> {
    await TaskModel.deleteOne({ _id: id, userId });
  }
}
