import { useEffect, useMemo, useRef, useState } from 'react'
import { useOverlayStore } from '../../../store/overlayStore'
import type { OverlayConfig, SessionSettings } from '../../../store/overlayStore'
import type { SessionInfo } from '../../../types/lmu'
import { useBufferedAppState } from '../tower/useBufferedAppState'
import { SESSION_PREVIEW_SEQUENCE, SESSION_PREVIEW_STEP_MS } from './sessionPreviewData'
import {
  SESSION_OVERLAY_DEFAULT_SETTINGS,
  formatRemainingTime,
  getLapLabel,
  getSessionAccent,
  getSessionHeadline,
  getSessionProgress
} from './sessionOverlayUtils'

interface SessionOverlayData {
  readonly session: SessionInfo
  readonly settings: SessionSettings
  readonly headline: string
  readonly lapLabel: string
  readonly timeLabel: string
  readonly progress: number
  readonly accent: ReturnType<typeof getSessionAccent>
  readonly dragMode: boolean
  readonly opacity: number
  readonly scale: number
  readonly isConfigReady: boolean
}

interface RemainingClock {
  readonly baseSeconds: number
  readonly basePerf: number
}

export function useSessionOverlayData(): SessionOverlayData {
  const appState = useBufferedAppState(250)
  const storeConfig = useOverlayStore(
    (state) => state.getOverlay('OVERLAY-SESSION') as OverlayConfig<SessionSettings> | undefined
  )
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig<SessionSettings>>(
    storeConfig ?? {
      id: 'OVERLAY-SESSION',
      enabled: false,
      opacity: 90,
      scale: 1,
      x: 20,
      y: 20,
      displayId: 0,
      dragMode: false,
      settings: SESSION_OVERLAY_DEFAULT_SETTINGS
    }
  )
  const [isConfigReady, setIsConfigReady] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [displayRemaining, setDisplayRemaining] = useState(SESSION_PREVIEW_SEQUENCE[0].timeRemaining)
  const previewTickRef = useRef(0)
  const remainingClockRef = useRef<RemainingClock>({
    baseSeconds: SESSION_PREVIEW_SEQUENCE[0].timeRemaining,
    basePerf: performance.now()
  })

  useEffect(() => {
    if (storeConfig) {
      setOverlayConfig(storeConfig)
    }
  }, [storeConfig])

  useEffect(() => {
    let cancelled = false

    void globalThis.api?.overlay
      ?.getConfig?.('OVERLAY-SESSION')
      .then((raw: unknown) => {
        if (cancelled || !raw) return

        const incoming = raw as OverlayConfig<SessionSettings>
        if (incoming?.id !== 'OVERLAY-SESSION') return
        setOverlayConfig({
          ...incoming,
          settings: { ...SESSION_OVERLAY_DEFAULT_SETTINGS, ...incoming.settings }
        })
        setIsConfigReady(true)
      })
      .finally(() => {
        if (!cancelled) {
          setIsConfigReady(true)
        }
      })

    const unsubscribe = globalThis.api?.overlay?.onConfigUpdate?.((raw: unknown) => {
      const incoming = raw as OverlayConfig<SessionSettings>
      if (incoming?.id !== 'OVERLAY-SESSION') return

      setOverlayConfig({
        ...incoming,
        settings: { ...SESSION_OVERLAY_DEFAULT_SETTINGS, ...incoming.settings }
      })
      setIsConfigReady(true)
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    const timerId = window.setInterval(() => {
      previewTickRef.current += 1
      setPreviewIndex((current) => (current + 1) % SESSION_PREVIEW_SEQUENCE.length)
    }, SESSION_PREVIEW_STEP_MS)

    return () => window.clearInterval(timerId)
  }, [])

  const isPreview = appState.connection !== 'CONNECTED' || appState.session === null
  const liveSession = appState.session
  const previewSession = SESSION_PREVIEW_SEQUENCE[previewIndex]
  const session = (isPreview ? previewSession : liveSession) as SessionInfo
  const settings = { ...SESSION_OVERLAY_DEFAULT_SETTINGS, ...overlayConfig.settings }
  const remainingAnchorKey = isPreview ? previewTickRef.current : appState.lastUpdated ?? session.timeRemaining

  useEffect(() => {
    remainingClockRef.current = {
      baseSeconds: session.timeRemaining,
      basePerf: performance.now()
    }
    setDisplayRemaining(session.timeRemaining)
  }, [remainingAnchorKey, session.timeRemaining])

  useEffect(() => {
    let frameId = 0

    const tick = (now: number): void => {
      const elapsedSeconds = (now - remainingClockRef.current.basePerf) / 1000
      const nextRemaining = Math.max(0, remainingClockRef.current.baseSeconds - elapsedSeconds)
      setDisplayRemaining(nextRemaining)

      if (nextRemaining > 0) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [remainingAnchorKey])

  const accent = useMemo(() => getSessionAccent(settings.colorScheme), [settings.colorScheme])

  return {
    session,
    settings,
    headline: getSessionHeadline(session, settings),
    lapLabel: getLapLabel(session, settings.showLapCount),
    timeLabel: formatRemainingTime(displayRemaining),
    progress: getSessionProgress(session, displayRemaining),
    accent,
    dragMode: overlayConfig.dragMode,
    opacity: overlayConfig.opacity / 100,
    scale: overlayConfig.scale,
    isConfigReady
  }
}
