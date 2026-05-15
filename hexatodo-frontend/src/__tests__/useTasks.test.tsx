import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import type { PaginatedTasksResponse } from '@/features/tasks/types'

const mockResponse: PaginatedTasksResponse = {
  data: [
    { id: '1', title: 'Task 1', status: 'pending', priority: 'medium', createdAt: '', updatedAt: '' },
    { id: '2', title: 'Task 2', status: 'completed', priority: 'high', createdAt: '', updatedAt: '' },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
}

vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: mockResponse,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
  })),
}))

describe('useTasks', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns tasks from SWR data', async () => {
    const { result } = renderHook(() => useTasks())
    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2)
      expect(result.current.tasks[0].title).toBe('Task 1')
    })
  })

  it('exposes pagination info', async () => {
    const { result } = renderHook(() => useTasks())
    await waitFor(() => {
      expect(result.current.total).toBe(2)
      expect(result.current.page).toBe(1)
      expect(result.current.totalPages).toBe(1)
    })
  })

  it('returns empty tasks when data is undefined', async () => {
    const { default: useSWR } = await import('swr')
    vi.mocked(useSWR).mockReturnValueOnce({
      data: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })
})
