import type {
  AppState,
  SessionInfo,
  DriverStanding,
  SessionType,
  FlagState,
  CarClass,
  TyreCompound,
  DriverStatus,
  ConnectionStatus,
  SectorTime,
  Penalty,
  TyreSet
} from '../../shared/types'
import { telemetryBridge, type TelemetryDriverSnapshot } from './lmuTelemetryBridge'
import { loadPlayerProfile } from './lmuPlayerProfile'

interface RawSessionInfo {
  session: string // "PRACTICE1", "QUALIFY1", "RACE1", etc.
  trackName: string
  currentEventTime: number // elapsed time in seconds
  endEventTime: number // session end time in seconds
  maxTime: number // max session time in seconds
  timeRemainingInGamePhase: number // in s
  maximumLaps: number // 4294967295 means no lap limit
  gamePhase: number // numeric phase (not used for flag)
  yellowFlagState: string // "NONE", "PENDING", "RESUME", "FULLCOURSE"
  inRealtime: boolean
  numberOfVehicles: number
  sectorFlag: string[] // per-sector flag states
}

interface RawVehicleStanding {
  position: number
  carClass: string // "Hyper", "LMP2", "LMP3", "GT3", etc.
  carNumber: string // often empty string!
  slotID: number // reliable unique identifier
  driverName: string
  fullTeamName: string
  vehicleName: string // "Aston Martin THOR Team 2025 #007:EC"
  vehicleFilename: string // "007_25_THOEAFB145B"
  lastLapTime: number // 0.0 if no lap set
  bestLapTime: number // -1.0 if no lap set
  timeBehindLeader: number
  timeBehindNext: number
  lapsCompleted: number
  lapsBehindLeader: number
  lapsBehindNext: number
  pitting: boolean
  inGarageStall: boolean
  pitstops: number
  finishStatus: string // "FSTAT_NONE", "FSTAT_FINISHED", "FSTAT_DNF", "FSTAT_DQ"
  penalties: number // count of pending penalties
  fuelFraction: number // 0.0 - 1.0
  flag: string // per-car flag: "GREEN", "YELLOW", etc.
  gamePhase: string // per-car game phase string
  sector: string // "SECTOR1", "SECTOR2", "SECTOR3"
  player: boolean
  focus: boolean
  hasFocus: boolean
  currentSectorTime1: number
  currentSectorTime2: number
  lastSectorTime1: number
  lastSectorTime2: number
  bestLapSectorTime1: number
  bestLapSectorTime2: number
  bestSectorTime1: number
  bestSectorTime2: number
  qualification: number // grid position
}

const mapSessionType = (session: string): SessionType => {
  const upper = session.toUpperCase()

  if (upper.startsWith('PRACTICE')) return 'PRACTICE'
  if (upper.startsWith('QUALIFY')) return 'QUALIFYING'
  if (upper.startsWith('RACE')) return 'RACE'

  return 'UNKNOWN'
}

const hasFlagToken = (value: string, token: string): boolean => value.toUpperCase().includes(token)

const mapFlagState = (
  yellowFlagState: string,
  sectorFlags: string[],
  vehicles: RawVehicleStanding[],
  timeRemaining: number
): FlagState => {
  const upper = yellowFlagState.toUpperCase()
  const map: Record<string, FlagState> = {
    NONE: 'GREEN',
    PENDING: 'YELLOW',
    RESUME: 'YELLOW',
    FULLCOURSE: 'FULL_COURSE_YELLOW',
    SAFETYCAR: 'SAFETY_CAR'
  }
  const vehicleFlags = vehicles.flatMap((vehicle) => [vehicle.flag ?? '', vehicle.gamePhase ?? ''])
  const allFlags = [upper, ...sectorFlags, ...vehicleFlags].map((flag) => flag.toUpperCase())

  const hasChequeredSignal =
    (timeRemaining <= 0 &&
      vehicles.some(
        (vehicle) => (vehicle.finishStatus ?? '').toUpperCase() === 'FSTAT_FINISHED'
      )) ||
    allFlags.some(
      (flag) =>
        hasFlagToken(flag, 'CHEQU') ||
        hasFlagToken(flag, 'CHECK') ||
        hasFlagToken(flag, 'BLACKWHITE')
    )
  if (hasChequeredSignal) return 'CHEQUERED'

  const hasRed = allFlags.some((flag) => hasFlagToken(flag, 'RED'))
  if (hasRed) return 'RED'

  const hasYellow = allFlags.some((flag) => hasFlagToken(flag, 'YELLOW'))
  if (hasYellow && upper === 'NONE') return 'YELLOW'

  return map[upper] ?? 'NONE'
}

const normalizeClassToken = (value: string): string =>
  value
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]/g, '')

const mapCarClass = (
  vehicleClass: string,
  vehicleName: string,
  vehicleFilename: string
): CarClass => {
  const candidates = [vehicleClass, vehicleName, vehicleFilename]
    .map(normalizeClassToken)
    .filter(Boolean)

  const exactMap: Record<string, CarClass> = {
    HYPER: 'HYPERCAR',
    HYPERCAR: 'HYPERCAR',
    LMH: 'HYPERCAR',
    LMHYPERCAR: 'HYPERCAR',
    LMDH: 'HYPERCAR',
    LMP2: 'LMP2',
    LMP2PRO: 'LMP2',
    LMP2PROAM: 'LMP2',
    LMP2AM: 'LMP2',
    LMP3: 'LMP3',
    GT3: 'LMGT3',
    LMGT3: 'LMGT3',
    GTE: 'GTE'
  }

  for (const candidate of candidates) {
    const exact = exactMap[candidate]
    if (exact) return exact
  }

  for (const candidate of candidates) {
    if (
      candidate.includes('HYPER') ||
      candidate.includes('LMH') ||
      candidate.includes('LMDH') ||
      candidate.includes('499P') ||
      candidate.includes('963') ||
      candidate.includes('9X8') ||
      candidate.includes('GR010') ||
      candidate.includes('VALKYRIE') ||
      candidate.includes('VSERIESR') ||
      candidate.includes('MHYBRIDV8') ||
      candidate.includes('A424')
    ) {
      return 'HYPERCAR'
    }

    if (
      candidate.includes('LMP2') ||
      candidate.includes('ORECA07') ||
      candidate.includes('ORECA')
    ) {
      return 'LMP2'
    }

    if (candidate.includes('LMP3')) {
      return 'LMP3'
    }

    if (candidate.includes('LMGT3') || candidate.includes('GT3')) {
      return 'LMGT3'
    }

    if (candidate.includes('GTE')) {
      return 'GTE'
    }
  }

  return 'UNKNOWN'
}

const mapTyreCompound = (value?: string | null): TyreCompound => {
  const upper = (value ?? '').toUpperCase()
  if (upper.includes('SOFT') || upper === 'S') return 'SOFT'
  if (upper.includes('MEDIUM') || upper.includes('MED') || upper === 'M') return 'MEDIUM'
  if (upper.includes('HARD') || upper === 'H') return 'HARD'
  if (upper.includes('WET') || upper.includes('INTER') || upper === 'W') return 'WET'
  return 'UNKNOWN'
}

const mapDriverStatus = (v: RawVehicleStanding): DriverStatus => {
  const finish = v.finishStatus.toUpperCase()
  if (finish === 'FSTAT_DQ') return 'DISQUALIFIED'
  if (finish === 'FSTAT_DNF') return 'RETIRED'
  if (finish === 'FSTAT_FINISHED') return 'FINISHED'
  if (v.pitting || v.inGarageStall) return 'PITTING'
  return 'RACING'
}

// LMU can leave carNumber empty, so parse vehicleName before falling back to slotID.
const extractCarNumber = (v: RawVehicleStanding): string => {
  if (v.carNumber && v.carNumber.trim() !== '') return v.carNumber

  const nameMatch = /#(\w+)/.exec(v.vehicleName)
  if (nameMatch) return nameMatch[1]

  return String(v.slotID)
}

const cleanCarName = (vehicleName: string): string => {
  return vehicleName.replace(/#\w+.*$/, '').trim()
}

const normalizeLookup = (value: string): string => value.toUpperCase().replace(/[^A-Z0-9]/g, '')

const playerProfile = loadPlayerProfile()

const buildTyreSet = (front: TyreCompound, rear: TyreCompound): TyreSet | null => {
  if (front === 'UNKNOWN' && rear === 'UNKNOWN') {
    return null
  }

  return {
    frontLeft: front,
    frontRight: front,
    rearLeft: rear,
    rearRight: rear
  }
}

const resolveDriverNationality = (raw: RawVehicleStanding): string | null => {
  if (!playerProfile) {
    return null
  }

  const normalizedDriver = normalizeLookup(raw.driverName)
  const normalizedCarNumber = normalizeLookup(extractCarNumber(raw))
  const matchesPlayerName =
    normalizedDriver !== '' &&
    (normalizedDriver === normalizeLookup(playerProfile.playerName ?? '') ||
      normalizedDriver === normalizeLookup(playerProfile.playerNick ?? ''))
  const matchesVehicleNumber =
    normalizedCarNumber !== '' &&
    normalizedCarNumber === normalizeLookup(playerProfile.vehicleNumber ?? '')

  return matchesPlayerName || (raw.player && matchesVehicleNumber)
    ? playerProfile.nationalityCode
    : null
}

function createTelemetryLookup(telemetryCars: TelemetryDriverSnapshot[]): {
  byDriverAndCar: Map<string, TelemetryDriverSnapshot>
  byVehicle: Map<string, TelemetryDriverSnapshot>
  byCarNumber: Map<string, TelemetryDriverSnapshot[]>
} {
  const byDriverAndCar = new Map<string, TelemetryDriverSnapshot>()
  const byVehicle = new Map<string, TelemetryDriverSnapshot>()
  const byCarNumber = new Map<string, TelemetryDriverSnapshot[]>()

  for (const car of telemetryCars ?? []) {
    const driverAndCarKey = `${normalizeLookup(car.driverName)}:${normalizeLookup(car.carNumber)}`
    if (normalizeLookup(car.driverName) && normalizeLookup(car.carNumber)) {
      byDriverAndCar.set(driverAndCarKey, car)
    }

    const vehicleKey = normalizeLookup(cleanCarName(car.vehicleName))
    if (vehicleKey) {
      byVehicle.set(vehicleKey, car)
    }

    const carNumberKey = normalizeLookup(car.carNumber)
    if (carNumberKey) {
      const matches = byCarNumber.get(carNumberKey) ?? []
      matches.push(car)
      byCarNumber.set(carNumberKey, matches)
    }
  }

  return { byDriverAndCar, byVehicle, byCarNumber }
}

function findTelemetryMatch(
  raw: RawVehicleStanding,
  lookup: ReturnType<typeof createTelemetryLookup>
): TelemetryDriverSnapshot | null {
  const carNumber = normalizeLookup(extractCarNumber(raw))
  const driverAndCarKey = `${normalizeLookup(raw.driverName)}:${carNumber}`
  const directMatch = lookup.byDriverAndCar.get(driverAndCarKey)
  if (directMatch) {
    return directMatch
  }

  const byVehicle = lookup.byVehicle.get(normalizeLookup(cleanCarName(raw.vehicleName)))
  if (byVehicle) {
    return byVehicle
  }

  const byCarNumber = lookup.byCarNumber.get(carNumber)
  if (byCarNumber?.length === 1) {
    return byCarNumber[0]
  }

  return null
}

// LMU REST reports the first two sector times; the telemetry bridge fills sector 3.
const mapSectorTime = (s1: number, s2: number): SectorTime => ({
  sector1: s1 > 0 ? s1 : null,
  sector2: s2 > 0 ? s2 : null,
  sector3: null
})

// REST exposes only the pending penalty count; detailed penalties come from shared memory.
const mapPenalties = (count: number): Penalty[] =>
  count <= 0 ? [] : [{ type: 'TIME_PENALTY' as const, time: 0, reason: `${count} pending` }]

const transformSession = (raw: RawSessionInfo, vehicles: RawVehicleStanding[]): SessionInfo => {
  const vehicleCount = raw.numberOfVehicles > 0 ? raw.numberOfVehicles : vehicles.length
  const current = Number.isFinite(raw.currentEventTime) ? raw.currentEventTime : 0
  const remainingDirect =
    Number.isFinite(raw.timeRemainingInGamePhase) && raw.timeRemainingInGamePhase >= 0
      ? raw.timeRemainingInGamePhase
      : null
  const remainingFromMax =
    Number.isFinite(raw.maxTime) && raw.maxTime > 0 ? Math.max(0, raw.maxTime - current) : null
  const remainingFromEndEvent =
    Number.isFinite(raw.endEventTime) && raw.endEventTime > 0
      ? Math.max(0, raw.endEventTime - current)
      : null
  const timeRemaining = remainingDirect ?? remainingFromMax ?? remainingFromEndEvent ?? 0
  const totalSessionTime =
    Number.isFinite(raw.maxTime) && raw.maxTime > 0
      ? raw.maxTime
      : Number.isFinite(raw.endEventTime) && raw.endEventTime > 0
        ? raw.endEventTime
        : current + timeRemaining

  const noLapLimit = raw.maximumLaps >= 4294967295 || raw.maximumLaps === 0

  const leader =
    vehicles.length > 0
      ? vehicles.reduce<RawVehicleStanding>(
          (best, v) => (v.position < best.position ? v : best),
          vehicles[0]
        )
      : null

  const currentLap =
    leader && Number.isFinite(leader.lapsCompleted) ? Math.max(0, leader.lapsCompleted) + 1 : 0

  const numCarsOnTrack = vehicles.filter((v) => {
    const finish = (v.finishStatus ?? '').toUpperCase()
    const inactiveFinish =
      finish === 'FSTAT_DNF' || finish === 'FSTAT_DQ' || finish === 'FSTAT_FINISHED'

    if (inactiveFinish) return false
    if (v.inGarageStall) return false

    return true
  }).length

  return {
    sessionType: mapSessionType(raw.session),
    trackName: raw.trackName || 'Unknown Track',
    currentLap,
    totalLaps: noLapLimit ? 0 : raw.maximumLaps,
    timeRemaining,
    totalSessionTime,
    sessionTime: current,
    flagState: mapFlagState(raw.yellowFlagState, raw.sectorFlag, vehicles, timeRemaining),
    numCars: vehicleCount,
    numCarsOnTrack,
    isActive: vehicleCount > 0
  }
}

const transformVehicle = (
  raw: RawVehicleStanding,
  telemetry: TelemetryDriverSnapshot | null
): DriverStanding => {
  const frontTyreCompound = mapTyreCompound(telemetry?.frontTyreCompound)
  const rearTyreCompound = mapTyreCompound(telemetry?.rearTyreCompound)
  const tyreSet = buildTyreSet(frontTyreCompound, rearTyreCompound)
  const unifiedTyreCompound =
    tyreSet && frontTyreCompound === rearTyreCompound ? frontTyreCompound : 'UNKNOWN'

  return {
    position: raw.position,
    carNumber: extractCarNumber(raw),
    driverName: raw.driverName,
    nationalityCode: resolveDriverNationality(raw),
    teamName: raw.fullTeamName,
    carClass: mapCarClass(raw.carClass, raw.vehicleName, raw.vehicleFilename),
    carName: cleanCarName(raw.vehicleName),
    lastLapTime: raw.lastLapTime > 0 ? raw.lastLapTime : null,
    bestLapTime: raw.bestLapTime > 0 ? raw.bestLapTime : null,
    currentSectors: mapSectorTime(raw.currentSectorTime1, raw.currentSectorTime2),
    bestSectors: mapSectorTime(raw.bestSectorTime1, raw.bestSectorTime2),
    gapToLeader: raw.timeBehindLeader > 0 ? raw.timeBehindLeader : null,
    intervalToAhead: raw.timeBehindNext > 0 ? raw.timeBehindNext : null,
    lapsCompleted: raw.lapsCompleted,
    lapsDown: raw.lapsBehindLeader,
    fuel: telemetry?.fuelPercentage ?? raw.fuelFraction * 100,
    tyreCompound: unifiedTyreCompound,
    tyreSet,
    pitStopCount: raw.pitstops,
    penalties: mapPenalties(raw.penalties),
    status: mapDriverStatus(raw),
    isPlayer: raw.player,
    isFocused: raw.focus || raw.hasFocus,
    slotId: raw.slotID,
    telemetryId: telemetry?.id ?? null
  }
}

type StateUpdateCallback = (state: AppState) => void
type ConnectionCallback = (status: ConnectionStatus) => void
const DEFAULT_LMU_BASE_URL = 'http://localhost:6397'
const DEFAULT_POLL_RATE_MS = 200
const MIN_POLL_RATE_MS = 50
const MAX_POLL_RATE_MS = 2_000
const LMU_PING_TIMEOUT_MS = 3_000
const LMU_REQUEST_TIMEOUT_MS = 3_000
const LMU_DISCONNECT_NOTICE_DELAY_MS = 3_000

export class LmuApiClient {
  private baseUrl: string = DEFAULT_LMU_BASE_URL
  private pollRate: number = DEFAULT_POLL_RATE_MS
  private telemetryRate: number = 33
  private pollTimer: ReturnType<typeof setInterval> | null = null
  private delayedDisconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pollInFlight = false
  private consecutivePollFailures = 0
  private currentState: AppState = {
    connection: 'DISCONNECTED',
    session: null,
    standings: [],
    lastUpdated: null
  }

  private onStateUpdate: StateUpdateCallback | null = null
  private onConnectionChange: ConnectionCallback | null = null

  public configure(url: string, pollRate: number): void {
    this.baseUrl = this.toSafeBaseUrl(url)
    const safePollRate = Number.isFinite(pollRate) ? Math.round(pollRate) : DEFAULT_POLL_RATE_MS
    this.pollRate = Math.max(MIN_POLL_RATE_MS, Math.min(MAX_POLL_RATE_MS, safePollRate))
  }

  public setStateUpdateCallback(cb: StateUpdateCallback): void {
    this.onStateUpdate = cb
  }

  public setConnectionCallback(cb: ConnectionCallback): void {
    this.onConnectionChange = cb
  }

  public getState(): AppState {
    return this.currentState
  }

  public async connect(): Promise<void> {
    this.clearDelayedDisconnectTimer()
    this.emitConnection('CONNECTING')
    this.consecutivePollFailures = 0
    const alive = await this.ping()
    if (!alive) {
      this.emitConnection('ERROR')
      this.scheduleDelayedDisconnect()
      return
    }
    this.emitConnection('CONNECTED')
    telemetryBridge.start(this.telemetryRate)
    void this.poll()
    this.startPolling()
  }

  public async focusVehicle(slotId: number): Promise<void> {
    await this.performControlRequest(`/rest/watch/focus/${slotId}`)
  }

  public async setCameraAngle(
    cameraType: number,
    trackSideGroup: number,
    shouldAdvance: boolean
  ): Promise<void> {
    await this.performControlRequest(
      `/rest/watch/focus/${cameraType}/${trackSideGroup}/${shouldAdvance}`
    )
  }

  public disconnect(): void {
    this.clearDelayedDisconnectTimer()
    this.stopPolling()
    this.consecutivePollFailures = 0
    telemetryBridge.stop()
    this.currentState = {
      ...this.currentState,
      session: null,
      standings: [],
      lastUpdated: Date.now()
    }

    this.emitConnection('DISCONNECTED')
    this.onStateUpdate?.(this.currentState)
  }

  private async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/rest/watch/sessionInfo`, {
        signal: AbortSignal.timeout(LMU_PING_TIMEOUT_MS)
      })
      return res.ok
    } catch {
      return false
    }
  }

  private toSafeBaseUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim()
    if (!trimmed) {
      return DEFAULT_LMU_BASE_URL
    }

    try {
      const parsed = new URL(trimmed)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return DEFAULT_LMU_BASE_URL
      }

      const normalizedPath = parsed.pathname.replace(/\/+$/, '')
      return `${parsed.origin}${normalizedPath === '/' ? '' : normalizedPath}`
    } catch {
      return DEFAULT_LMU_BASE_URL
    }
  }

  private async performControlRequest(path: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      signal: AbortSignal.timeout(LMU_REQUEST_TIMEOUT_MS)
    })

    if (!response.ok) {
      throw new Error(`LMU control request failed (${response.status})`)
    }
  }

  private startPolling(): void {
    this.stopPolling()
    this.pollTimer = setInterval(() => {
      void this.poll()
    }, this.pollRate)
    this.pollTimer.unref?.()
  }

  private stopPolling(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
    this.pollInFlight = false
  }

  private async poll(): Promise<void> {
    if (this.pollInFlight) {
      return
    }

    this.pollInFlight = true

    try {
      const timeoutMs = Math.max(1_000, Math.min(5_000, this.pollRate * 3))
      const signal = AbortSignal.timeout(timeoutMs)
      const [sessionRes, standingsRes] = await Promise.all([
        fetch(`${this.baseUrl}/rest/watch/sessionInfo`, { signal }),
        fetch(`${this.baseUrl}/rest/watch/standings`, { signal })
      ])

      if (!sessionRes.ok || !standingsRes.ok) {
        this.handlePollFailure()
        return
      }

      const rawSession = (await sessionRes.json()) as RawSessionInfo
      const rawVehicles = (await standingsRes.json()) as RawVehicleStanding[]
      const telemetryLookup = createTelemetryLookup(telemetryBridge.getLatestSnapshot().cars)

      const newState: AppState = {
        connection: 'CONNECTED',
        session: transformSession(rawSession, rawVehicles),
        standings: rawVehicles.map((vehicle) =>
          transformVehicle(vehicle, findTelemetryMatch(vehicle, telemetryLookup))
        ),
        lastUpdated: Date.now()
      }

      this.consecutivePollFailures = 0
      this.currentState = newState
      this.emitStateUpdate(newState)
    } catch (error) {
      this.handlePollFailure(error)
    } finally {
      this.pollInFlight = false
    }
  }

  private handlePollFailure(error?: unknown): void {
    this.consecutivePollFailures += 1
    if (this.consecutivePollFailures < 5) {
      return
    }

    if (error) {
      console.warn('LMU polling failed repeatedly:', error)
    }

    this.stopPolling()
    telemetryBridge.stop()
    this.emitConnection('ERROR')
    this.scheduleDelayedDisconnect()
  }

  private scheduleDelayedDisconnect(): void {
    this.clearDelayedDisconnectTimer()
    this.delayedDisconnectTimer = setTimeout(() => {
      this.delayedDisconnectTimer = null
      this.emitConnection('DISCONNECTED')
    }, LMU_DISCONNECT_NOTICE_DELAY_MS)
    this.delayedDisconnectTimer.unref?.()
  }

  private clearDelayedDisconnectTimer(): void {
    if (!this.delayedDisconnectTimer) {
      return
    }

    clearTimeout(this.delayedDisconnectTimer)
    this.delayedDisconnectTimer = null
  }

  private emitConnection(status: ConnectionStatus): void {
    if (status === 'CONNECTED' || status === 'DISCONNECTED') {
      this.clearDelayedDisconnectTimer()
    }

    this.currentState = { ...this.currentState, connection: status }
    try {
      this.onConnectionChange?.(status)
    } catch (error) {
      console.warn('Failed to deliver connection update:', error)
    }
  }

  private emitStateUpdate(state: AppState): void {
    try {
      this.onStateUpdate?.(state)
    } catch (error) {
      console.warn('Failed to deliver LMU state update:', error)
    }
  }
}

export const lmuClient = new LmuApiClient()
