import { useAuth } from '../contexts/AuthContext'
import { Zap, LogOut } from 'lucide-react'

interface HeaderProps {
  currentView: 'board' | 'fleet'
  onViewChange: (view: 'board' | 'fleet') => void
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const { user, signOut } = useAuth()

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b sticky top-0 z-50"
      style={{ background: '#0d0d14', borderColor: '#2a2a3e' }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <span className="text-lg font-bold text-white">Daze HQ</span>
        </div>
        <nav className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => onViewChange('board')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${
              currentView === 'board' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mission Board
          </button>
          <button
            onClick={() => onViewChange('fleet')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${
              currentView === 'fleet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Agent Fleet
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">{user?.email}</span>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </header>
  )
}
