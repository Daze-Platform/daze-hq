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
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
  idle: { label: 'Idle', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  blocked: { label: 'Blocked', color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
  offline: { label: 'Offline', color: '#3e4358', bg: 'rgba(62,67,88,0.10)' },
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
  const isActive = agent.status === 'active'
  const isOffline = agent.status === 'offline'

  return (
    <div
      className={`fleet-card ${isActive ? 'fleet-card--active' : ''} ${isOffline ? 'fleet-card--offline' : ''}`}
      style={isActive ? { '--card-glow': statusCfg.color } as React.CSSProperties : undefined}
    >
      {/* Top accent bar */}
      <div
        className="fleet-card__accent"
        style={{ background: isOffline ? 'var(--border)' : statusCfg.color }}
      />

      {/* Card header */}
      <div className="fleet-card__header">
        <div
          className={`fleet-card__avatar ${isActive ? 'fleet-card__avatar--active' : ''}`}
          style={isActive ? { borderColor: `${statusCfg.color}40`, boxShadow: `0 0 12px ${statusCfg.color}20` } : undefined}
        >
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
            className={`fleet-card__dot ${isActive ? 'fleet-card__dot--pulse' : ''}`}
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
        <div
          className={`fleet-card__task ${!agent.current_task ? 'fleet-card__task--empty' : ''} ${isActive && agent.current_task ? 'fleet-card__task--active' : ''}`}
        >
          {isActive && agent.current_task && <span className="fleet-card__cursor" />}
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

      {/* Active scan line overlay */}
      {isActive && <div className="fleet-card__scanline" />}
    </div>
  )
}
