import type { CarClass } from './types'

export type OverlayId = 'OVERLAY-TOWER' | 'OVERLAY-DRIVER' | 'OVERLAY-GAP' | 'OVERLAY-SESSION'

export type TowerRaceMode = 'GAP_AHEAD' | 'GAP_LEADER' | 'PITS' | 'FUEL' | 'TYRES' | 'POSITIONS'

export type TowerQualiMode = 'QUALI_GAP' | 'QUALI_TIMES'

export type TowerViewLayout = 'CLASS_ONLY' | 'MIXED_TOP' | 'EVERYONE_TOP' | 'PER_CLASS'

export interface TowerSettings {
  viewLayout: TowerViewLayout
  specificClass: CarClass | null
  raceMode: TowerRaceMode
  qualiMode: TowerQualiMode
  maxRowsPerClass: number
  standingsRefreshMs: number
  fightEnabled: boolean
  fightOnlyInIntervalMode: boolean
  fightThresholdSeconds: number
  fightHoldSeconds: number
  fightDisabledLaps: number
  fightRequireSameLap: boolean
  fightIgnorePitAndFinished: boolean
  showCarNumber: boolean
  showClassBar: boolean
  animationSpeed: 'slow' | 'normal' | 'fast'
  colorHypercar: string
  colorLMP2: string
  colorLMP3: string
  colorLMGT3: string
  colorGTE: string
  colorHard: string
  colorMedium: string
  colorSoft: string
  colorWet: string
  colorPitBadge: string
  colorFinishBadge: string
}

export interface DriverSettings {
  showPart1: boolean
  showPart2: boolean
  showPart3: boolean
  colorSessionBest: string
  colorPersonalBest: string
  colorCompleted: string
  colorPending: string
}

export interface GapSettings {
  triggerThresholdSeconds: number
  showCarClass: boolean
}

export interface SessionSettings {
  customLabel: string
  showSessionType: boolean
  showTimeRemaining: boolean
  showLapCount: boolean
  progressBarColor: string
  animateProgressPulse: boolean
}

export type OverlaySpecificSettings = TowerSettings | DriverSettings | GapSettings | SessionSettings

export interface OverlayConfig<
  T extends OverlaySpecificSettings = OverlaySpecificSettings,
  Id extends OverlayId = OverlayId
> {
  id: Id
  enabled: boolean
  opacity: number
  scale: number
  x: number
  y: number
  displayId: number
  dragMode: boolean
  settings: T
}

export type TowerOverlayConfig = OverlayConfig<TowerSettings, 'OVERLAY-TOWER'>
export type DriverOverlayConfig = OverlayConfig<DriverSettings, 'OVERLAY-DRIVER'>
export type GapOverlayConfig = OverlayConfig<GapSettings, 'OVERLAY-GAP'>
export type SessionOverlayConfig = OverlayConfig<SessionSettings, 'OVERLAY-SESSION'>

export type OverlayConfigUnion =
  | TowerOverlayConfig
  | DriverOverlayConfig
  | GapOverlayConfig
  | SessionOverlayConfig

export type OverlayConfigForId<Id extends OverlayId> = Extract<OverlayConfigUnion, { id: Id }>

export interface OverlayBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface DisplayInfo {
  id: number
  label: string
  bounds: OverlayBounds
  isPrimary: boolean
}

export interface OverlayPresetFile {
  version: 1
  savedAt: string
  savePath: string
  overlays: OverlayConfigUnion[]
}

export interface OverlayPresetSaveResult {
  ok: boolean
  error?: string
}

export interface OverlayPresetLoadResult {
  ok: boolean
  data?: OverlayPresetFile
  error?: string
}

export interface OverlayPathPickResult {
  ok: boolean
  path?: string
}

export interface OverlayBoundsChangedPayload {
  id: OverlayId
  x: number
  y: number
  displayId: number
}
