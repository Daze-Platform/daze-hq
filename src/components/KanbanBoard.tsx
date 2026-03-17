import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { TaskCard } from './TaskCard'
import { CreateTaskModal } from './CreateTaskModal'
import { AgentFleet } from './AgentFleet'
import { CHANNELS, CHANNEL_LABELS, CHANNEL_ICONS } from '../types'
import type { MissionTask, MissionAgent } from '../types'

type View = 'board' | 'fleet'

export function KanbanBoard() {
  const { user, signOut } = useAuth()
  const [tasks, setTasks] = useState<MissionTask[]>([])
  const [agents, setAgents] = useState<MissionAgent[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [createChannel, setCreateChannel] = useState<string | undefined>()
  const [view, setView] = useState<View>('board')

  const fetchData = async () => {
    const [tasksRes, agentsRes] = await Promise.all([
      supabase.from('mission_tasks').select('*').order('priority', { ascending: true }),
      supabase.from('mission_agents').select('*').order('sort_order', { ascending: true }),
    ])
    if (tasksRes.data) setTasks(tasksRes.data)
    if (agentsRes.data) setAgents(agentsRes.data)
  }

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('mission-tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_tasks' }, () => {
        fetchData()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const tasksByChannel = (ch: string) => tasks.filter((t) => t.channel === ch)

  const handleAddTask = (channel: string) => {
    setCreateChannel(channel)
    setShowCreate(true)
  }

  const activeAgents = agents.filter((a) => a.status === 'active')

  return (
    <div className="hq-container">
      <header className="hq-header">
        <div className="header-left">
          <img src="/daze-logo.png?v=2" alt="Daze" className="header-logo" />
          <h1>Daze HQ</h1>
          <span className="header-badge">Mission Control</span>
        </div>

        {/* View tabs */}
        <nav className="header-nav">
          <button
            className={`header-nav__tab ${view === 'board' ? 'header-nav__tab--active' : ''}`}
            onClick={() => setView('board')}
          >
            <span className="header-nav__icon">📋</span>
            Board
          </button>
          <button
            className={`header-nav__tab ${view === 'fleet' ? 'header-nav__tab--active' : ''}`}
            onClick={() => setView('fleet')}
          >
            <span className="header-nav__icon">⚡</span>
            Fleet
            {activeAgents.length > 0 && (
              <span className="header-nav__badge">{activeAgents.length}</span>
            )}
          </button>
        </nav>

        <div className="header-right">
          <div className="header-agents">
            {activeAgents.map((a) => (
              <span key={a.id} className="agent-chip" title={`${a.name} — ${a.role}`}>
                {a.avatar_emoji}
              </span>
            ))}
          </div>
          <span className="header-user">{user?.email}</span>
          <button className="header-signout" onClick={signOut}>Sign Out</button>
        </div>
      </header>

      {view === 'board' ? (
        <>
          <div className="kanban-scroll">
            <div className="kanban-columns">
              {CHANNELS.map((ch) => {
                const channelTasks = tasksByChannel(ch)
                return (
                  <div key={ch} className="kanban-column">
                    <div className="column-header">
                      <span className="column-icon">{CHANNEL_ICONS[ch]}</span>
                      <span className="column-title">{CHANNEL_LABELS[ch]}</span>
                      <span className="column-count">{channelTasks.length}</span>
                      <button className="column-add" onClick={() => handleAddTask(ch)} title="Add task">+</button>
                    </div>
                    <div className="column-body">
                      {channelTasks.map((task) => (
                        <TaskCard key={task.id} task={task} agents={agents} />
                      ))}
                      {channelTasks.length === 0 && (
                        <div className="column-empty">No tasks</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {showCreate && (
            <CreateTaskModal
              agents={agents}
              defaultChannel={createChannel}
              onClose={() => setShowCreate(false)}
              onCreated={fetchData}
            />
          )}
        </>
      ) : (
        <AgentFleet />
      )}
    </div>
  )
}
