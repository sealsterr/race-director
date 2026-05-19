import type { FlagState, SessionInfo } from './types'

export const RACE_CONTROL_FLAG_TYPES = [
  'GREEN',
  'YELLOW',
  'CHEQUERED',
  'RED',
  'FCY',
  'SC',
  'SC_THIS_LAP'
] as const

export type RaceControlFlagType = (typeof RACE_CONTROL_FLAG_TYPES)[number]

export interface RaceControlManualFlag {
  type: RaceControlFlagType
  source: 'race-control'
  lap: number
  timestamp: string
  sessionElapsedSeconds: number
  note: string
}

export interface RaceControlState {
  manualFlag: RaceControlManualFlag | null
  updatedAt: number | null
}

export const DEFAULT_RACE_CONTROL_STATE: RaceControlState = {
  manualFlag: null,
  updatedAt: null
}

export function isRaceControlFlagType(value: string): value is RaceControlFlagType {
  return RACE_CONTROL_FLAG_TYPES.some((flagType) => flagType === value)
}

export function mapRaceControlFlagToSessionFlagState(type: RaceControlFlagType): FlagState {
  switch (type) {
    case 'GREEN':
      return 'GREEN'
    case 'YELLOW':
      return 'YELLOW'
    case 'CHEQUERED':
      return 'CHEQUERED'
    case 'RED':
      return 'RED'
    case 'FCY':
      return 'FULL_COURSE_YELLOW'
    case 'SC':
    case 'SC_THIS_LAP':
      return 'SAFETY_CAR'
  }
}

export function mapRaceControlFlagToSectorFlags(
  type: RaceControlFlagType
): [FlagState, FlagState, FlagState] {
  switch (type) {
    case 'GREEN':
      return ['GREEN', 'GREEN', 'GREEN']
    case 'YELLOW':
      return ['YELLOW', 'NONE', 'NONE']
    case 'CHEQUERED':
      return ['CHEQUERED', 'CHEQUERED', 'CHEQUERED']
    case 'RED':
      return ['RED', 'RED', 'RED']
    case 'FCY':
      return ['FULL_COURSE_YELLOW', 'FULL_COURSE_YELLOW', 'FULL_COURSE_YELLOW']
    case 'SC':
    case 'SC_THIS_LAP':
      return ['SAFETY_CAR', 'SAFETY_CAR', 'SAFETY_CAR']
  }
}

export function applyRaceControlManualFlagToSession(
  session: SessionInfo,
  manualFlag: RaceControlManualFlag | null
): SessionInfo {
  if (!manualFlag) {
    return session
  }

  return {
    ...session,
    flagState: mapRaceControlFlagToSessionFlagState(manualFlag.type),
    sectorFlags: mapRaceControlFlagToSectorFlags(manualFlag.type)
  }
}
