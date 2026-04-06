import type { SessionSettings } from '../../../store/overlayStore'
import type { SessionInfo, SessionType } from '../../../types/lmu'

export const SESSION_OVERLAY_DEFAULT_SETTINGS: SessionSettings = {
  showTrackName: true,
  showSessionType: true,
  showTimeRemaining: true,
  showLapCount: true,
  showFlagState: true,
  colorScheme: 'default'
}

export function formatSessionTypeLabel(sessionType: SessionType): string {
  switch (sessionType) {
    case 'PRACTICE':
      return 'Practice'
    case 'QUALIFYING':
      return 'Qualifying'
    case 'RACE':
      return 'Race'
    default:
      return 'Session'
  }
}

export function formatRemainingTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const remainder = safeSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export function getSessionHeadline(session: SessionInfo, settings: SessionSettings): string {
  const parts: string[] = []

  if (settings.showSessionType) {
    parts.push(formatSessionTypeLabel(session.sessionType).toUpperCase())
  }

  if (settings.showTrackName && session.trackName.trim().length > 0) {
    parts.push(session.trackName.toUpperCase())
  }

  if (parts.length > 0) {
    return parts.join(' - ')
  }

  return 'SESSION INFO'
}

export function getSessionAccent(colorScheme: SessionSettings['colorScheme']): {
  accent: string
  glow: string
  muted: string
  border: string
} {
  if (colorScheme === 'minimal') {
    return {
      accent: '#77f5a7',
      glow: '#c4ffd8',
      muted: '#102319',
      border: '#55d47e'
    }
  }

  if (colorScheme === 'bold') {
    return {
      accent: '#17ff6d',
      glow: '#7dffaf',
      muted: '#0b2013',
      border: '#26e06d'
    }
  }

  return {
    accent: '#1df274',
    glow: '#baffd1',
    muted: '#0d1f14',
    border: '#25c966'
  }
}

export function getLapLabel(session: SessionInfo, showLapCount: boolean): string {
  if (!showLapCount || session.totalLaps <= 0) {
    return 'SESSION ACTIVE'
  }

  return `LAP ${session.currentLap}/${session.totalLaps}`
}

export function getSessionProgress(session: SessionInfo, displayRemaining: number): number {
  const estimatedTotal = session.sessionTime + Math.max(0, session.timeRemaining)
  if (estimatedTotal > 0) {
    return clamp01(displayRemaining / estimatedTotal)
  }

  if (session.totalLaps > 0) {
    return clamp01(1 - session.currentLap / session.totalLaps)
  }

  return 0
}

export function withAlpha(color: string, alpha: string): string {
  return /^#[\da-f]{6}$/i.test(color) ? `${color}${alpha}` : color
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}
