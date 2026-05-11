import type {
  ConnectionStatus,
  DriverStanding,
  DriverTelemetrySnapshot,
  FlagState,
  Penalty,
  SessionInfo,
  SessionType,
  TelemetrySnapshot
} from '../../../types/lmu'
import type { ActiveFlagState, FlagHistoryItem, FlagType, SpeedAlert } from './types'
import { formatSessionElapsed } from './flagTimeUtils'

export type ActivityHistoryEntry = Omit<FlagHistoryItem, 'id'>

const PIT_SPEED_LIMIT_KPH = 60

const SESSION_LABELS: Record<SessionType, string> = {
  PRACTICE: 'Practice',
  QUALIFYING: 'Qualifying',
  RACE: 'Race',
  UNKNOWN: 'Unknown'
}

const CLASS_LABELS: Record<DriverStanding['carClass'], string> = {
  HYPERCAR: 'Hypercar',
  LMP2: 'LMP2',
  LMP3: 'LMP3',
  LMGT3: 'LMGT3',
  GTE: 'GTE',
  UNKNOWN: 'Class'
}

export const getDriverKey = (driver: DriverStanding): string =>
  driver.telemetryId !== null ? `telemetry:${driver.telemetryId}` : `slot:${driver.slotId}`

export const getActivityContext = (
  session: SessionInfo | null
): {
  timestamp: string
  sessionElapsedSeconds: number
  lap: number
} => {
  const sessionElapsedSeconds = session?.sessionTime ?? 0
  return {
    timestamp: formatSessionElapsed(sessionElapsedSeconds),
    sessionElapsedSeconds,
    lap: session?.currentLap ?? 0
  }
}

export const mapFlagStateToFlagType = (flagState: FlagState): FlagType | null => {
  if (flagState === 'FULL_COURSE_YELLOW') return 'FCY'
  if (flagState === 'SAFETY_CAR') return 'SC'
  if (flagState === 'NONE') return null
  return flagState
}

export const createDetectedFlagState = (session: SessionInfo | null): ActiveFlagState | null => {
  if (!session) return null
  const flagType = mapFlagStateToFlagType(session.flagState)
  if (!flagType) return null
  const context = getActivityContext(session)
  return {
    type: flagType,
    source: 'game',
    lap: context.lap,
    timestamp: context.timestamp,
    sessionElapsedSeconds: context.sessionElapsedSeconds,
    note: `${getFlagLabel(flagType)} is active in LMU.`
  }
}

export const createConnectionActivity = (
  previous: ConnectionStatus,
  current: ConnectionStatus,
  session: SessionInfo | null
): ActivityHistoryEntry | null => {
  if (previous !== 'CONNECTED' || (current !== 'DISCONNECTED' && current !== 'ERROR')) return null
  return {
    ...getActivityContext(session),
    kind: 'warning',
    source: 'system',
    title: 'Connection lost',
    detail: 'Race data is paused until LMU reconnects.',
    flagType: null
  }
}

export const createSessionActivity = (
  previous: SessionInfo | null,
  current: SessionInfo | null
): ActivityHistoryEntry | null => {
  if (!previous || !current || previous.sessionType === current.sessionType) return null
  if (previous.sessionType === 'UNKNOWN' || current.sessionType === 'UNKNOWN') return null
  return {
    ...getActivityContext(current),
    kind: 'warning',
    source: 'system',
    title: 'Session updated',
    detail: `Session switched from ${SESSION_LABELS[previous.sessionType]} to ${SESSION_LABELS[current.sessionType]}.`,
    flagType: null
  }
}

export const createFlagActivity = (
  previous: SessionInfo | null,
  current: SessionInfo | null,
  standings: DriverStanding[]
): ActivityHistoryEntry | null => {
  if (!current) return null
  const previousFlag = previous ? mapFlagStateToFlagType(previous.flagState) : null
  const currentFlag = mapFlagStateToFlagType(current.flagState)
  if (!currentFlag || currentFlag === previousFlag) return null
  if (currentFlag === 'FCY' || currentFlag === 'YELLOW') return null

  const context = getActivityContext(current)
  if (currentFlag === 'CHEQUERED') {
    return {
      ...context,
      kind: 'detection',
      source: 'game',
      title: 'Chequered flag',
      detail: `${getLeaderClassLabel(standings)} leader crossed the finish line.`,
      flagType: currentFlag,
      sector: 'Track',
      corner: 'Start finish'
    }
  }

  if (currentFlag === 'GREEN' && previousFlag === 'YELLOW') {
    if (hasSectorYellowTransition(previous, current)) return null
    return {
      ...context,
      kind: 'clear',
      source: 'game',
      title: 'Green flag',
      detail: 'Yellow flag cleared following an incident.',
      flagType: currentFlag
    }
  }

  return {
    ...context,
    kind: currentFlag === 'GREEN' ? 'clear' : 'detection',
    source: 'game',
    title: `${getFlagLabel(currentFlag)} detected`,
    detail: `${getFlagLabel(currentFlag)} is deployed automatically by LMU.`,
    flagType: currentFlag
  }
}

export const createSectorFlagActivities = (
  previous: SessionInfo | null,
  current: SessionInfo | null
): ActivityHistoryEntry[] => {
  if (!previous || !current) return []
  const context = getActivityContext(current)

  return current.sectorFlags.flatMap<ActivityHistoryEntry>((currentSectorFlag, index) => {
    const previousSectorFlag = previous.sectorFlags[index]
    if (previousSectorFlag === currentSectorFlag) return []

    const sectorNumber = index + 1
    if (currentSectorFlag === 'YELLOW') {
      return [
        {
          ...context,
          kind: 'detection',
          source: 'game',
          title: `Yellow flag in S${sectorNumber}`,
          detail: `Yellow flag in S${sectorNumber} caused by an incident.`,
          flagType: 'YELLOW',
          sector: `Sector ${sectorNumber}`
        }
      ]
    }

    if (
      previousSectorFlag === 'YELLOW' &&
      (currentSectorFlag === 'NONE' || currentSectorFlag === 'GREEN')
    ) {
      return [
        {
          ...context,
          kind: 'clear',
          source: 'game',
          title: `Green flag in S${sectorNumber}`,
          detail: `Yellow flag cleared in S${sectorNumber} following an incident.`,
          flagType: 'GREEN',
          sector: `Sector ${sectorNumber}`
        }
      ]
    }

    return []
  })
}

export const createDriverActivities = (
  previous: DriverStanding[],
  current: DriverStanding[],
  session: SessionInfo | null
): ActivityHistoryEntry[] => {
  if (previous.length === 0) return []
  const previousMap = new Map(previous.map((driver) => [getDriverKey(driver), driver]))
  const currentMap = new Map(current.map((driver) => [getDriverKey(driver), driver]))
  const context = getActivityContext(session)

  const joined = current
    .filter((driver) => !previousMap.has(getDriverKey(driver)))
    .map((driver) => createDriverActivity('Driver joined', 'joined', driver, context))

  const left = previous
    .filter((driver) => !currentMap.has(getDriverKey(driver)))
    .map((driver) => createDriverActivity('Driver left', 'left', driver, context))

  return [...joined, ...left]
}

export const createPenaltyAlerts = (
  previous: DriverStanding[],
  current: DriverStanding[],
  session: SessionInfo | null
): SpeedAlert[] => {
  if (previous.length === 0) return []
  const previousPenaltyKeys = new Set(
    previous.flatMap((driver) =>
      driver.penalties.map((penalty, index) => getPenaltyKey(driver, penalty, index))
    )
  )
  const context = getActivityContext(session)

  return current.flatMap((driver) =>
    driver.penalties
      .map((penalty, index) => ({ penalty, index }))
      .filter(
        ({ penalty, index }) => !previousPenaltyKeys.has(getPenaltyKey(driver, penalty, index))
      )
      .map(({ penalty, index }) =>
        createPenaltyAlert(driver, penalty, context, `${getDriverKey(driver)}:${index}`)
      )
  )
}

export const createSpeedAlerts = ({
  standings,
  telemetry,
  session,
  isFcyActive,
  speedLimitKph,
  toleranceKph,
  getEpisodeId
}: {
  standings: DriverStanding[]
  telemetry: TelemetrySnapshot | null
  session: SessionInfo | null
  isFcyActive?: boolean
  speedLimitKph: number
  toleranceKph: number
  getEpisodeId: (key: string) => string
}): SpeedAlert[] => {
  if (!telemetry) return []
  const telemetryLookup = createTelemetryLookup(telemetry.cars)
  const isFcy = isFcyActive ?? session?.flagState === 'FULL_COURSE_YELLOW'
  const context = getActivityContext(session)

  return standings.flatMap((driver) => {
    const carTelemetry = findTelemetry(driver, telemetryLookup)
    const speedKph = Math.round(carTelemetry?.speedKph ?? Number.NaN)
    if (!Number.isFinite(speedKph)) return []

    const alerts: SpeedAlert[] = []
    if (isFcy && speedKph > speedLimitKph + toleranceKph) {
      const overBy = Math.max(1, speedKph - speedLimitKph)
      alerts.push(
        createSpeedAlert({
          id: getEpisodeId(`fcy-speed:${getDriverKey(driver)}`),
          kind: 'fcy-speed',
          title: 'FCY speed limit exceeded',
          detail: `Car #${driver.carNumber} exceeded the FCY speed limit by ${overBy} km/h.`,
          driver,
          speedKph,
          threshold: `${speedLimitKph} km/h FCY zone`,
          method: 'Session flag state + telemetry speed',
          evidence: 'Session flag is FCY and telemetry speed is above the configured FCY limit.',
          context
        })
      )
    }

    if (driver.status === 'PITTING' && speedKph > PIT_SPEED_LIMIT_KPH) {
      const overBy = Math.max(1, speedKph - PIT_SPEED_LIMIT_KPH)
      alerts.push(
        createSpeedAlert({
          id: getEpisodeId(`pit-speed:${getDriverKey(driver)}`),
          kind: 'pit-speed',
          title: 'Pit speed limit exceeded',
          detail: `Car #${driver.carNumber} exceeded the pit speed limit by ${overBy} km/h.`,
          driver,
          speedKph,
          threshold: `${PIT_SPEED_LIMIT_KPH} km/h pit limit`,
          method: 'Driver status + telemetry speed',
          evidence:
            'Driver status is PITTING and telemetry speed is above the configured pit limit.',
          context
        })
      )
    }

    return alerts
  })
}

const getFlagLabel = (flagType: FlagType): string => {
  if (flagType === 'SC') return 'Safety car'
  if (flagType === 'SC_THIS_LAP') return 'SC ending'
  if (flagType === 'FCY') return 'FCY'
  const lower = flagType.toLowerCase()
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)} flag`
}

const hasSectorYellowTransition = (previous: SessionInfo | null, current: SessionInfo): boolean =>
  Boolean(
    previous?.sectorFlags.some(
      (previousFlag, index) =>
        previousFlag === 'YELLOW' &&
        (current.sectorFlags[index] === 'NONE' || current.sectorFlags[index] === 'GREEN')
    )
  )

const getLeaderClassLabel = (standings: DriverStanding[]): string => {
  const leader =
    standings.length === 0
      ? null
      : standings.reduce((best, driver) => (driver.position < best.position ? driver : best))
  return leader ? CLASS_LABELS[leader.carClass] : 'Class'
}

const createDriverActivity = (
  title: 'Driver joined' | 'Driver left',
  verb: 'joined' | 'left',
  driver: DriverStanding,
  context: ReturnType<typeof getActivityContext>
): ActivityHistoryEntry => ({
  ...context,
  kind: 'warning',
  source: 'system',
  title,
  detail: `Car #${driver.carNumber} ${verb} the session.`,
  flagType: null,
  driverName: driver.driverName,
  carName: driver.carName,
  carNumber: driver.carNumber
})

const getPenaltyKey = (driver: DriverStanding, penalty: Penalty, index: number): string =>
  `${getDriverKey(driver)}:${index}:${penalty.type}:${penalty.time}:${penalty.reason}`

const createPenaltyAlert = (
  driver: DriverStanding,
  penalty: Penalty,
  context: ReturnType<typeof getActivityContext>,
  nonce: string
): SpeedAlert => ({
  id: `penalty:${nonce}:${context.sessionElapsedSeconds}`,
  kind: 'penalty',
  title: 'Penalty',
  detail: `Car #${driver.carNumber} received a ${formatPenaltyType(penalty)} penalty.`,
  driverName: driver.driverName,
  carName: driver.carName,
  carNumber: driver.carNumber,
  primaryMetric: formatPenaltyType(penalty),
  threshold: 'Any new penalty',
  evidence: 'Penalty array changed for this car in the standings payload.',
  method: 'Standings penalties',
  location: 'Race control',
  sector: 'Track',
  corner: 'Race control',
  timestamp: context.timestamp,
  sessionElapsedSeconds: context.sessionElapsedSeconds,
  lap: context.lap,
  status: 'new',
  triggerActive: false,
  pulseActive: false
})

const formatPenaltyType = (penalty: Penalty): string => {
  if (penalty.type === 'DRIVE_THROUGH') return 'drive-through'
  if (penalty.type === 'STOP_AND_GO')
    return penalty.time > 0 ? `${penalty.time}s stop-and-go` : 'stop-and-go'
  if (penalty.type === 'TIME_PENALTY') return penalty.time > 0 ? `${penalty.time}s time` : 'time'
  return 'disqualification'
}

const createTelemetryLookup = (
  cars: DriverTelemetrySnapshot[]
): {
  byId: Map<number, DriverTelemetrySnapshot>
  byCarNumber: Map<string, DriverTelemetrySnapshot>
  byDriverName: Map<string, DriverTelemetrySnapshot>
} => ({
  byId: new Map(cars.map((car) => [car.id, car])),
  byCarNumber: new Map(cars.map((car) => [car.carNumber, car])),
  byDriverName: new Map(cars.map((car) => [car.driverName.trim().toLowerCase(), car]))
})

const findTelemetry = (
  driver: DriverStanding,
  lookup: ReturnType<typeof createTelemetryLookup>
): DriverTelemetrySnapshot | null => {
  if (driver.telemetryId !== null) {
    const byId = lookup.byId.get(driver.telemetryId)
    if (byId) return byId
  }
  return (
    lookup.byCarNumber.get(driver.carNumber) ??
    lookup.byDriverName.get(driver.driverName.trim().toLowerCase()) ??
    null
  )
}

const createSpeedAlert = ({
  id,
  kind,
  title,
  detail,
  driver,
  speedKph,
  threshold,
  method,
  evidence,
  context
}: {
  id: string
  kind: 'fcy-speed' | 'pit-speed'
  title: string
  detail: string
  driver: DriverStanding
  speedKph: number
  threshold: string
  method: string
  evidence: string
  context: ReturnType<typeof getActivityContext>
}): SpeedAlert => ({
  id,
  kind,
  title,
  detail,
  driverName: driver.driverName,
  carName: driver.carName,
  carNumber: driver.carNumber,
  primaryMetric: `${speedKph} km/h`,
  threshold,
  evidence,
  method,
  location: kind === 'pit-speed' ? 'Pit lane' : 'Track',
  sector: kind === 'pit-speed' ? 'Pit' : 'Track',
  corner: kind === 'pit-speed' ? 'Pit lane' : 'Track',
  timestamp: context.timestamp,
  sessionElapsedSeconds: context.sessionElapsedSeconds,
  lap: context.lap,
  status: 'new',
  triggerActive: true,
  pulseActive: true
})
