export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTasksResponse {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
}
