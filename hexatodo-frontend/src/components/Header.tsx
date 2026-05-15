import { LogOut, Hexagon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface Props {
  onLogout: () => void
}

export default function Header({ onLogout }: Props) {
  const { email } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Hexagon size={22} className="text-violet-400" strokeWidth={1.5} />
          <span className="font-bold text-white">hexaToDo</span>
        </div>

        <div className="flex items-center gap-3">
          {email && <span className="hidden text-sm text-white/50 sm:block">{email}</span>}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:border-red-500/40 hover:text-red-400"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}
