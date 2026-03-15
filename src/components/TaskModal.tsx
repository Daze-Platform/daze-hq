import { useState, useEffect, type FormEvent } from 'react'
import { X, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { PRIORITIES, CHANNELS, CHANNEL_LABELS, type MissionTask } from '../types'

interface TaskModalProps {
  task: MissionTask | null
  channel: string
  onClose: () => void
  onSaved: () => void
}

export default function TaskModal({ task, channel, onClose, onSaved }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [assignedTo, setAssignedTo] = useState('')
  const [taskChannel, setTaskChannel] = useState(channel)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setPriority(task.priority ?? 'medium')
      setAssignedTo(task.assigned_to ?? '')
      setTaskChannel(task.channel)
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setAssignedTo('')
      setTaskChannel(channel)
    }
  }, [task, channel])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      assigned_to: assignedTo.trim() || null,
      channel: taskChannel,
      updated_at: new Date().toISOString(),
    }

    if (task) {
      await supabase.from('mission_tasks').update(payload).eq('id', task.id)
    } else {
      await supabase.from('mission_tasks').insert({ ...payload, status: 'active', created_at: new Date().toISOString() })
    }

    setSaving(false)
    onSaved()
    onClose()
  }

  const handleDelete = async () => {
    if (!task) return
    setDeleting(true)
    await supabase.from('mission_tasks').delete().eq('id', task.id)
    setDeleting(false)
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg rounded-xl border p-6 shadow-2xl"
        style={{ background: '#1a1a2e', borderColor: '#2a2a3e' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{task ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{ background: '#0f0f1a', borderColor: '#2a2a3e' }}
              placeholder="Task title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              style={{ background: '#0f0f1a', borderColor: '#2a2a3e' }}
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                style={{ background: '#0f0f1a', borderColor: '#2a2a3e' }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Assigned To</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                style={{ background: '#0f0f1a', borderColor: '#2a2a3e' }}
                placeholder="Name..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Channel</label>
            <select
              value={taskChannel}
              onChange={(e) => setTaskChannel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{ background: '#0f0f1a', borderColor: '#2a2a3e' }}
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {task ? 'Update' : 'Create'}
            </button>
            {task && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="py-2 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm border border-red-500/20"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
