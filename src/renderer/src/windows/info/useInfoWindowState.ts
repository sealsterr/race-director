import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getErrorMessage } from '../../hooks/useAsyncAction'
import { useRaceStore } from '../../store/raceStore'
import type { CarClass, DriverStanding } from '../../types/lmu'
import { ALL_CLASSES, COLUMNS, DEFAULT_CAMERA, type ColumnKey } from './infoConstants'

export interface InfoWindowState {
  connection: ReturnType<typeof useRaceStore.getState>['connection']
  standings: DriverStanding[]
  filteredStandings: DriverStanding[]
  visibleCols: Set<ColumnKey>
  activeClasses: Set<CarClass>
  showColMenu: boolean
  focusedSlotId: number | null
  isHydrating: boolean
  loadError: string | null
  actionError: string | null
  title: string
  sessionType: string | null
  sessionCars: string | null
  colMenuRef: React.RefObject<HTMLDivElement | null>
  colButtonRef: React.RefObject<HTMLButtonElement | null>
  setShowColMenu: React.Dispatch<React.SetStateAction<boolean>>
  clearActionError: () => void
  reloadWindowData: () => Promise<void>
  toggleCol: (key: ColumnKey) => void
  toggleClass: (carClass: CarClass) => void
  handleRowClick: (driver: DriverStanding) => Promise<void>
}

export const useInfoWindowState = (): InfoWindowState => {
  const { connection, session, standings, setConnection, setSession, setStandings } = useRaceStore()
  const [focusedSlotId, setFocusedSlotId] = useState<number | null>(null)
  const [isHydrating, setIsHydrating] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [visibleCols, setVisibleCols] = useState<Set<ColumnKey>>(
    () => new Set(COLUMNS.filter((column) => column.defaultVisible).map((column) => column.key))
  )
  const [activeClasses, setActiveClasses] = useState<Set<CarClass>>(() => new Set(ALL_CLASSES))
  const [showColMenu, setShowColMenu] = useState(false)
  const activeCameraType = useRef<number | null>(null)
  const colMenuRef = useRef<HTMLDivElement>(null)
  const colButtonRef = useRef<HTMLButtonElement>(null)

  const reloadWindowData = React.useCallback(async (): Promise<void> => {
    setIsHydrating(true)
    setLoadError(null)

    try {
      const state = await globalThis.api.getState()
      setConnection(state.connection)
      setSession(state.session)
      setStandings(state.standings)
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Unable to load live race data.'))
    } finally {
      setIsHydrating(false)
    }
  }, [setConnection, setSession, setStandings])

  useEffect(() => {
    void reloadWindowData()

    const unsubscribeState = globalThis.api.onStateUpdate((state) => {
      setLoadError(null)
      setSession(state.session)
      setStandings(state.standings)
    })
    const unsubscribeConnection = globalThis.api.onConnectionChange((status) => {
      setLoadError(null)
      setConnection(status)
    })

    return () => {
      unsubscribeState()
      unsubscribeConnection()
    }
  }, [reloadWindowData, setConnection, setSession, setStandings])

  useEffect(() => {
    if (!showColMenu) {
      return
    }

    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node
      const clickedOutsideMenu = !colMenuRef.current?.contains(target)
      const clickedOutsideButton = !colButtonRef.current?.contains(target)

      if (clickedOutsideMenu && clickedOutsideButton) {
        setShowColMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showColMenu])

  const handleRowClick = async (driver: DriverStanding): Promise<void> => {
    if (connection !== 'CONNECTED') {
      return
    }

    setActionError(null)

    try {
      await globalThis.api.focusVehicle(driver.slotId)

      if (activeCameraType.current !== DEFAULT_CAMERA) {
        await globalThis.api.setCameraAngle(DEFAULT_CAMERA, 0, false)
        activeCameraType.current = DEFAULT_CAMERA
      }

      setFocusedSlotId(driver.slotId)
    } catch (error) {
      setActionError(getErrorMessage(error, 'Unable to focus the selected car.'))
    }
  }

  const toggleCol = (key: ColumnKey): void => {
    setVisibleCols((current) => {
      const next = new Set(current)

      if (next.has(key)) {
        if (key === 'position' || key === 'driver') {
          return current
        }
        next.delete(key)
      } else {
        next.add(key)
      }

      return next
    })
  }

  const toggleClass = (carClass: CarClass): void => {
    setActiveClasses((current) => {
      const next = new Set(current)

      if (next.has(carClass)) {
        if (next.size === 1) {
          return current
        }
        next.delete(carClass)
      } else {
        next.add(carClass)
      }

      return next
    })
  }

  const filteredStandings = useMemo(
    () =>
      standings
        .filter((driver) => activeClasses.has(driver.carClass))
        .sort((left, right) => left.position - right.position),
    [activeClasses, standings]
  )

  return {
    connection,
    standings,
    filteredStandings,
    visibleCols,
    activeClasses,
    showColMenu,
    focusedSlotId,
    isHydrating,
    loadError,
    actionError,
    title: session ? session.trackName : 'No active session',
    sessionType: session ? session.sessionType : null,
    sessionCars: session ? `${session.numCarsOnTrack}/${session.numCars} on track` : null,
    colMenuRef,
    colButtonRef,
    setShowColMenu,
    clearActionError: () => setActionError(null),
    reloadWindowData,
    toggleCol,
    toggleClass,
    handleRowClick
  }
}
