import { Draggable } from '@hello-pangea/dnd'
import { PRIORITY_COLORS, type MissionTask } from '../types'

interface TaskCardProps {
  task: MissionTask
  index: number
  onClick: () => void
}

export default function TaskCard({ task, index, onClick }: TaskCardProps) {
  const priorityClass = PRIORITY_COLORS[task.priority ?? 'medium'] ?? PRIORITY_COLORS.medium

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`rounded-lg border p-3 cursor-pointer transition-all hover:border-blue-500/40 ${
            snapshot.isDragging ? 'shadow-xl shadow-blue-500/10 rotate-2' : ''
          }`}
          style={{
            background: snapshot.isDragging ? '#22223a' : '#141425',
            borderColor: snapshot.isDragging ? '#3b82f6' : '#2a2a3e',
            ...provided.draggableProps.style,
          }}
        >
          <h4 className="text-sm font-medium text-white mb-1.5 leading-tight">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-slate-400 mb-2 line-clamp-2 leading-relaxed">{task.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {task.priority && (
              <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${priorityClass}`}>
                {task.priority}
              </span>
            )}
            {task.assigned_to && (
              <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                {task.assigned_to}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
