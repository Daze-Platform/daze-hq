import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AgentCard } from './AgentCard'
import type { MissionAgent } from '../types'

const STATUS_ORDER: Record<string, number> = { active: 0, blocked: 1, idle: 2, offline: 3 }

export function AgentFleet() {
  const [agents, setAgents] = useState<MissionAgent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAgents = async () => {
    const { data } = await supabase
      .from('mission_agents')
      .select('*')
      .order('sort_order', { ascending: true })
    if (data) {
      const sorted = [...data].sort(
        (a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)
      )
      setAgents(sorted)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAgents()

    const channel = supabase
      .channel('fleet-agents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_agents' }, () => {
        fetchAgents()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const activeCount = agents.filter((a) => a.status === 'active').length
  const idleCount = agents.filter((a) => a.status === 'idle').length
  const blockedCount = agents.filter((a) => a.status === 'blocked').length

  if (loading) {
    return (
      <div className="fleet-loading">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="fleet-container">
      {/* Summary stats */}
      <div className="fleet-stats">
        <div className="fleet-stat">
          <span className="fleet-stat__dot" style={{ background: '#22c55e' }} />
          <span className="fleet-stat__num">{activeCount}</span>
          <span className="fleet-stat__label">Active</span>
        </div>
        <div className="fleet-stat">
          <span className="fleet-stat__dot" style={{ background: '#f59e0b' }} />
          <span className="fleet-stat__num">{idleCount}</span>
          <span className="fleet-stat__label">Idle</span>
        </div>
        {blockedCount > 0 && (
          <div className="fleet-stat">
            <span className="fleet-stat__dot" style={{ background: '#ef4444' }} />
            <span className="fleet-stat__num">{blockedCount}</span>
            <span className="fleet-stat__label">Blocked</span>
          </div>
        )}
        <div className="fleet-stat fleet-stat--total">
          <span className="fleet-stat__num">{agents.length}</span>
          <span className="fleet-stat__label">Total Agents</span>
        </div>
      </div>

      {/* Agent grid */}
      <div className="fleet-grid">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  )
}
