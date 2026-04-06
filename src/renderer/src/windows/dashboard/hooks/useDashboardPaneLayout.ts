import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'

export const DASHBOARD_PANE_LAYOUT_STORAGE_KEY = 'race-director.dashboard.layout.v1'
export const DASHBOARD_LAYOUT_RESET_EVENT = 'rd:dashboardLayoutReset'
const DEFAULT_LAYOUT = {
  sidebarRatio: 256 / 1100,
  topRowRatio: 212 / 580,
  topPanelsRatio: 0.5
}
const SIDEBAR_MIN_PX = 220
const SIDEBAR_MAX_PX = 420
const MAIN_MIN_PX = 640
const PANEL_MIN_PX = 280
const TOP_ROW_MIN_PX = 220
const ACTIVITY_MIN_PX = 190
const KEYBOARD_STEP_PX = 24

type ResizeTarget = 'sidebar' | 'topPanels' | 'topRow'

interface DashboardPaneLayout {
  sidebarRatio: number
  topRowRatio: number
  topPanelsRatio: number
}

interface UseDashboardPaneLayoutResult {
  activeResizeTarget: ResizeTarget | null
  workspaceRef: RefObject<HTMLDivElement | null>
  mainColumnRef: RefObject<HTMLDivElement | null>
  topRowRef: RefObject<HTMLDivElement | null>
  sidebarWidth: string
  topRowHeight: string
  topPanelsWidth: string
  beginSidebarResize: (event: ReactPointerEvent<HTMLDivElement>) => void
  beginTopPanelsResize: (event: ReactPointerEvent<HTMLDivElement>) => void
  beginTopRowResize: (event: ReactPointerEvent<HTMLDivElement>) => void
  nudgeSidebar: (direction: 1 | -1) => void
  nudgeTopPanels: (direction: 1 | -1) => void
  nudgeTopRow: (direction: 1 | -1) => void
}

const clamp = (value: number, min: number, max: number): number => {
  if (max <= min) return min
  return Math.min(Math.max(value, min), max)
}

const parseStoredLayout = (): DashboardPaneLayout => {
  try {
    const raw = globalThis.localStorage.getItem(DASHBOARD_PANE_LAYOUT_STORAGE_KEY)
    if (!raw) return DEFAULT_LAYOUT
    const parsed = JSON.parse(raw) as Partial<DashboardPaneLayout>
    return {
      sidebarRatio:
        typeof parsed.sidebarRatio === 'number' ? parsed.sidebarRatio : DEFAULT_LAYOUT.sidebarRatio,
      topRowRatio:
        typeof parsed.topRowRatio === 'number' ? parsed.topRowRatio : DEFAULT_LAYOUT.topRowRatio,
      topPanelsRatio:
        typeof parsed.topPanelsRatio === 'number'
          ? parsed.topPanelsRatio
          : DEFAULT_LAYOUT.topPanelsRatio
    }
  } catch {
    return DEFAULT_LAYOUT
  }
}

const clampSidebarRatio = (ratio: number, totalWidth: number): number => {
  const maxPx = Math.min(SIDEBAR_MAX_PX, Math.max(SIDEBAR_MIN_PX, totalWidth - MAIN_MIN_PX))
  return clamp(ratio, SIDEBAR_MIN_PX / totalWidth, maxPx / totalWidth)
}

const clampTopPanelsRatio = (ratio: number, totalWidth: number): number => {
  const maxPx = Math.max(PANEL_MIN_PX, totalWidth - PANEL_MIN_PX)
  return clamp(ratio, PANEL_MIN_PX / totalWidth, maxPx / totalWidth)
}

const clampTopRowRatio = (ratio: number, totalHeight: number): number => {
  const maxPx = Math.max(TOP_ROW_MIN_PX, totalHeight - ACTIVITY_MIN_PX)
  return clamp(ratio, TOP_ROW_MIN_PX / totalHeight, maxPx / totalHeight)
}

const lockCursor = (cursor: 'col-resize' | 'row-resize'): (() => void) => {
  const rootStyle = document.documentElement.style
  const previousCursor = rootStyle.cursor
  const previousUserSelect = rootStyle.userSelect
  rootStyle.cursor = cursor
  rootStyle.userSelect = 'none'

  return () => {
    rootStyle.cursor = previousCursor
    rootStyle.userSelect = previousUserSelect
  }
}

const useDashboardPaneLayout = (): UseDashboardPaneLayoutResult => {
  const [layout, setLayout] = useState<DashboardPaneLayout>(parseStoredLayout)
  const [activeResizeTarget, setActiveResizeTarget] = useState<ResizeTarget | null>(null)
  const workspaceRef = useRef<HTMLDivElement | null>(null)
  const mainColumnRef = useRef<HTMLDivElement | null>(null)
  const topRowRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    globalThis.localStorage.setItem(DASHBOARD_PANE_LAYOUT_STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  useEffect(() => {
    const handleLayoutReset = (): void => {
      globalThis.localStorage.removeItem(DASHBOARD_PANE_LAYOUT_STORAGE_KEY)
      setLayout(DEFAULT_LAYOUT)
    }

    globalThis.addEventListener(DASHBOARD_LAYOUT_RESET_EVENT, handleLayoutReset)
    return () => {
      globalThis.removeEventListener(DASHBOARD_LAYOUT_RESET_EVENT, handleLayoutReset)
    }
  }, [])

  const clampLayoutToViewport = useCallback(() => {
    setLayout((current) => {
      const workspaceWidth = workspaceRef.current?.getBoundingClientRect().width
      const mainHeight = mainColumnRef.current?.getBoundingClientRect().height
      const topRowWidth = topRowRef.current?.getBoundingClientRect().width

      return {
        sidebarRatio:
          workspaceWidth && workspaceWidth > 0
            ? clampSidebarRatio(current.sidebarRatio, workspaceWidth)
            : current.sidebarRatio,
        topRowRatio:
          mainHeight && mainHeight > 0
            ? clampTopRowRatio(current.topRowRatio, mainHeight)
            : current.topRowRatio,
        topPanelsRatio:
          topRowWidth && topRowWidth > 0
            ? clampTopPanelsRatio(current.topPanelsRatio, topRowWidth)
            : current.topPanelsRatio
      }
    })
  }, [])

  useEffect(() => {
    clampLayoutToViewport()

    globalThis.addEventListener('resize', clampLayoutToViewport)
    return () => {
      globalThis.removeEventListener('resize', clampLayoutToViewport)
    }
  }, [clampLayoutToViewport])

  const beginPointerResize = useCallback(
    (
      event: ReactPointerEvent<HTMLDivElement>,
      target: ResizeTarget,
      cursor: 'col-resize' | 'row-resize',
      updateLayout: (moveEvent: PointerEvent) => void
    ) => {
      event.preventDefault()
      event.stopPropagation()
      setActiveResizeTarget(target)
      const releaseCursor = lockCursor(cursor)

      const handlePointerUp = (): void => {
        setActiveResizeTarget(null)
        releaseCursor()
        globalThis.removeEventListener('pointermove', handlePointerMove)
        globalThis.removeEventListener('pointerup', handlePointerUp)
        globalThis.removeEventListener('pointercancel', handlePointerUp)
      }

      const handlePointerMove = (moveEvent: PointerEvent): void => {
        updateLayout(moveEvent)
      }

      globalThis.addEventListener('pointermove', handlePointerMove)
      globalThis.addEventListener('pointerup', handlePointerUp)
      globalThis.addEventListener('pointercancel', handlePointerUp)
    },
    []
  )

  const beginSidebarResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      beginPointerResize(event, 'sidebar', 'col-resize', (moveEvent) => {
        const bounds = workspaceRef.current?.getBoundingClientRect()
        if (!bounds || bounds.width <= 0) return

        setLayout((current) => ({
          ...current,
          sidebarRatio: clampSidebarRatio(
            (moveEvent.clientX - bounds.left) / bounds.width,
            bounds.width
          )
        }))
      })
    },
    [beginPointerResize]
  )

  const beginTopPanelsResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      beginPointerResize(event, 'topPanels', 'col-resize', (moveEvent) => {
        const bounds = topRowRef.current?.getBoundingClientRect()
        if (!bounds || bounds.width <= 0) return

        setLayout((current) => ({
          ...current,
          topPanelsRatio: clampTopPanelsRatio(
            (moveEvent.clientX - bounds.left) / bounds.width,
            bounds.width
          )
        }))
      })
    },
    [beginPointerResize]
  )

  const beginTopRowResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      beginPointerResize(event, 'topRow', 'row-resize', (moveEvent) => {
        const bounds = mainColumnRef.current?.getBoundingClientRect()
        if (!bounds || bounds.height <= 0) return

        setLayout((current) => ({
          ...current,
          topRowRatio: clampTopRowRatio(
            (moveEvent.clientY - bounds.top) / bounds.height,
            bounds.height
          )
        }))
      })
    },
    [beginPointerResize]
  )

  const nudgeSidebar = useCallback((direction: 1 | -1) => {
    const width = workspaceRef.current?.getBoundingClientRect().width
    if (!width || width <= 0) return

    setLayout((current) => ({
      ...current,
      sidebarRatio: clampSidebarRatio(
        current.sidebarRatio + (KEYBOARD_STEP_PX * direction) / width,
        width
      )
    }))
  }, [])

  const nudgeTopPanels = useCallback((direction: 1 | -1) => {
    const width = topRowRef.current?.getBoundingClientRect().width
    if (!width || width <= 0) return

    setLayout((current) => ({
      ...current,
      topPanelsRatio: clampTopPanelsRatio(
        current.topPanelsRatio + (KEYBOARD_STEP_PX * direction) / width,
        width
      )
    }))
  }, [])

  const nudgeTopRow = useCallback((direction: 1 | -1) => {
    const height = mainColumnRef.current?.getBoundingClientRect().height
    if (!height || height <= 0) return

    setLayout((current) => ({
      ...current,
      topRowRatio: clampTopRowRatio(
        current.topRowRatio + (KEYBOARD_STEP_PX * direction) / height,
        height
      )
    }))
  }, [])

  return {
    activeResizeTarget,
    workspaceRef,
    mainColumnRef,
    topRowRef,
    sidebarWidth: `${layout.sidebarRatio * 100}%`,
    topRowHeight: `${layout.topRowRatio * 100}%`,
    topPanelsWidth: `${layout.topPanelsRatio * 100}%`,
    beginSidebarResize,
    beginTopPanelsResize,
    beginTopRowResize,
    nudgeSidebar,
    nudgeTopPanels,
    nudgeTopRow
  }
}

export default useDashboardPaneLayout
