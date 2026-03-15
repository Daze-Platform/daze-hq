import { Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'
import { CHANNEL_LABELS, type MissionTask } from '../types'

interface KanbanColumnProps {
  channel: string
  tasks: MissionTask[]
  onAddTask: () => void
  onEditTask: (task: MissionTask) => void
}

export default function KanbanColumn({ channel, tasks, onAddTask, onEditTask }: KanbanColumnProps) {
  return (
    <div
      className="flex-shrink-0 w-72 rounded-xl border flex flex-col max-h-[calc(100vh-80px)]"
      style={{ background: '#12121f', borderColor: '#1e1e30' }}
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: '#1e1e30' }}>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-200">{CHANNEL_LABELS[channel] ?? channel}</h3>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="text-slate-500 hover:text-blue-400 transition-colors p-1 rounded hover:bg-white/5"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <Droppable droppableId={channel}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-2 space-y-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-500/5' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onClick={() => onEditTask(task)} />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-8 text-slate-600 text-xs">No tasks</div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
