import { apiFetch } from "@/lib/fetcher";
import type {
  CreateTaskDTO,
  PaginatedTasksResponse,
  Task,
  TaskFilters,
  UpdateTaskDTO,
} from "../types";

const BASE = "/api/tasks";

export const taskService = {
  async getAll(filters?: TaskFilters): Promise<PaginatedTasksResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return apiFetch<PaginatedTasksResponse>(`${BASE}${qs ? `?${qs}` : ""}`);
  },

  async create(data: CreateTaskDTO): Promise<Task> {
    return apiFetch<Task>(BASE, { method: "POST", body: JSON.stringify(data) });
  },

  async update(id: string, data: UpdateTaskDTO): Promise<Task> {
    return apiFetch<Task>(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" });
  },

  async bulkImport(tasks: CreateTaskDTO[]): Promise<Task[]> {
    return apiFetch<Task[]>(`${BASE}/bulk`, {
      method: "POST",
      body: JSON.stringify({ tasks }),
    });
  },
};

export const authService = {
  async login(email: string, password: string): Promise<{ email: string }> {
    return apiFetch<{ email: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(
    email: string,
    password: string,
  ): Promise<{ email: string }> {
    return apiFetch<{ email: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async logout(): Promise<void> {
    await apiFetch<void>("/api/auth/logout", { method: "POST" });
  },
};
