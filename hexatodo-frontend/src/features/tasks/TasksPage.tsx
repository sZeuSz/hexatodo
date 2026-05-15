import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Header from '@/components/Header'
import LoginForm from '@/components/LoginForm'
import { TaskForm, TaskList, BulkImportForm } from './components'
import { useTasks } from './hooks/useTasks'
import type { TaskFilters } from './types'

export default function TasksPage() {
  const { isAuthenticated, logout } = useAuth()
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, limit: 20 })
  const [showBulk, setShowBulk] = useState(false)
  const { tasks, isLoading, error, createTask, updateTask, deleteTask, bulkImport, total, totalPages, page } = useTasks(
    isAuthenticated ? filters : undefined,
  )

  useEffect(() => {
    function handleUnauth() { void logout() }
    window.addEventListener('auth:unauthorized', handleUnauth)
    return () => window.removeEventListener('auth:unauthorized', handleUnauth)
  }, [logout])

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header onLogout={() => void logout()} />

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowBulk((v) => !v)}
            className="ml-auto rounded-lg border border-violet-500/40 bg-gray-900/80 px-3 py-1.5 text-sm text-violet-400 transition hover:border-violet-500 hover:bg-gray-800/90 hover:text-violet-300"
          >
            {showBulk ? 'Ocultar importação' : 'Importar JSON'}
          </button>
        </div>

        {showBulk && <BulkImportForm onImport={bulkImport} />}

        <TaskForm onSubmit={createTask} />

        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            Erro ao carregar tarefas. Tente recarregar a página.
          </p>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="rounded-lg border border-white/10 bg-gray-900/80 px-3 py-1.5 text-sm text-white/50">{total} tarefa(s) no total</p>
          </div>
          <TaskList tasks={tasks} isLoading={isLoading} onUpdate={updateTask} onDelete={deleteTask} />
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
              className="rounded-lg border border-white/10 bg-gray-900/80 px-4 py-2 text-sm text-white/60 transition hover:border-white/30 hover:bg-gray-800/90 hover:text-white disabled:opacity-30"
            >
              Anterior
            </button>
            <span className="flex items-center rounded-lg border border-white/10 bg-gray-900/80 px-4 py-2 text-sm text-white/50">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
              className="rounded-lg border border-white/10 bg-gray-900/80 px-4 py-2 text-sm text-white/60 transition hover:border-white/30 hover:bg-gray-800/90 hover:text-white disabled:opacity-30"
            >
              Próxima
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
