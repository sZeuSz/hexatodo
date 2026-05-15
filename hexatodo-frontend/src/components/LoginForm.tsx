import { useState, type FormEvent } from 'react'
import { Hexagon, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/features/tasks/services/taskService'

type Tab = 'login' | 'register'

export default function LoginForm() {
  const { login } = useAuth()
  const [mode, setMode] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function switchTab(tab: Tab) {
    setMode(tab)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Preencha todos os campos')
      return
    }

    if (mode === 'register') {
      if (password !== confirmPassword) { setError('As senhas não coincidem'); return }
      if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return }
    }

    setLoading(true)
    try {
      let result: { email: string }
      if (mode === 'login') {
        result = await authService.login(email, password)
      } else {
        result = await authService.register(email, password)
      }
      login(result.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-gray-900/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Hexagon size={32} className="text-violet-400" strokeWidth={1.5} />
              <span className="text-2xl font-bold text-white">hexaToDo</span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white/80">
              {mode === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/40">
              {mode === 'login'
                ? 'Entre na sua conta para continuar'
                : 'Cadastre-se e comece a organizar'}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-5 sm:mb-6 flex rounded-lg bg-white/5 border border-white/10 p-1 gap-1">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </button>
            <button
              type="button"
              onClick={() => switchTab('register')}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Cadastrar
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/30 px-3 sm:px-4 py-2 sm:py-3 text-red-200 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" noValidate>
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-white/80">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/30 text-sm focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-white/80">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-white placeholder-white/30 text-sm focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1">
                <label htmlFor="confirm-password" className="block text-xs sm:text-sm font-medium text-white/80">
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-white placeholder-white/30 text-sm focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="h-4 sm:h-5 w-4 sm:w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : mode === 'login' ? (
                <LogIn className="h-4 sm:h-5 w-4 sm:w-5" />
              ) : (
                <UserPlus className="h-4 sm:h-5 w-4 sm:w-5" />
              )}
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
