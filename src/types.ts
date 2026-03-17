export interface MissionTask {
  id: string
  title: string
  description: string | null
  channel: string
  status: string
  priority: number
  tags: string[]
  assigned_agent: string | null
  created_at: string
  updated_at: string
}

export interface MissionAgent {
  id: string
  name: string
  avatar_emoji: string
  role: string
  model: string | null
  status: string
  sort_order: number
  current_task: string | null
  last_action: string | null
  last_action_at: string | null
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export const CHANNELS = [
  'engineering',
  'gtm',
  'security',
  'customer-support',
  'design',
  'operations',
  'pos-integrations',
] as const

export type Channel = (typeof CHANNELS)[number]

export const CHANNEL_LABELS: Record<string, string> = {
  engineering: 'Engineering',
  gtm: 'Go-to-Market',
  security: 'Security',
  'customer-support': 'Customer Support',
  design: 'Design',
  operations: 'Operations',
  'pos-integrations': 'POS Integrations',
}

export const CHANNEL_ICONS: Record<string, string> = {
  engineering: '🛠',
  gtm: '🚀',
  security: '🔒',
  'customer-support': '💬',
  design: '🎨',
  operations: '⚙️',
  'pos-integrations': '🔗',
}

export const STATUS_COLORS: Record<string, string> = {
  todo: '#6366f1',
  'in-progress': '#f59e0b',
  done: '#22c55e',
  blocked: '#ef4444',
}
