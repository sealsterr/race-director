import { useEffect, useMemo, useState } from 'react'

const DASHBOARD_BASE_WIDTH = 1100
const DASHBOARD_BASE_HEIGHT = 700
const MAX_RESPONSIVE_SCALE = 1.12
const MIN_RESPONSIVE_SCALE = 0.94

interface DashboardViewportScaleResult {
  scale: number
}

const getViewportSize = (): { width: number; height: number } => ({
  width: Math.max(globalThis.innerWidth, 1),
  height: Math.max(globalThis.innerHeight, 1)
})

const useDashboardViewportScale = (): DashboardViewportScaleResult => {
  const [viewportSize, setViewportSize] = useState(getViewportSize)

  useEffect(() => {
    let frameId = 0

    const handleResize = (): void => {
      if (frameId !== 0) {
        globalThis.cancelAnimationFrame(frameId)
      }

      frameId = globalThis.requestAnimationFrame(() => {
        frameId = 0
        setViewportSize(getViewportSize())
      })
    }

    globalThis.addEventListener('resize', handleResize)
    return () => {
      if (frameId !== 0) {
        globalThis.cancelAnimationFrame(frameId)
      }
      globalThis.removeEventListener('resize', handleResize)
    }
  }, [])

  const scale = useMemo(() => {
    const fitScale = Math.min(
      viewportSize.width / DASHBOARD_BASE_WIDTH,
      viewportSize.height / DASHBOARD_BASE_HEIGHT
    )

    const responsiveScale =
      fitScale >= 1
        ? Math.min(MAX_RESPONSIVE_SCALE, 1 + (fitScale - 1) * 0.22)
        : Math.max(MIN_RESPONSIVE_SCALE, fitScale)

    return responsiveScale
  }, [viewportSize.height, viewportSize.width])

  useEffect(() => {
    const root = document.documentElement
    const previousFontSize = root.style.fontSize

    root.style.fontSize = `${16 * scale}px`

    return () => {
      root.style.fontSize = previousFontSize
    }
  }, [scale])

  return { scale }
}

export default useDashboardViewportScale
