import { useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Zap, Loader2 } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError(error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0f' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-white">Daze HQ</h1>
          </div>
          <p className="text-slate-400 text-sm">Internal Mission Control</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-6 space-y-4 border"
          style={{ background: '#1a1a2e', borderColor: '#2a2a3e' }}
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              style={{ background: '#0f0f1a', borderColor: '#2a2a3e' }}
              placeholder="you@dazeapp.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              style={{ background: '#0f0f1a', borderColor: '#2a2a3e' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
