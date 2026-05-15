import { AuthProvider } from '@/context/AuthContext'
import TasksPage from '@/features/tasks/TasksPage'

export default function App() {
  return (
    <AuthProvider>
      <TasksPage />
    </AuthProvider>
  )
}
