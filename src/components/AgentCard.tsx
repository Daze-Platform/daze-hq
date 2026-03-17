import type { MissionAgent } from '../types'

interface AgentCardProps {
  agent: MissionAgent
}

function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return 'Never'
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  idle: { label: 'Idle', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  blocked: { label: 'Blocked', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  offline: { label: 'Offline', color: '#5c6178', bg: 'rgba(92,97,120,0.12)' },
}

const MODEL_SHORT: Record<string, string> = {
  'claude-opus-4-6': 'Opus 4.6',
  'claude-sonnet-4': 'Sonnet 4',
  'claude-max/claude-sonnet-4': 'Sonnet 4',
  'gpt-5.3-codex': 'GPT-5.3',
  'gpt-5.2-codex': 'GPT-5.2',
  'gemini-2.5-flash': 'Gemini Flash',
}

export function AgentCard({ agent }: AgentCardProps) {
  const statusCfg = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle
  const isHuman = agent.model === null
  const shortModel = agent.model ? (MODEL_SHORT[agent.model] ?? agent.model) : null

  return (
    <div className={`fleet-card ${agent.status === 'active' ? 'fleet-card--active' : ''}`}>
      {/* Top accent bar */}
      <div
        className="fleet-card__accent"
        style={{ background: statusCfg.color }}
      />

      {/* Card header */}
      <div className="fleet-card__header">
        <div className="fleet-card__avatar">
          {agent.avatar_emoji}
        </div>
        <div className="fleet-card__title">
          <div className="fleet-card__name">{agent.name}</div>
          <div className="fleet-card__role">{agent.role}</div>
        </div>
        <div
          className="fleet-card__status"
          style={{ color: statusCfg.color, background: statusCfg.bg }}
        >
          <span
            className={`fleet-card__dot ${agent.status === 'active' ? 'fleet-card__dot--pulse' : ''}`}
            style={{ background: statusCfg.color }}
          />
          {statusCfg.label}
        </div>
      </div>

      {/* Model badge */}
      {!isHuman && shortModel && (
        <div className="fleet-card__model">
          <span className="fleet-card__model-icon">⚡</span>
          {shortModel}
        </div>
      )}
      {isHuman && (
        <div className="fleet-card__model fleet-card__model--human">
          <span className="fleet-card__model-icon">🧠</span>
          Human
        </div>
      )}

      {/* Current task */}
      <div className="fleet-card__section">
        <div className="fleet-card__label">Current Task</div>
        <div className={`fleet-card__task ${!agent.current_task ? 'fleet-card__task--empty' : ''}`}>
          {agent.current_task ?? 'No active task'}
        </div>
      </div>

      {/* Last action */}
      <div className="fleet-card__section">
        <div className="fleet-card__label">Last Action</div>
        <div className="fleet-card__last-action">
          <span className={`fleet-card__action-text ${!agent.last_action ? 'fleet-card__task--empty' : ''}`}>
            {agent.last_action ?? 'No recent activity'}
          </span>
          <span className="fleet-card__timestamp">
            {formatRelativeTime(agent.last_action_at ?? null)}
          </span>
        </div>
      </div>
    </div>
  )
}
