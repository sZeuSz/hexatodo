import TaskItem from './TaskItem'
import type { Task, UpdateTaskDTO } from '../types'

interface Props {
  tasks: Task[]
  isLoading: boolean
  onUpdate: (id: string, data: UpdateTaskDTO) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function TaskList({ tasks, isLoading, onUpdate, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 py-16 text-center">
        <p className="text-white/40">Nenhuma tarefa encontrada.</p>
        <p className="mt-1 text-sm text-white/30">Crie sua primeira tarefa acima!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  )
}
