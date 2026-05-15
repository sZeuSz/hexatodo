import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TaskForm from '@/features/tasks/components/TaskForm'

describe('TaskForm', () => {
  it('renders title input', () => {
    render(<TaskForm onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText('Nome da tarefa...')).toBeInTheDocument()
  })

  it('calls onSubmit with form data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TaskForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('Nome da tarefa...'), {
      target: { value: 'Minha tarefa' },
    })
    fireEvent.click(screen.getByText('Criar tarefa'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Minha tarefa' }),
      )
    })
  })

  it('does not submit with empty title', async () => {
    const onSubmit = vi.fn()
    render(<TaskForm onSubmit={onSubmit} />)
    fireEvent.click(screen.getByText('Criar tarefa'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows cancel button when onCancel is provided', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Falhou'))
    render(<TaskForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('Nome da tarefa...'), {
      target: { value: 'Tarefa com erro' },
    })
    fireEvent.click(screen.getByText('Criar tarefa'))

    await waitFor(() => {
      expect(screen.getByText('Falhou')).toBeInTheDocument()
    })
  })
})
