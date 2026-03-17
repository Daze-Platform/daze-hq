export interface MissionTask {
  id: string
  title: string
  description: string | null
  status: string | null
  channel: string
  priority: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface MissionAgent {
  id: string
  name: string
  role: string | null
  status: string | null
  avatar_url: string | null
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

export const PRIORITIES = ['urgent', 'high', 'medium', 'low'] as const
export type Priority = (typeof PRIORITIES)[number]

export const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
}

export interface AgentFleet {
  id: string
  name: string
  role: string
  emoji: string
  status: 'active' | 'idle' | 'blocked' | 'coming_soon'
  current_task: string | null
  last_action: string | null
  last_updated: string
  is_coming_soon: boolean
  color: string | null
}

export const CHANNEL_LABELS: Record<string, string> = {
  engineering: 'Engineering',
  gtm: 'Go-to-Market',
  security: 'Security',
  'customer-support': 'Customer Support',
  design: 'Design',
  operations: 'Operations',
  'pos-integrations': 'POS Integrations',
}
