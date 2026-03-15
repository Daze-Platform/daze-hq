import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { CHANNELS, CHANNEL_LABELS, type MissionAgent } from '../types'

interface CreateTaskModalProps {
  agents: MissionAgent[]
  defaultChannel?: string
  onClose: () => void
  onCreated: () => void
}

export function CreateTaskModal({ agents, defaultChannel, onClose, onCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [channel, setChannel] = useState(defaultChannel ?? 'engineering')
  const [status, setStatus] = useState('todo')
  const [priority, setPriority] = useState(3)
  const [assignedAgent, setAssignedAgent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)

    const { error } = await supabase.from('mission_tasks').insert({
      title,
      description: description || null,
      channel,
      status,
      priority,
      tags,
      assigned_agent: assignedAgent || null,
    })

    if (!error) {
      onCreated()
      onClose()
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Task</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>{CHANNEL_LABELS[ch]}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority (1=highest)</label>
              <input type="number" min={1} max={5} value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>Assign To</label>
              <select value={assignedAgent} onChange={(e) => setAssignedAgent(e.target.value)}>
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.avatar_emoji} {a.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="infra, urgent, pilot" />
          </div>

          <button type="submit" className="login-btn" disabled={saving}>
            {saving ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  )
}
