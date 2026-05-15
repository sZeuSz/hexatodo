import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { taskService } from '../services/taskService'
import type { Task, CreateTaskDTO, UpdateTaskDTO, PaginatedTasksResponse, TaskFilters } from '../types'

function buildKey(filters?: TaskFilters): string {
  const params = new URLSearchParams()
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.limit) params.set('limit', String(filters.limit))
  const qs = params.toString()
  return `/api/tasks${qs ? `?${qs}` : ''}`
}

function patchData(
  current: PaginatedTasksResponse | undefined,
  updater: (tasks: Task[]) => Task[],
): PaginatedTasksResponse {
  const tasks = current?.data ?? []
  const updated = updater(tasks)
  return {
    data: updated,
    total: current?.total ?? updated.length,
    page: current?.page ?? 1,
    limit: current?.limit ?? 20,
    totalPages: current?.totalPages ?? 1,
  }
}

export function useTasks(filters?: TaskFilters) {
  const key = buildKey(filters)
  const { data, error, isLoading, mutate } = useSWR<PaginatedTasksResponse>(
    key,
    fetcher,
  )

  const tasks = data?.data ?? []

  async function createTask(dto: CreateTaskDTO) {
    const optimistic = patchData(data, (prev) => [
      ...prev,
      { id: `tmp-${Date.now()}`, completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...dto } as Task,
    ])
    await mutate(
      async () => {
        const created = await taskService.create(dto)
        return patchData(data, (prev) => [...prev, created])
      },
      { optimisticData: optimistic, rollbackOnError: true },
    )
  }

  async function updateTask(id: string, dto: UpdateTaskDTO) {
    const optimistic = patchData(data, (prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...dto } : t)),
    )
    await mutate(
      async () => {
        const updated = await taskService.update(id, dto)
        return patchData(data, (prev) => prev.map((t) => (t.id === id ? updated : t)))
      },
      { optimisticData: optimistic, rollbackOnError: true },
    )
  }

  async function deleteTask(id: string) {
    const optimistic = patchData(data, (prev) => prev.filter((t) => t.id !== id))
    await mutate(
      async () => {
        await taskService.remove(id)
        return patchData(data, (prev) => prev.filter((t) => t.id !== id))
      },
      { optimisticData: optimistic, rollbackOnError: true },
    )
  }

  async function bulkImport(taskList: CreateTaskDTO[]) {
    await mutate(async () => {
      const created = await taskService.bulkImport(taskList)
      return patchData(data, (prev) => [...prev, ...created])
    })
  }

  return {
    tasks,
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    bulkImport,
    mutate,
  }
}
