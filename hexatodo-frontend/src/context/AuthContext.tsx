import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface AuthContextType {
  email: string | null
  isAuthenticated: boolean
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem('auth_email'))

  const login = useCallback((userEmail: string) => {
    setEmail(userEmail)
    localStorage.setItem('auth_email', userEmail)
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => null)
    setEmail(null)
    localStorage.removeItem('auth_email')
  }, [])

  return (
    <AuthContext.Provider value={{ email, isAuthenticated: !!email, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
