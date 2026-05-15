import { useState, type FormEvent } from "react";
import type { CreateTaskDTO } from "../types";

interface Props {
  onSubmit: (data: CreateTaskDTO) => Promise<void>;
  onCancel?: () => void;
}

export default function TaskForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar tarefa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-white/10 bg-gray-900/80 p-6 backdrop-blur-xl"
    >
      <h3 className="text-lg font-semibold text-white">Nova tarefa</h3>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="space-y-1">
        <label className="text-sm text-white/70">Título *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Nome da tarefa..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-white/70">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Descrição opcional..."
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex-1 rounded-lg bg-violet-600 py-2 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Criar tarefa"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 px-4 py-2 text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
