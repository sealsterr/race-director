export type SessionType = 'PRACTICE' | 'QUALIFYING' | 'RACE' | 'UNKNOWN'

export type FlagState =
  | 'GREEN'
  | 'YELLOW'
  | 'FULL_COURSE_YELLOW'
  | 'SAFETY_CAR'
  | 'RED'
  | 'CHEQUERED'
  | 'NONE'

export interface SessionInfo {
  sessionType: SessionType
  trackName: string
  currentLap: number
  totalLaps: number
  timeRemaining: number
  totalSessionTime: number
  sessionTime: number
  flagState: FlagState
  numCars: number
  numCarsOnTrack: number
  isActive: boolean
}

export type CarClass = 'LMGT3' | 'GTE' | 'LMP2' | 'LMP3' | 'HYPERCAR' | 'UNKNOWN'

export type TyreCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'WET' | 'UNKNOWN'

export interface TyreSet {
  frontLeft: TyreCompound
  frontRight: TyreCompound
  rearLeft: TyreCompound
  rearRight: TyreCompound
}

export type DriverStatus =
  | 'RACING'
  | 'PITTING'
  | 'RETIRED'
  | 'FINISHED'
  | 'DISQUALIFIED'
  | 'CONTACT'
  | 'CRASHED'
  | 'FIGHTING'
  | 'UNKNOWN'

export interface SectorTime {
  sector1: number | null
  sector2: number | null
  sector3: number | null
}

export interface DriverStanding {
  position: number
  carNumber: string
  driverName: string
  nationalityCode: string | null
  teamName: string
  carClass: CarClass
  carName: string
  lastLapTime: number | null
  bestLapTime: number | null
  currentSectors: SectorTime
  bestSectors: SectorTime
  gapToLeader: number | null
  intervalToAhead: number | null
  lapsCompleted: number
  lapsDown: number
  fuel: number | null
  tyreCompound: TyreCompound
  tyreSet: TyreSet | null
  pitStopCount: number
  penalties: Penalty[]
  status: DriverStatus
  isPlayer: boolean
  isFocused: boolean
  slotId: number
  telemetryId: number | null
}

export interface DriverTelemetrySnapshot {
  id: number
  driverName: string
  vehicleName: string
  carNumber: string
  fuelPercentage: number | null
  batteryChargePercentage: number | null
  engineMap: number | null
  gear: number | null
  speedKph: number | null
  rpm: number | null
  throttle: number | null
  brake: number | null
  frontTyreCompound: string
  rearTyreCompound: string
}

export interface TelemetrySnapshot {
  timestamp: number
  cars: DriverTelemetrySnapshot[]
  error: string | null
}

export type PenaltyType = 'DRIVE_THROUGH' | 'STOP_AND_GO' | 'TIME_PENALTY' | 'DISQUALIFICATION'

export interface Penalty {
  type: PenaltyType
  time: number
  reason: string
}

export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR'

export interface AppState {
  connection: ConnectionStatus
  session: SessionInfo | null
  standings: DriverStanding[]
  lastUpdated: number | null
}
