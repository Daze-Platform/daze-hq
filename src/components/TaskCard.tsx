import type { MissionTask, MissionAgent } from '../types'
import { STATUS_COLORS } from '../types'

interface TaskCardProps {
  task: MissionTask
  agents: MissionAgent[]
}

export function TaskCard({ task, agents }: TaskCardProps) {
  const agent = agents.find((a) => a.id === task.assigned_agent)
  const statusColor = STATUS_COLORS[task.status] ?? '#6b7280'

  return (
    <div className="task-card">
      <div className="task-header">
        <span className="task-status" style={{ backgroundColor: statusColor }}>
          {task.status}
        </span>
        {task.priority <= 2 && <span className="task-priority">P{task.priority}</span>}
      </div>

      <h3 className="task-title">{task.title}</h3>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-footer">
        {agent && (
          <span className="task-agent">
            {agent.avatar_emoji} {agent.name}
          </span>
        )}
        {task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map((tag) => (
              <span key={tag} className="task-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
