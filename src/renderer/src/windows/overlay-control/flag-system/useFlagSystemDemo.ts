import { useMemo, useState } from 'react'
import type { CustomSelectOption } from '../../../components/ui/CustomSelect'
import type {
  ActivityFilter,
  ActiveFlagState,
  FlagHistoryItem,
  FlagType,
  PreviewSettings,
  SpeedAlert,
  SyncState
} from './types'
import { FLAG_LABELS, FLAG_OPTIONS } from './types'

const FLAG_NOTE_PRESETS: Record<FlagType, string> = {
  GREEN: 'Circuit clear. Resume normal racing conditions.',
  YELLOW: 'Local caution requested for a slowing car in sector 2.',
  CHEQUERED: 'Session completed. Field should proceed under chequered conditions.',
  RED: 'Session suspended. Cars to pit lane and await further direction.',
  FCY: 'Recovery vehicle crossing sector 2 access road.',
  SC: 'Safety car deployed for controlled field neutralisation.',
  SC_THIS_LAP: 'Safety car ending. Restart procedure begins.'
}

const ALERT_SEEDS = [
  {
    id: 'alert-1',
    driverName: 'N. Jamin',
    carName: 'Oreca 07',
    carNumber: '38',
    speedKph: 91,
    location: 'Tertre Rouge',
    sector: 'Sector 1',
    corner: 'Tertre Rouge',
    timestamp: '14:36:44'
  },
  {
    id: 'alert-2',
    driverName: 'L. Vanthoor',
    carName: 'Porsche 963',
    carNumber: '6',
    speedKph: 84,
    location: 'Dunlop Chicane',
    sector: 'Sector 1',
    corner: 'Dunlop Chicane',
    timestamp: '14:36:51'
  },
  {
    id: 'alert-3',
    driverName: 'S. Baud',
    carName: 'Ferrari 296 GT3',
    carNumber: '87',
    speedKph: 79,
    location: 'Mulsanne Exit',
    sector: 'Sector 2',
    corner: 'Mulsanne Exit',
    timestamp: '14:37:09'
  }
] as const

const INITIAL_HISTORY: FlagHistoryItem[] = [
  {
    id: crypto.randomUUID(),
    kind: 'warning',
    source: 'system',
    title: 'FCY speed infringement',
    detail: 'Car 38 exceeded the monitored FCY limit at Tertre Rouge.',
    timestamp: '14:36:44',
    lap: 27,
    flagType: 'FCY',
    driverName: 'N. Jamin',
    carName: 'Oreca 07',
    carNumber: '38',
    sector: 'Sector 1',
    corner: 'Tertre Rouge'
  },
  {
    id: crypto.randomUUID(),
    kind: 'manual-change',
    source: 'race-control',
    title: 'FCY deployed',
    detail: 'Race control requested neutralisation while a stopped GT was recovered.',
    timestamp: '14:36:20',
    lap: 27,
    flagType: 'FCY',
    carNumber: '87',
    carName: 'Ferrari 296 GT3',
    sector: 'Sector 2',
    corner: 'Mulsanne Exit'
  },
  {
    id: crypto.randomUUID(),
    kind: 'detection',
    source: 'game',
    title: 'Game flag detected',
    detail: 'Game telemetry escalated the local yellow to full course yellow.',
    timestamp: '14:36:12',
    lap: 27,
    flagType: 'FCY',
    sector: 'Sector 2',
    corner: 'Indianapolis'
  },
  {
    id: crypto.randomUUID(),
    kind: 'detection',
    source: 'game',
    title: 'Local yellow cleared',
    detail: 'Track feed returned to green in sector 2 after recovery.',
    timestamp: '14:34:03',
    lap: 26,
    flagType: 'GREEN',
    sector: 'Sector 2',
    corner: 'Arnage'
  }
]

const prependHistory = (
  items: FlagHistoryItem[],
  entry: Omit<FlagHistoryItem, 'id'>
): FlagHistoryItem[] => [{ ...entry, id: crypto.randomUUID() }, ...items].slice(0, 18)

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
  activityFilter: ActivityFilter
  activityQuery: string
  filteredHistory: FlagHistoryItem[]
  filteredAlerts: SpeedAlert[]
  setSpeedLimitKph: (value: number) => void
  setToleranceKph: (value: number) => void
  setPreviewSettings: (settings: PreviewSettings) => void
  setActivityFilter: (filter: ActivityFilter) => void
  setActivityQuery: (query: string) => void
  applyManualFlag: (type: FlagType) => void
  clearManualFlag: () => void
  acknowledgeAlert: (id: string) => void
}

export function useFlagSystemDemo(): FlagSystemDemoState {
  const [manualFlag, setManualFlag] = useState<ActiveFlagState | null>({
    type: 'FCY',
    source: 'race-control',
    lap: 27,
    timestamp: '14:36:20',
    note: FLAG_NOTE_PRESETS.FCY
  })
  const [detectedFlag] = useState<ActiveFlagState | null>({
    type: 'FCY',
    source: 'game',
    lap: 27,
    timestamp: '14:36:12',
    note: 'Game feed reports session neutralised.'
  })
  const [speedLimitKph, setSpeedLimitKph] = useState(80)
  const [toleranceKph, setToleranceKph] = useState(5)
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>({
    opacity: 92,
    pulse: true,
    showTimer: true,
    compactMeta: false
  })
  const [history, setHistory] = useState<FlagHistoryItem[]>(INITIAL_HISTORY)
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>([])
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all')
  const [activityQuery, setActivityQuery] = useState('')

  const commitManualFlag = (
    type: FlagType,
    timestamp: string,
    title: string,
    detail: string
  ): void => {
    const nextFlag: ActiveFlagState = {
      type,
      source: 'race-control',
      lap: 27,
      timestamp,
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
        lap: nextFlag.lap,
        flagType: nextFlag.type,
        sector: type === 'SC_THIS_LAP' ? 'Sector 3' : 'Sector 2',
        corner: type === 'GREEN' ? 'Ford Chicane' : type === 'SC' ? 'Indianapolis' : 'Mulsanne Exit'
      })
    )
  }

  const applyManualFlag = (type: FlagType): void => {
    const activeType = manualFlag?.type

    if (type === 'SC') {
      if (activeType === 'SC') {
        commitManualFlag('SC_THIS_LAP', '14:37:26', 'SC ending', FLAG_NOTE_PRESETS.SC_THIS_LAP)
        return
      }

      if (activeType === 'SC_THIS_LAP') {
        commitManualFlag(
          'GREEN',
          '14:37:34',
          'Green Flag restored',
          'Safety car procedure completed. Return to green conditions.'
        )
        return
      }

      commitManualFlag('SC', '14:37:18', 'SC deployed', FLAG_NOTE_PRESETS.SC)
      return
    }

    if (activeType === type) {
      commitManualFlag(
        'GREEN',
        '14:37:30',
        'Green Flag restored',
        `${FLAG_LABELS[type]} cleared. Return to green conditions.`
      )
      return
    }

    commitManualFlag(type, '14:37:18', `${FLAG_LABELS[type]} applied`, FLAG_NOTE_PRESETS[type])
  }

  const clearManualFlag = (): void => {
    if (manualFlag?.type === 'GREEN') return
    commitManualFlag(
      'GREEN',
      '14:37:42',
      'Green Flag restored',
      manualFlag
        ? `Operator cleared ${FLAG_LABELS[manualFlag.type]} and restored green conditions.`
        : FLAG_NOTE_PRESETS.GREEN
    )
  }

  const acknowledgeAlert = (id: string): void => {
    setAcknowledgedAlertIds((current) => (current.includes(id) ? current : [...current, id]))
  }

  const speedAlerts = useMemo<SpeedAlert[]>(() => {
    const monitoredLimit = speedLimitKph + toleranceKph
    return ALERT_SEEDS.filter((seed) => seed.speedKph > monitoredLimit).map((seed) => ({
      id: seed.id,
      driverName: seed.driverName,
      carNumber: seed.carNumber,
      speedKph: seed.speedKph,
      zoneLimitKph: speedLimitKph,
      location: seed.location,
      carName: seed.carName,
      sector: seed.sector,
      corner: seed.corner,
      timestamp: seed.timestamp,
      lap: 27,
      status: acknowledgedAlertIds.includes(seed.id) ? 'acknowledged' : 'new'
    }))
  }, [acknowledgedAlertIds, speedLimitKph, toleranceKph])

  const effectiveFlag = manualFlag ?? detectedFlag
  const sectorFlags = useMemo<[FlagType | null, FlagType | null, FlagType | null]>(() => {
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
  }, [effectiveFlag])
  const syncState = getSyncState(manualFlag, detectedFlag)

  const filteredHistory = useMemo(() => {
    const query = activityQuery.trim().toLowerCase()
    return history.filter((item) => {
      const matchesFilter =
        activityFilter === 'all' ||
        (activityFilter === 'warnings' && item.kind === 'warning') ||
        (activityFilter === 'flags' && item.kind !== 'warning')

      const haystack = [
        item.driverName,
        item.carName,
        item.carNumber,
        item.sector,
        item.corner,
        item.timestamp,
        String(item.lap)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return matchesFilter && (!query || haystack.includes(query))
    })
  }, [activityFilter, activityQuery, history])

  const filteredAlerts = useMemo(() => {
    const query = activityQuery.trim().toLowerCase()
    return speedAlerts.filter((alert) => {
      const matchesFilter = activityFilter === 'all' || activityFilter === 'alerts'
      const haystack = [
        alert.driverName,
        alert.carName,
        alert.carNumber,
        alert.sector,
        alert.corner,
        alert.timestamp,
        String(alert.lap)
      ]
        .join(' ')
        .toLowerCase()
      return matchesFilter && (!query || haystack.includes(query))
    })
  }, [activityFilter, activityQuery, speedAlerts])

  return {
    flagOptions: FLAG_OPTIONS as readonly CustomSelectOption[],
    manualFlag,
    detectedFlag,
    effectiveFlag,
    currentLap: 27,
    timeRemaining: '01:12:44',
    sectorFlags,
    syncState,
    speedLimitKph,
    toleranceKph,
    previewSettings,
    speedAlerts,
    activityFilter,
    activityQuery,
    filteredHistory,
    filteredAlerts,
    setSpeedLimitKph,
    setToleranceKph,
    setPreviewSettings,
    setActivityFilter,
    setActivityQuery,
    applyManualFlag,
    clearManualFlag,
    acknowledgeAlert
  }
}
