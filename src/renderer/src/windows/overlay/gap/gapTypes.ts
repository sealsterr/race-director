import type { TyreCompound, TyreSet } from '../../../types/lmu'

export type GapTrend = 'closing' | 'growing'

export interface GapOverlayDriver {
  readonly slotId: number
  readonly firstName: string
  readonly lastName: string
  readonly carNumber: string
  readonly teamName: string
  readonly tyreCompound: TyreCompound
  readonly tyreSet: TyreSet | null
  readonly speedKph: number
  readonly gear: string
}

export interface GapOverlayBattle {
  readonly ahead: GapOverlayDriver
  readonly behind: GapOverlayDriver
}

export interface GapOverlayCenterState {
  readonly gapSeconds: number
  readonly trend: GapTrend
}
