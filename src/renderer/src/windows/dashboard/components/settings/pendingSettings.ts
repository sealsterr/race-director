export type PendingSettingId =
  | 'overlay.animateOverlayHighlights'
  | 'overlay.flashFightRows'
  | 'advanced.compactTelemetryRows'
  | 'advanced.verboseLogs'

interface PendingSettingCopy {
  badgeLabel: string
  description: string
}

const COMING_SOON_BADGE = 'Coming soon'

const PENDING_SETTINGS: Record<PendingSettingId, PendingSettingCopy> = {
  'overlay.animateOverlayHighlights': {
    badgeLabel: COMING_SOON_BADGE,
    description: 'Animate overlay highlight pulses and focus transitions.'
  },
  'overlay.flashFightRows': {
    badgeLabel: COMING_SOON_BADGE,
    description: 'Flash close-battle rows.'
  },
  'advanced.compactTelemetryRows': {
    badgeLabel: COMING_SOON_BADGE,
    description: 'Reduce telemetry row height to fit more data.'
  },
  'advanced.verboseLogs': {
    badgeLabel: COMING_SOON_BADGE,
    description: 'Include additional diagnostic events and status messages in the activity log.'
  }
}

export const getPendingSettingCopy = (id: PendingSettingId): PendingSettingCopy =>
  PENDING_SETTINGS[id]
