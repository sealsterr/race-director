import { useLayoutEffect, useRef, type RefObject } from 'react'

interface UseTowerWindowAutosizeOptions {
  readonly enabled: boolean
  readonly overlayId: string
  readonly scale: number
  readonly targetRef: RefObject<HTMLElement | null>
}

export function useTowerWindowAutosize({
  enabled,
  overlayId,
  scale,
  targetRef
}: UseTowerWindowAutosizeOptions): void {
  const lastSizeRef = useRef<{ width: number; height: number } | null>(null)

  useLayoutEffect(() => {
    if (!enabled) return

    const element = targetRef.current
    if (!element) return

    let frameId = 0

    const syncBounds = (): void => {
      frameId = 0

      const rect = element.getBoundingClientRect()
      const width = Math.max(1, Math.ceil(rect.width))
      const height = Math.max(1, Math.ceil(rect.height))
      const lastSize = lastSizeRef.current

      if (lastSize && lastSize.width === width && lastSize.height === height) {
        return
      }

      lastSizeRef.current = { width, height }

      void globalThis.api.overlay.getBounds(overlayId).then((bounds) => {
        if (!bounds) return
        if (bounds.width === width && bounds.height === height) return

        return globalThis.api.overlay.updateBounds(overlayId, bounds.x, bounds.y, width, height)
      })
    }

    const scheduleSync = (): void => {
      if (frameId !== 0) {
        cancelAnimationFrame(frameId)
      }
      frameId = requestAnimationFrame(syncBounds)
    }

    scheduleSync()

    const resizeObserver = new ResizeObserver(() => {
      scheduleSync()
    })
    resizeObserver.observe(element)
    globalThis.addEventListener('resize', scheduleSync)

    return () => {
      resizeObserver.disconnect()
      globalThis.removeEventListener('resize', scheduleSync)
      if (frameId !== 0) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [enabled, overlayId, scale, targetRef])
}
