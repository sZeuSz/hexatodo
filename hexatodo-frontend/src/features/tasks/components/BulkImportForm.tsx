import { useState, type FormEvent } from 'react'
import { Upload } from 'lucide-react'
import type { CreateTaskDTO } from '../types'

interface Props {
  onImport: (tasks: CreateTaskDTO[]) => Promise<void>
}

const PLACEHOLDER = `[
  { "title": "Tarefa 1", "priority": "high" },
  { "title": "Tarefa 2", "description": "Detalhes", "status": "in_progress" }
]`

export default function BulkImportForm({ onImport }: Props) {
  const [json, setJson] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    let parsed: CreateTaskDTO[]
    try {
      parsed = JSON.parse(json) as CreateTaskDTO[]
      if (!Array.isArray(parsed)) throw new Error('Deve ser um array JSON')
    } catch {
      setError('JSON inválido. Certifique-se de usar um array de objetos.')
      return
    }

    setLoading(true)
    try {
      await onImport(parsed)
      setSuccess(`${parsed.length} tarefa(s) importada(s) com sucesso!`)
      setJson('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/10 bg-gray-900/80 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <Upload size={16} className="text-violet-400" />
        <h3 className="font-semibold text-white">Importação em massa</h3>
      </div>

      {error && <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}
      {success && <p className="rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-400">{success}</p>}

      <div className="space-y-1">
        <label className="text-sm text-white/70">JSON com array de tarefas</label>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={8}
          placeholder={PLACEHOLDER}
          className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !json.trim()}
        className="w-full rounded-lg bg-violet-600 py-2 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? 'Importando...' : 'Importar tarefas'}
      </button>
    </form>
  )
}
