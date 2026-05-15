import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Task, UpdateTaskDTO } from "../types";

interface Props {
  task: Task;
  onUpdate: (id: string, data: UpdateTaskDTO) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskItem({ task, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setEditing(false);
  }

  return (
    <>
    {confirmDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
        <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900/95 p-6 shadow-2xl">
          <h3 className="text-base font-semibold text-white">Excluir tarefa?</h3>
          <p className="mt-2 text-sm text-white/50">
            "<span className="text-white/70">{task.title}</span>" será removida permanentemente.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={() => { setConfirmDelete(false); void onDelete(task.id) }}
              className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    )}
    <div className="group rounded-xl border border-white/10 bg-gray-900/80 p-4 backdrop-blur-xl transition hover:border-white/20 hover:bg-gray-800/90">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onUpdate(task.id, { completed: !task.completed })}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${task.completed ? "border-green-500 bg-green-500" : "border-white/30 hover:border-violet-400"}`}
        >
          {task.completed && <Check size={12} className="text-white" />}
        </button>

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Descrição..."
                className="w-full resize-none rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white/80 placeholder-white/30 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  <Check size={12} /> Salvar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-xs text-white/60 hover:text-white"
                >
                  <X size={12} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className={`font-medium text-white ${task.completed ? "line-through text-white/40" : ""}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="mt-1 text-sm text-white/50">{task.description}</p>
              )}
              <p className="mt-1.5 text-xs text-white/30">
                {new Date(task.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </>
          )}
        </div>

        {!editing && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg p-1.5 text-white/40 transition hover:bg-red-500/20 hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
