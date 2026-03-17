import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { MissionAgent } from '../types'

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_ORDER: Record<string, number> = { active: 0, blocked: 1, idle: 2, offline: 3 }

const STATUS_CONFIG: Record<string, { label: string; color: string; glow: string; floor: string }> = {
  active:  { label: 'Active',   color: '#22c55e', glow: 'rgba(34,197,94,0.55)',   floor: 'rgba(34,197,94,0.06)' },
  idle:    { label: 'Idle',     color: '#f59e0b', glow: 'rgba(245,158,11,0.45)',  floor: 'rgba(245,158,11,0.05)' },
  blocked: { label: 'Blocked',  color: '#ef4444', glow: 'rgba(239,68,68,0.55)',   floor: 'rgba(239,68,68,0.06)' },
  offline: { label: 'Offline',  color: '#3e4358', glow: 'rgba(62,67,88,0.2)',     floor: 'rgba(15,17,23,0.4)' },
}

const MODEL_SHORT: Record<string, string> = {
  'claude-opus-4-6':            'Opus 4.6',
  'claude-sonnet-4':            'Sonnet 4',
  'claude-max/claude-sonnet-4': 'Sonnet 4',
  'gpt-5.3-codex':              'GPT-5.3',
  'gpt-5.2-codex':              'GPT-5.2',
  'gemini-2.5-flash':           'Gemini Flash',
}

function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return 'Never'
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ─── IsometricTile ───────────────────────────────────────────────────────────

interface TileProps {
  agent: MissionAgent
  index: number
  selected: boolean
  onClick: () => void
}

function IsometricTile({ agent, index, selected, onClick }: TileProps) {
  const cfg     = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle
  const isActive  = agent.status === 'active'
  const isOffline = agent.status === 'offline'
  const isBlocked = agent.status === 'blocked'

  return (
    <div
      className={[
        'iso-tile-wrapper',
        isActive  ? 'iso-tile-wrapper--active'  : '',
        isOffline ? 'iso-tile-wrapper--offline' : '',
        selected  ? 'iso-tile-wrapper--selected' : '',
      ].join(' ')}
      style={{ '--tile-glow': cfg.glow, '--tile-color': cfg.color, '--tile-delay': `${index * 60}ms` } as React.CSSProperties}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${agent.name} — ${cfg.label}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
    >
      {/* ── isometric box ── */}
      <div className="iso-box">
        {/* Top face (floor) */}
        <div
          className="iso-face iso-face--top"
          style={{ background: isOffline ? 'rgba(30,32,46,0.85)' : cfg.floor }}
        >
          {/* Desk surface detail */}
          <div className="iso-desk">
            <div className="iso-desk__screen" style={{ borderColor: isOffline ? '#2e3347' : cfg.color }} />
            <div className="iso-desk__keyboard" />
          </div>

          {/* Avatar on the tile */}
          <div className={`iso-avatar ${isActive ? 'iso-avatar--active' : ''}`}>
            {agent.avatar_emoji}
          </div>

          {/* Status indicator dot */}
          <div
            className={`iso-status-dot ${isActive || isBlocked ? 'iso-status-dot--pulse' : ''}`}
            style={{ background: cfg.color }}
          />

          {/* Selected ring */}
          {selected && <div className="iso-selected-ring" style={{ borderColor: cfg.color }} />}

          {/* Active scan line */}
          {isActive && <div className="iso-scanline" />}
        </div>

        {/* Left face */}
        <div
          className="iso-face iso-face--left"
          style={{
            background: isOffline
              ? 'linear-gradient(180deg, #1a1c28 0%, #141620 100%)'
              : `linear-gradient(180deg, rgba(30,32,46,0.95) 0%, rgba(15,17,26,0.98) 100%)`,
          }}
        >
          <div className="iso-face__stripe" style={{ background: cfg.color, opacity: isOffline ? 0.15 : 0.4 }} />
        </div>

        {/* Right face */}
        <div
          className="iso-face iso-face--right"
          style={{
            background: isOffline
              ? 'linear-gradient(180deg, #161822 0%, #0f1018 100%)'
              : `linear-gradient(180deg, rgba(22,24,38,0.95) 0%, rgba(10,11,20,0.98) 100%)`,
          }}
        >
          <div className="iso-face__stripe iso-face__stripe--right" style={{ background: cfg.color, opacity: isOffline ? 0.1 : 0.25 }} />
        </div>
      </div>

      {/* ── label below tile ── */}
      <div className="iso-label">
        <span className="iso-label__name">{agent.name}</span>
        <span className="iso-label__status" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
    </div>
  )
}

// ─── Detail Sidebar ──────────────────────────────────────────────────────────

interface SidebarProps {
  agent: MissionAgent | null
  onClose: () => void
}

function AgentSidebar({ agent, onClose }: SidebarProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on overlay click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (overlayRef.current === e.target) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const cfg       = agent ? (STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle) : STATUS_CONFIG.idle
  const isHuman   = agent?.model === null
  const shortModel = agent?.model ? (MODEL_SHORT[agent.model] ?? agent.model) : null
  const isActive  = agent?.status === 'active'

  return (
    <div className={`iso-sidebar-overlay ${agent ? 'iso-sidebar-overlay--open' : ''}`} ref={overlayRef}>
      <div className={`iso-sidebar ${agent ? 'iso-sidebar--open' : ''}`}>
        {agent && (
          <>
            {/* Sidebar header */}
            <div className="iso-sidebar__header" style={{ borderBottomColor: `${cfg.color}30` }}>
              <div className="iso-sidebar__avatar">{agent.avatar_emoji}</div>
              <div className="iso-sidebar__identity">
                <div className="iso-sidebar__name">{agent.name}</div>
                <div className="iso-sidebar__role">{agent.role}</div>
              </div>
              <button className="iso-sidebar__close" onClick={onClose} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Status pill */}
            <div className="iso-sidebar__status-row">
              <span
                className={`iso-sidebar__status-pill ${isActive ? 'iso-sidebar__status-pill--pulse' : ''}`}
                style={{ color: cfg.color, background: `${cfg.color}18`, borderColor: `${cfg.color}30` }}
              >
                <span
                  className={`iso-sidebar__dot ${isActive ? 'iso-sidebar__dot--pulse' : ''}`}
                  style={{ background: cfg.color }}
                />
                {cfg.label}
              </span>
              {!isHuman && shortModel && (
                <span className="iso-sidebar__model">
                  <span style={{ marginRight: 4 }}>⚡</span>{shortModel}
                </span>
              )}
              {isHuman && (
                <span className="iso-sidebar__model iso-sidebar__model--human">
                  <span style={{ marginRight: 4 }}>🧠</span>Human
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="iso-sidebar__divider" />

            {/* Current task */}
            <div className="iso-sidebar__section">
              <div className="iso-sidebar__label">Current Task</div>
              <div className={`iso-sidebar__value ${!agent.current_task ? 'iso-sidebar__value--empty' : ''} ${isActive && agent.current_task ? 'iso-sidebar__value--active' : ''}`}>
                {isActive && agent.current_task && (
                  <span className="iso-sidebar__cursor" style={{ background: cfg.color }} />
                )}
                {agent.current_task ?? 'No active task'}
              </div>
            </div>

            {/* Last action */}
            <div className="iso-sidebar__section">
              <div className="iso-sidebar__label">Last Action</div>
              <div className={`iso-sidebar__value ${!agent.last_action ? 'iso-sidebar__value--empty' : ''}`}>
                {agent.last_action ?? 'No recent activity'}
              </div>
              {agent.last_action_at && (
                <div className="iso-sidebar__timestamp">{formatRelativeTime(agent.last_action_at)}</div>
              )}
            </div>

            {/* Last seen */}
            {agent.last_seen_at && (
              <div className="iso-sidebar__section">
                <div className="iso-sidebar__label">Last Seen</div>
                <div className="iso-sidebar__value">{formatRelativeTime(agent.last_seen_at)}</div>
              </div>
            )}

            {/* Status indicator strip at bottom */}
            <div className="iso-sidebar__footer" style={{ background: `${cfg.color}18`, borderTopColor: `${cfg.color}20` }}>
              <div className="iso-sidebar__footer-dot" style={{ background: cfg.color }} />
              <span style={{ color: cfg.color, fontSize: 11, fontWeight: 600 }}>{cfg.label}</span>
              {isActive && <span className="iso-sidebar__footer-live">● LIVE</span>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── AgentFleetV2 (main export) ──────────────────────────────────────────────

export function AgentFleetV2() {
  const [agents, setAgents]       = useState<MissionAgent[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<MissionAgent | null>(null)

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
      // Refresh selected agent data if a panel is open
      setSelected(prev => prev ? (sorted.find(a => a.id === prev.id) ?? null) : null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAgents()
    const channel = supabase
      .channel('fleet-v2-agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_agents' }, () => {
        fetchAgents()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const activeCount  = agents.filter(a => a.status === 'active').length
  const idleCount    = agents.filter(a => a.status === 'idle').length
  const blockedCount = agents.filter(a => a.status === 'blocked').length
  const offlineCount = agents.filter(a => a.status === 'offline').length

  if (loading) {
    return (
      <div className="fleet-loading">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="iso-container">
      {/* ── Header ── */}
      <div className="fleet-header">
        <div className="fleet-header__left">
          <div className="fleet-header__title">
            <span className="fleet-header__icon">⚡</span>
            Mission Control
          </div>
          <div className="fleet-header__subtitle">Daze Agent Fleet — Isometric Workspace</div>
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
          {offlineCount > 0 && (
            <div className="fleet-stat">
              <span className="fleet-stat__dot" style={{ background: '#3e4358' }} />
              <span className="fleet-stat__num">{offlineCount}</span>
              <span className="fleet-stat__label">Offline</span>
            </div>
          )}
          <div className="fleet-stat fleet-stat--total">
            <span className="fleet-stat__num">{agents.length}</span>
            <span className="fleet-stat__label">Agents</span>
          </div>
        </div>
      </div>

      {/* ── Isometric grid ── */}
      <div className="iso-scene">
        {/* Grid floor lines for atmosphere */}
        <div className="iso-floor-grid" />

        {/* Tiles */}
        <div className="iso-grid">
          {agents.map((agent, i) => (
            <IsometricTile
              key={agent.id}
              agent={agent}
              index={i}
              selected={selected?.id === agent.id}
              onClick={() => setSelected(prev => prev?.id === agent.id ? null : agent)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="iso-legend">
          <span className="iso-legend__item"><span className="iso-legend__dot" style={{ background: '#22c55e' }} /> Active</span>
          <span className="iso-legend__item"><span className="iso-legend__dot" style={{ background: '#f59e0b' }} /> Idle</span>
          <span className="iso-legend__item"><span className="iso-legend__dot" style={{ background: '#ef4444' }} /> Blocked</span>
          <span className="iso-legend__item"><span className="iso-legend__dot" style={{ background: '#3e4358' }} /> Offline</span>
        </div>
      </div>

      {/* ── Detail sidebar ── */}
      <AgentSidebar agent={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
