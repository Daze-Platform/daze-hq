import { useState } from 'react'
import { useAuth, AuthProvider } from './contexts/AuthContext'
import Login from './components/Login'
import Header from './components/Header'
import KanbanBoard from './components/KanbanBoard'
import AgentFleet from './components/AgentFleet'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState<'board' | 'fleet'>('board')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      <Header currentView={currentView} onViewChange={setCurrentView} />
      {currentView === 'board' ? <KanbanBoard /> : <AgentFleet />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
