import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { supabase } from '../lib/supabase'
import { CHANNELS, type MissionTask } from '../types'
import KanbanColumn from './KanbanColumn'
import TaskModal from './TaskModal'
import { Loader2 } from 'lucide-react'

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<MissionTask[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<MissionTask | null>(null)
  const [activeChannel, setActiveChannel] = useState('')

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from('mission_tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()

    const channel = supabase
      .channel('mission_tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newChannel = destination.droppableId

    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, channel: newChannel } : t))
    )

    await supabase
      .from('mission_tasks')
      .update({ channel: newChannel, updated_at: new Date().toISOString() })
      .eq('id', draggableId)
  }

  const openAddModal = (channel: string) => {
    setEditingTask(null)
    setActiveChannel(channel)
    setModalOpen(true)
  }

  const openEditModal = (task: MissionTask) => {
    setEditingTask(task)
    setActiveChannel(task.channel)
    setModalOpen(true)
  }

  const tasksByChannel = (channel: string) => tasks.filter((t) => t.channel === channel)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 min-w-max">
            {CHANNELS.map((channel) => (
              <KanbanColumn
                key={channel}
                channel={channel}
                tasks={tasksByChannel(channel)}
                onAddTask={() => openAddModal(channel)}
                onEditTask={openEditModal}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          channel={activeChannel}
          onClose={() => setModalOpen(false)}
          onSaved={fetchTasks}
        />
      )}
    </>
  )
}
