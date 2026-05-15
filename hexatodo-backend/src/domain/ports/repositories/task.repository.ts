import type {
  CreateTaskDTO,
  Task,
  UpdateTaskDTO,
} from '../entities/task.entity.js';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskRepository {
  findById(id: string, userId: string): Promise<Task | null>;
  findAllByUserId(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Task>>;
  create(data: CreateTaskDTO): Promise<Task>;
  createMany(data: CreateTaskDTO[]): Promise<Task[]>;
  update(id: string, userId: string, data: UpdateTaskDTO): Promise<Task | null>;
  delete(id: string, userId: string): Promise<void>;
}
