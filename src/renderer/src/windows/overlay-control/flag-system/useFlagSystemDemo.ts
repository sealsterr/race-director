import { useEffect, useMemo, useRef, useState } from 'react'
import type { CustomSelectOption } from '../../../components/ui/CustomSelect'
import { useRaceStore } from '../../../store/raceStore'
import type {
  ConnectionStatus,
  DriverStanding,
  SessionInfo,
  TelemetrySnapshot
} from '../../../types/lmu'
import type {
  ActivityFilter,
  ActivityFilterToggle,
  ActiveFlagState,
  FlagHistoryItem,
  FlagType,
  PreviewSettings,
  SpeedAlert,
  SyncState
} from './types'
import { FLAG_OPTIONS } from './types'
import { formatSessionElapsed } from './flagTimeUtils'
import { useStickySpeedAlerts } from './useStickySpeedAlerts'
import {
  createConnectionActivity,
  createDetectedFlagState,
  createDriverActivities,
  createFlagActivity,
  createPenaltyAlerts,
  createSectorFlagActivities,
  createSessionActivity,
  createSpeedAlerts,
  mapFlagStateToFlagType,
  type ActivityHistoryEntry
} from './activityDetectionUtils'

const INITIAL_HISTORY: FlagHistoryItem[] = []

const prependHistory = (
  items: FlagHistoryItem[],
  entry: Omit<FlagHistoryItem, 'id'>
): FlagHistoryItem[] => [{ ...entry, id: crypto.randomUUID() }, ...items].slice(0, 80)

const prependHistoryEntries = (
  items: FlagHistoryItem[],
  entries: readonly ActivityHistoryEntry[]
): FlagHistoryItem[] =>
  [...entries.map((entry) => ({ ...entry, id: crypto.randomUUID() })), ...items].slice(0, 80)

const getSyncState = (
  manualFlag: ActiveFlagState | null,
  detectedFlag: ActiveFlagState | null
): SyncState => {
  if (!manualFlag && !detectedFlag) return 'idle'
  if (!manualFlag && detectedFlag) return 'detected-only'
  if (manualFlag && !detectedFlag) return 'manual-override'
  if (manualFlag!.type === detectedFlag!.type) return 'synced'
  return 'conflict'
}

const MANUAL_FLAG_TITLES: Record<FlagType, string> = {
  GREEN: 'Green flag',
  YELLOW: 'Yellow flag',
  CHEQUERED: 'Chequered flag',
  RED: 'Red flag',
  FCY: 'FCY',
  SC: 'Safety car',
  SC_THIS_LAP: 'SC ending'
}

const getManualFlagTitle = (type: FlagType): string => MANUAL_FLAG_TITLES[type]

const getManualFlagDetail = (type: FlagType): string =>
  `${getManualFlagTitle(type)} is engaged by the user.`

const ACTIVITY_FILTER_KEYS: ActivityFilter[] = ['flags', 'warnings', 'alerts']
const ACTIVITY_DESIGN_REVISION = 'sector-flags-v1'

const getDismissKey = (id: string): string => `${ACTIVITY_DESIGN_REVISION}:${id}`

export interface FlagSystemDemoState {
  flagOptions: readonly CustomSelectOption[]
  manualFlag: ActiveFlagState | null
  detectedFlag: ActiveFlagState | null
  effectiveFlag: ActiveFlagState | null
  currentLap: number
  timeRemaining: string
  sectorFlags: [FlagType | null, FlagType | null, FlagType | null]
  syncState: SyncState
  speedLimitKph: number
  toleranceKph: number
  previewSettings: PreviewSettings
  speedAlerts: SpeedAlert[]
  activityFilters: readonly ActivityFilter[]
  activityQuery: string
  filteredHistory: FlagHistoryItem[]
  filteredAlerts: SpeedAlert[]
  setSpeedLimitKph: (value: number) => void
  setToleranceKph: (value: number) => void
  setPreviewSettings: (settings: PreviewSettings) => void
  toggleActivityFilter: (filter: ActivityFilterToggle) => void
  setActivityQuery: (query: string) => void
  applyManualFlag: (type: FlagType) => void
  clearManualFlag: () => void
  dismissAlert: (id: string) => void
  dismissHistoryItem: (id: string) => void
  clearActivities: () => void
}

export function useFlagSystemDemo(): FlagSystemDemoState {
  const session = useRaceStore((state) => state.session)
  const standings = useRaceStore((state) => state.standings)
  const connection = useRaceStore((state) => state.connection)
  const [manualFlag, setManualFlag] = useState<ActiveFlagState | null>(null)
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot | null>(null)
  const [eventAlerts, setEventAlerts] = useState<SpeedAlert[]>([])
  const [speedLimitKph, setSpeedLimitKph] = useState(80)
  const [toleranceKph, setToleranceKph] = useState(5)
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>({
    opacity: 92,
    pulse: true,
    showTimer: true,
    compactMeta: false
  })
  const [history, setHistory] = useState<FlagHistoryItem[]>(INITIAL_HISTORY)
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([])
  const [dismissedHistoryIds, setDismissedHistoryIds] = useState<string[]>([])
  const [activityFilters, setActivityFilters] = useState<ActivityFilter[]>(ACTIVITY_FILTER_KEYS)
  const [activityQuery, setActivityQuery] = useState('')
  const previousConnectionRef = useRef<ConnectionStatus>(connection)
  const previousSessionRef = useRef<SessionInfo | null>(session)
  const previousStandingsRef = useRef<DriverStanding[] | null>(null)
  const speedAlertEpisodeIdsRef = useRef<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false

    void globalThis.api
      .getTelemetry()
      .then((snapshot) => {
        if (!cancelled) setTelemetry(snapshot)
      })
      .catch(() => {
        if (!cancelled) setTelemetry(null)
      })

    const unsubscribe = globalThis.api.onTelemetryUpdate((snapshot) => {
      setTelemetry(snapshot)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const event = createConnectionActivity(previousConnectionRef.current, connection, session)
    previousConnectionRef.current = connection
    if (!event) return

    const timeout = globalThis.setTimeout(() => {
      setHistory((items) => prependHistoryEntries(items, [event]))
    }, 0)

    return () => globalThis.clearTimeout(timeout)
  }, [connection, session])

  useEffect(() => {
    const previousSession = previousSessionRef.current
    const entries = [
      createSessionActivity(previousSession, session),
      createFlagActivity(previousSession, session, standings),
      ...createSectorFlagActivities(previousSession, session)
    ].filter((entry): entry is ActivityHistoryEntry => entry !== null)

    previousSessionRef.current = session
    if (entries.length === 0) return

    const timeout = globalThis.setTimeout(() => {
      setHistory((items) => prependHistoryEntries(items, entries))
    }, 0)

    return () => globalThis.clearTimeout(timeout)
  }, [session, standings])

  useEffect(() => {
    const previousStandings = previousStandingsRef.current
    previousStandingsRef.current = standings
    if (
      connection !== 'CONNECTED' ||
      previousStandings === null ||
      previousStandings.length === 0
    ) {
      return
    }

    const historyEntries = createDriverActivities(previousStandings, standings, session)
    const penaltyAlerts = createPenaltyAlerts(previousStandings, standings, session)
    if (historyEntries.length === 0 && penaltyAlerts.length === 0) return

    const timeout = globalThis.setTimeout(() => {
      if (historyEntries.length > 0) {
        setHistory((items) => prependHistoryEntries(items, historyEntries))
      }
      if (penaltyAlerts.length > 0) {
        setEventAlerts((alerts) => [...penaltyAlerts, ...alerts].slice(0, 80))
      }
    }, 0)

    return () => globalThis.clearTimeout(timeout)
  }, [connection, session, standings])

  const commitManualFlag = (
    type: FlagType,
    timestamp: string,
    sessionElapsedSeconds: number,
    title: string,
    detail: string
  ): void => {
    const nextFlag: ActiveFlagState = {
      type,
      source: 'race-control',
      lap: 27,
      timestamp,
      sessionElapsedSeconds,
      note: detail
    }

    setManualFlag(nextFlag)
    setHistory((items) =>
      prependHistory(items, {
        kind: 'manual-change',
        source: nextFlag.source,
        title,
        detail,
        timestamp,
        sessionElapsedSeconds,
        lap: nextFlag.lap,
        flagType: nextFlag.type,
        sector: type === 'SC_THIS_LAP' ? 'Sector 3' : 'Sector 2',
        corner: type === 'GREEN' ? 'Ford Chicane' : type === 'SC' ? 'Indianapolis' : 'Mulsanne Exit'
      })
    )
  }

  const getEventElapsed = (fallbackSeconds: number): number =>
    session?.sessionTime ?? fallbackSeconds

  const applyManualFlag = (type: FlagType): void => {
    const activeType = manualFlag?.type

    if (type === 'SC') {
      if (activeType === 'SC') {
        commitManualFlag(
          'SC_THIS_LAP',
          '14:37:26',
          getEventElapsed(5246),
          getManualFlagTitle('SC_THIS_LAP'),
          getManualFlagDetail('SC_THIS_LAP')
        )
        return
      }

      if (activeType === 'SC_THIS_LAP') {
        commitManualFlag(
          'GREEN',
          '14:37:34',
          getEventElapsed(5254),
          getManualFlagTitle('GREEN'),
          getManualFlagDetail('GREEN')
        )
        return
      }

      commitManualFlag(
        'SC',
        '14:37:18',
        getEventElapsed(5238),
        getManualFlagTitle('SC'),
        getManualFlagDetail('SC')
      )
      return
    }

    if (activeType === type) {
      commitManualFlag(
        'GREEN',
        '14:37:30',
        getEventElapsed(5250),
        getManualFlagTitle('GREEN'),
        getManualFlagDetail('GREEN')
      )
      return
    }

    commitManualFlag(
      type,
      '14:37:18',
      getEventElapsed(5238),
      getManualFlagTitle(type),
      getManualFlagDetail(type)
    )
  }

  const clearManualFlag = (): void => {
    if (!manualFlag || manualFlag.type === 'GREEN') return
    commitManualFlag(
      'GREEN',
      '14:37:42',
      getEventElapsed(5262),
      getManualFlagTitle('GREEN'),
      getManualFlagDetail('GREEN')
    )
  }

  const dismissAlert = (id: string): void => {
    const dismissKey = getDismissKey(id)
    setDismissedAlertIds((current) =>
      current.includes(dismissKey) ? current : [...current, dismissKey]
    )
  }

  const dismissHistoryItem = (id: string): void => {
    const dismissKey = getDismissKey(id)
    setDismissedHistoryIds((current) =>
      current.includes(dismissKey) ? current : [...current, dismissKey]
    )
  }

  const activeSpeedAlerts = useMemo<SpeedAlert[]>(() => {
    const activeKeys = new Set<string>()
    const alerts = createSpeedAlerts({
      standings,
      telemetry,
      session,
      isFcyActive: manualFlag?.type === 'FCY' || session?.flagState === 'FULL_COURSE_YELLOW',
      speedLimitKph,
      toleranceKph,
      getEpisodeId: (key) => {
        activeKeys.add(key)
        speedAlertEpisodeIdsRef.current[key] ??= `speed:${key}:${crypto.randomUUID()}`
        return speedAlertEpisodeIdsRef.current[key]
      }
    })

    Object.keys(speedAlertEpisodeIdsRef.current).forEach((key) => {
      if (!activeKeys.has(key)) {
        delete speedAlertEpisodeIdsRef.current[key]
      }
    })

    return alerts
  }, [manualFlag?.type, session, speedLimitKph, standings, telemetry, toleranceKph])
  const stickySpeedAlerts = useStickySpeedAlerts(activeSpeedAlerts)
  const speedAlerts = useMemo(
    () =>
      [...eventAlerts, ...stickySpeedAlerts].sort(
        (a, b) => b.sessionElapsedSeconds - a.sessionElapsedSeconds
      ),
    [eventAlerts, stickySpeedAlerts]
  )

  const clearActivities = (): void => {
    setDismissedAlertIds((current) => [
      ...new Set([...current, ...speedAlerts.map((alert) => getDismissKey(alert.id))])
    ])
    setDismissedHistoryIds((current) => [
      ...new Set([...current, ...history.map((item) => getDismissKey(item.id))])
    ])
  }

  const toggleActivityFilter = (filter: ActivityFilterToggle): void => {
    setActivityFilters((current) => {
      if (filter === 'all') return ACTIVITY_FILTER_KEYS
      if (current.includes(filter)) return current.filter((item) => item !== filter)
      return [...current, filter]
    })
  }

  const detectedFlag = useMemo(() => createDetectedFlagState(session), [session])
  const effectiveFlag = manualFlag ?? detectedFlag
  const sectorFlags = useMemo<[FlagType | null, FlagType | null, FlagType | null]>(() => {
    if (!manualFlag && session?.sectorFlags) {
      return session.sectorFlags.map(mapFlagStateToFlagType) as [
        FlagType | null,
        FlagType | null,
        FlagType | null
      ]
    }

    if (!effectiveFlag) return [null, null, null]
    if (
      effectiveFlag.type === 'FCY' ||
      effectiveFlag.type === 'SC' ||
      effectiveFlag.type === 'SC_THIS_LAP' ||
      effectiveFlag.type === 'RED'
    ) {
      return [effectiveFlag.type, effectiveFlag.type, effectiveFlag.type]
    }
    if (effectiveFlag.type === 'YELLOW') return ['YELLOW', null, null]
    if (effectiveFlag.type === 'GREEN') return ['GREEN', 'GREEN', 'GREEN']
    return [null, null, null]
  }, [effectiveFlag, manualFlag, session?.sectorFlags])
  const syncState = getSyncState(manualFlag, detectedFlag)

  const filteredHistory = useMemo(() => {
    const query = activityQuery.trim().toLowerCase()
    return history.filter((item) => {
      const isVisible = !dismissedHistoryIds.includes(getDismissKey(item.id))
      const matchesFilter =
        (activityFilters.includes('warnings') && item.kind === 'warning') ||
        (activityFilters.includes('flags') && item.kind !== 'warning')

      const haystack = [
        item.title,
        item.detail,
        item.driverName,
        item.carName,
        item.carNumber,
        item.sector,
        item.corner,
        item.timestamp,
        formatSessionElapsed(item.sessionElapsedSeconds),
        String(item.lap)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return isVisible && matchesFilter && (!query || haystack.includes(query))
    })
  }, [activityFilters, activityQuery, dismissedHistoryIds, history])

  const filteredAlerts = useMemo(() => {
    const query = activityQuery.trim().toLowerCase()
    return speedAlerts.filter((alert) => {
      const matchesFilter = activityFilters.includes('alerts')
      const isVisible = !dismissedAlertIds.includes(getDismissKey(alert.id))
      const haystack = [
        alert.title,
        alert.detail,
        alert.driverName,
        alert.carName,
        alert.carNumber,
        alert.primaryMetric,
        alert.threshold,
        alert.evidence,
        alert.method,
        alert.sector,
        alert.corner,
        alert.timestamp,
        formatSessionElapsed(alert.sessionElapsedSeconds),
        String(alert.lap)
      ]
        .join(' ')
        .toLowerCase()
      return isVisible && matchesFilter && (!query || haystack.includes(query))
    })
  }, [activityFilters, activityQuery, dismissedAlertIds, speedAlerts])

  return {
    flagOptions: FLAG_OPTIONS as readonly CustomSelectOption[],
    manualFlag,
    detectedFlag,
    effectiveFlag,
    currentLap: session?.currentLap ?? 27,
    timeRemaining: formatSessionElapsed(session?.timeRemaining ?? 4364),
    sectorFlags,
    syncState,
    speedLimitKph,
    toleranceKph,
    previewSettings,
    speedAlerts,
    activityFilters,
    activityQuery,
    filteredHistory,
    filteredAlerts,
    setSpeedLimitKph,
    setToleranceKph,
    setPreviewSettings,
    toggleActivityFilter,
    setActivityQuery,
    applyManualFlag,
    clearManualFlag,
    dismissAlert,
    dismissHistoryItem,
    clearActivities
  }
}
