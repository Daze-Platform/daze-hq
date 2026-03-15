import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './components/Login'
import { KanbanBoard } from './components/KanbanBoard'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    )
  }

  return user ? <KanbanBoard /> : <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
