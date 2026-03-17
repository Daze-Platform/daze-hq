import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AgentCard } from './AgentCard'
import type { MissionAgent } from '../types'

const STATUS_ORDER: Record<string, number> = { active: 0, blocked: 1, idle: 2, offline: 3 }

function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return ''
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${hours}h ago`
}

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

  // Build a live activity feed from agents that have recent actions
  const recentActivity = [...agents]
    .filter((a) => a.last_action && a.last_action_at)
    .sort((a, b) => {
      const ta = a.last_action_at ? new Date(a.last_action_at).getTime() : 0
      const tb = b.last_action_at ? new Date(b.last_action_at).getTime() : 0
      return tb - ta
    })
    .slice(0, 6)

  if (loading) {
    return (
      <div className="fleet-loading">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="fleet-container">
      {/* Mission Control Header */}
      <div className="fleet-header">
        <div className="fleet-header__left">
          <div className="fleet-header__title">
            <span className="fleet-header__icon">⚡</span>
            Mission Control
          </div>
          <div className="fleet-header__subtitle">Daze Agent Fleet — Live Status</div>
        </div>
        <div className="fleet-stats">
          <div className="fleet-stat">
            <span className="fleet-stat__dot fleet-stat__dot--pulse" style={{ background: '#22c55e' }} />
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
            <span className="fleet-stat__label">Agents</span>
          </div>
        </div>
      </div>

      {/* Main content: grid + activity feed */}
      <div className="fleet-workspace">
        {/* Agent grid */}
        <div className="fleet-grid">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>

        {/* Activity feed sidebar */}
        {recentActivity.length > 0 && (
          <div className="fleet-feed">
            <div className="fleet-feed__title">Live Feed</div>
            {recentActivity.map((agent) => (
              <div key={agent.id} className={`fleet-feed__item ${agent.status === 'active' ? 'fleet-feed__item--active' : ''}`}>
                <span className="fleet-feed__avatar">{agent.avatar_emoji}</span>
                <div className="fleet-feed__body">
                  <div className="fleet-feed__agent">{agent.name}</div>
                  <div className="fleet-feed__action">{agent.last_action}</div>
                </div>
                <div className="fleet-feed__time">{formatRelativeTime(agent.last_action_at ?? null)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
