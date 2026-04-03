import type { GapOverlayBattle, GapOverlayCenterState } from './gapTypes'

export const GAP_PREVIEW_BATTLE: GapOverlayBattle = {
  ahead: {
    slotId: 51,
    firstName: 'Antonio',
    lastName: 'GIOVINAZZI',
    carNumber: '51',
    teamName: 'Ferrari AF Corse',
    tyreCompound: 'SOFT',
    tyreSet: null,
    speedKph: 320,
    gear: '8'
  },
  behind: {
    slotId: 6,
    firstName: 'Kevin',
    lastName: 'ESTRE',
    carNumber: '6',
    teamName: 'Porsche Penske',
    tyreCompound: 'UNKNOWN',
    tyreSet: {
      frontLeft: 'MEDIUM',
      frontRight: 'MEDIUM',
      rearLeft: 'SOFT',
      rearRight: 'SOFT'
    },
    speedKph: 304,
    gear: '7'
  }
}

export const GAP_PREVIEW_CENTER_SEQUENCE: readonly GapOverlayCenterState[] = [
  { gapSeconds: 0.9, trend: 'growing' },
  { gapSeconds: 0.2, trend: 'closing' }
]
