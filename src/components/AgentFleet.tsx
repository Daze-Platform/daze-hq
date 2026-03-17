import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AgentFleet as AgentFleetType } from '../types'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function StatusBadge({ status }: { status: AgentFleetType['status'] }) {
  const configs = {
    active: { label: 'Active', dot: 'bg-green-400', class: 'bg-green-500/20 text-green-400 border border-green-500/30', pulse: true },
    idle: { label: 'Idle', dot: 'bg-slate-400', class: 'bg-slate-500/20 text-slate-400 border border-slate-500/30', pulse: false },
    blocked: { label: 'Blocked', dot: 'bg-red-400', class: 'bg-red-500/20 text-red-400 border border-red-500/30', pulse: false },
    coming_soon: { label: 'Coming Soon', dot: 'bg-yellow-400', class: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', pulse: false },
  }
  const cfg = configs[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.class}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  )
}

function AgentCard({ agent }: { agent: AgentFleetType }) {
  const borderColor = agent.color ?? '#6366f1'
  const isComingSoon = agent.is_coming_soon

  return (
    <div
      className={`relative rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 ${isComingSoon ? 'opacity-60' : ''}`}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: isComingSoon ? `1px dashed rgba(255,255,255,0.15)` : `1px solid rgba(255,255,255,0.08)`,
        borderLeft: isComingSoon ? undefined : `4px solid ${borderColor}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {isComingSoon && (
        <div className="absolute top-3 right-3">
          <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Soon</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl leading-none">{agent.emoji}</span>
        {!isComingSoon && <StatusBadge status={agent.status} />}
      </div>

      <h3 className="text-lg font-bold text-white mb-0.5">{agent.name}</h3>
      <p className="text-sm text-slate-400 mb-4">{agent.role}</p>

      {isComingSoon ? (
        <p className="text-sm text-slate-600 italic">Deployment pending...</p>
      ) : (
        <>
          <div className="min-h-[2.5rem] mb-3">
            {agent.current_task ? (
              <p className="text-sm text-slate-300 line-clamp-2">
                <span className="text-slate-500 mr-1">▸</span>{agent.current_task}
              </p>
            ) : (
              <p className="text-sm text-slate-600 italic">No active task</p>
            )}
          </div>
          {agent.last_action && (
            <div className="border-t border-white/5 pt-3">
              <p className="text-xs text-slate-500 line-clamp-1 mb-0.5">{agent.last_action}</p>
              <p className="text-xs text-slate-600">{timeAgo(agent.last_updated)}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-6 animate-pulse"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-white/10" />
        <div className="w-16 h-5 rounded-full bg-white/10" />
      </div>
      <div className="h-5 w-24 bg-white/10 rounded mb-1.5" />
      <div className="h-4 w-32 bg-white/5 rounded mb-4" />
      <div className="h-4 w-full bg-white/5 rounded mb-2" />
      <div className="h-4 w-3/4 bg-white/5 rounded" />
    </div>
  )
}

export default function AgentFleet() {
  const [agents, setAgents] = useState<AgentFleetType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from('agent_fleet')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) {
        setError(error.message)
      } else {
        setAgents(data ?? [])
      }
      setLoading(false)
    }

    fetchAgents()

    const channel = supabase
      .channel('agent_fleet_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_fleet' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setAgents(prev => prev.map(a => a.id === (payload.new as AgentFleetType).id ? (payload.new as AgentFleetType) : a))
        } else if (payload.eventType === 'INSERT') {
          setAgents(prev => [...prev, payload.new as AgentFleetType])
        } else if (payload.eventType === 'DELETE') {
          setAgents(prev => prev.filter(a => a.id !== (payload.old as AgentFleetType).id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const activeCount = agents.filter(a => a.status === 'active').length

  return (
    <div className="flex-1 overflow-auto px-6 py-8" style={{ background: '#0a0a0f' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Agent Fleet</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {loading ? 'Loading...' : `${agents.length} agents · ${activeCount} active`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-green-400 tracking-wider uppercase">Live</span>
          </div>
        </div>

        {error ? (
          <div className="text-center py-16">
            <p className="text-red-400 text-sm">Failed to load fleet: {error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        )}
      </div>
    </div>
  )
}
