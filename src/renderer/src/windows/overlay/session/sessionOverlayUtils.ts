import type { SessionSettings } from '../../../store/overlayStore'
import type { FlagState, SessionInfo, SessionType } from '../../../types/lmu'
import {
  DEFAULT_DASHBOARD_SETTINGS,
  loadDashboardSettingsFromStorage,
  resolvePaletteColors
} from '../../dashboard/settings/defaults'

function getDefaultSessionProgressBarColor(): string {
  try {
    const settings = loadDashboardSettingsFromStorage(globalThis.localStorage)
    return resolvePaletteColors(settings.general).accent
  } catch {
    return resolvePaletteColors(DEFAULT_DASHBOARD_SETTINGS.general).accent
  }
}

export const SESSION_OVERLAY_DEFAULT_SETTINGS: SessionSettings = {
  customLabel: 'World Endurance Championship',
  showSessionType: true,
  showTimeRemaining: true,
  showLapCount: true,
  progressBarColor: getDefaultSessionProgressBarColor(),
  animateProgressPulse: true
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
  if (settings.showSessionType) {
    return formatSessionTypeLabel(session.sessionType).toUpperCase()
  }

  if (session.trackName.trim().length > 0) {
    return session.trackName.toUpperCase()
  }

  return 'SESSION INFO'
}

export function getSessionAccent(progressBarColor: string): {
  accent: string
  glow: string
  border: string
} {
  const accent = normalizeHexColor(progressBarColor, '#3b82f6')

  return {
    accent,
    glow: accent,
    border: accent
  }
}

export type SessionFlagBarState = 'default' | 'yellow' | 'red' | 'green' | 'chequered'

export function isFlagAlert(flagState: FlagState): boolean {
  return (
    flagState === 'YELLOW' ||
    flagState === 'FULL_COURSE_YELLOW' ||
    flagState === 'SAFETY_CAR' ||
    flagState === 'RED'
  )
}

export function getFlagAlertBarState(flagState: FlagState): SessionFlagBarState {
  if (flagState === 'RED') {
    return 'red'
  }

  if (isFlagAlert(flagState)) {
    return 'yellow'
  }

  return 'default'
}

export function getSessionFlagBarTone(flagBarState: SessionFlagBarState): {
  fill: string
  glow: string
  border: string
} {
  switch (flagBarState) {
    case 'chequered':
      return {
        fill: 'rgba(241, 245, 249, 0.92)',
        glow: 'rgba(226, 232, 240, 0.22)',
        border: 'rgba(255, 255, 255, 0.4)'
      }
    case 'yellow':
      return {
        fill: '#facc15',
        glow: 'rgba(250, 204, 21, 0.42)',
        border: 'rgba(250, 204, 21, 0.7)'
      }
    case 'red':
      return {
        fill: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.42)',
        border: 'rgba(239, 68, 68, 0.72)'
      }
    case 'green':
      return {
        fill: '#22c55e',
        glow: 'rgba(34, 197, 94, 0.4)',
        border: 'rgba(34, 197, 94, 0.68)'
      }
    default:
      return {
        fill: 'rgba(255, 255, 255, 0.08)',
        glow: 'rgba(148, 163, 184, 0.12)',
        border: 'rgba(255, 255, 255, 0.12)'
      }
  }
}

export function getLapLabel(session: SessionInfo, showLapCount: boolean): string {
  if (!showLapCount || session.totalLaps <= 0) {
    return 'SESSION ACTIVE'
  }

  return `LAP ${session.currentLap}/${session.totalLaps}`
}

export function getSessionProgress(
  session: SessionInfo,
  displayRemaining: number,
  totalSessionTime: number
): number {
  if (totalSessionTime > 0) {
    return clamp01(displayRemaining / totalSessionTime)
  }

  if (session.totalLaps > 0) {
    return clamp01(1 - session.currentLap / session.totalLaps)
  }

  return 0
}

export function withAlpha(color: string, alpha: string): string {
  return /^#[\da-f]{6}$/i.test(color) ? `${color}${alpha}` : color
}

function normalizeHexColor(color: string, fallback: string): string {
  if (/^#[\da-f]{6}$/i.test(color)) {
    return color
  }

  if (/^#[\da-f]{3}$/i.test(color)) {
    return `#${color
      .slice(1)
      .split('')
      .map((char) => `${char}${char}`)
      .join('')}`
  }

  return fallback
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}
