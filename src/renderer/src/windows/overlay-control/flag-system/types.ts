export type FlagType = 'GREEN' | 'YELLOW' | 'CHEQUERED' | 'RED' | 'FCY' | 'SC' | 'SC_THIS_LAP'

export type FlagSource = 'manual' | 'race-control' | 'game' | 'system'

export type SyncState = 'idle' | 'detected-only' | 'manual-override' | 'synced' | 'conflict'

export type ActivityFilter = 'all' | 'flags' | 'warnings' | 'alerts'

export interface ActiveFlagState {
  type: FlagType
  source: FlagSource
  lap: number
  timestamp: string
  note: string
}

export interface FlagHistoryItem {
  id: string
  kind: 'manual-change' | 'detection' | 'clear' | 'warning'
  source: FlagSource
  title: string
  detail: string
  timestamp: string
  lap: number
  flagType: FlagType | null
  driverName?: string
  carName?: string
  carNumber?: string
  sector?: string
  corner?: string
}

export interface SpeedAlert {
  id: string
  driverName: string
  carName: string
  carNumber: string
  speedKph: number
  zoneLimitKph: number
  location: string
  sector: string
  corner: string
  timestamp: string
  lap: number
  status: 'new' | 'acknowledged'
}

export interface PreviewSettings {
  opacity: number
  pulse: boolean
  showTimer: boolean
  compactMeta: boolean
}

export const FLAG_OPTIONS = [
  { value: 'YELLOW', label: 'Yellow' },
  { value: 'GREEN', label: 'Green' },
  { value: 'CHEQUERED', label: 'Chequered' },
  { value: 'RED', label: 'Red' },
  { value: 'FCY', label: 'FCY' },
  { value: 'SC', label: 'SC' },
  { value: 'SC_THIS_LAP', label: 'SC ending' }
] as const

export const FLAG_LABELS: Record<FlagType, string> = {
  GREEN: 'Green Flag',
  YELLOW: 'Yellow Flag',
  CHEQUERED: 'Chequered Flag',
  RED: 'Red Flag',
  FCY: 'Full Course Yellow',
  SC: 'SC',
  SC_THIS_LAP: 'SC ending'
}

export const SOURCE_LABELS: Record<FlagSource, string> = {
  manual: 'Manual',
  'race-control': 'External RC',
  game: 'Game Detected',
  system: 'System Alert'
}

export const FLAG_TONES: Record<
  FlagType,
  {
    fill: string
    glow: string
    borderClass: string
    textClass: string
    badgeClass: string
  }
> = {
  GREEN: {
    fill: '#16a34a',
    glow: 'rgba(22,163,74,0.35)',
    borderClass: 'border-rd-success/40',
    textClass: 'text-rd-success',
    badgeClass: 'bg-rd-success/15 text-rd-success'
  },
  YELLOW: {
    fill: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    borderClass: 'border-rd-gold/40',
    textClass: 'text-rd-gold',
    badgeClass: 'bg-rd-gold/15 text-rd-gold'
  },
  CHEQUERED: {
    fill: '#e2e8f0',
    glow: 'rgba(226,232,240,0.28)',
    borderClass: 'border-rd-border',
    textClass: 'text-rd-text',
    badgeClass: 'bg-rd-elevated text-rd-text'
  },
  RED: {
    fill: '#dc2626',
    glow: 'rgba(220,38,38,0.38)',
    borderClass: 'border-rd-error/40',
    textClass: 'text-rd-error',
    badgeClass: 'bg-rd-error/15 text-rd-error'
  },
  FCY: {
    fill: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    borderClass: 'border-rd-gold/40',
    textClass: 'text-rd-gold',
    badgeClass: 'bg-rd-gold/15 text-rd-gold'
  },
  SC: {
    fill: '#60a5fa',
    glow: 'rgba(96,165,250,0.3)',
    borderClass: 'border-sky-400/35',
    textClass: 'text-sky-300',
    badgeClass: 'bg-sky-400/15 text-sky-300'
  },
  SC_THIS_LAP: {
    fill: '#38bdf8',
    glow: 'rgba(56,189,248,0.3)',
    borderClass: 'border-cyan-400/35',
    textClass: 'text-cyan-300',
    badgeClass: 'bg-cyan-400/15 text-cyan-300'
  }
}
