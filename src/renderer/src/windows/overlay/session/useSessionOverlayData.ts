import { useEffect, useMemo, useRef, useState } from 'react'
import { useOverlayStore } from '../../../store/overlayStore'
import type { OverlayConfig, SessionSettings } from '../../../store/overlayStore'
import type { FlagState, SessionInfo } from '../../../types/lmu'
import { useBufferedAppState } from '../tower/useBufferedAppState'
import { SESSION_PREVIEW_SEQUENCE, SESSION_PREVIEW_STEP_MS } from './sessionPreviewData'
import {
  SESSION_OVERLAY_DEFAULT_SETTINGS,
  formatRemainingTime,
  getFlagAlertBarState,
  getLapLabel,
  getSessionAccent,
  isFlagAlert,
  type SessionFlagBarState,
  getSessionHeadline,
  getSessionProgress
} from './sessionOverlayUtils'

interface SessionOverlayData {
  readonly session: SessionInfo
  readonly settings: SessionSettings
  readonly customLabel: string
  readonly headline: string
  readonly lapLabel: string
  readonly timeLabel: string
  readonly progress: number
  readonly flagBarState: SessionFlagBarState
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

interface SessionSnapshot {
  readonly trackName: string
  readonly sessionType: SessionInfo['sessionType']
  readonly currentLap: number
  readonly sessionTime: number
  readonly timeRemaining: number
}

export function useSessionOverlayData(): SessionOverlayData {
  const appState = useBufferedAppState(250)
  const storeConfig = useOverlayStore((state) => state.getOverlay('OVERLAY-SESSION'))
  const canLoadInitialConfig = Boolean(globalThis.api?.overlay?.getConfig)
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig<SessionSettings>>(
    storeConfig ?? {
      id: 'OVERLAY-SESSION',
      enabled: false,
      opacity: 90,
      scale: 1,
      x: 20,
      y: 22,
      displayId: 0,
      dragMode: false,
      settings: SESSION_OVERLAY_DEFAULT_SETTINGS
    }
  )
  const [isConfigReady, setIsConfigReady] = useState(!canLoadInitialConfig)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [displayRemaining, setDisplayRemaining] = useState(
    SESSION_PREVIEW_SEQUENCE[0].timeRemaining
  )
  const [flagBarState, setFlagBarState] = useState<SessionFlagBarState>('default')
  const remainingClockRef = useRef<RemainingClock>({
    baseSeconds: SESSION_PREVIEW_SEQUENCE[0].timeRemaining,
    basePerf: 0
  })
  const previousFlagStateRef = useRef<FlagState | null>(null)
  const previousSessionRef = useRef<SessionSnapshot | null>(null)
  const chequeredLatchedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    const configPromise = globalThis.api?.overlay?.getConfig?.('OVERLAY-SESSION')

    if (configPromise) {
      void configPromise
        .then((incoming) => {
          if (cancelled || !incoming) return
          if (incoming?.id !== 'OVERLAY-SESSION') return
          setOverlayConfig({
            ...incoming,
            settings: { ...SESSION_OVERLAY_DEFAULT_SETTINGS, ...incoming.settings }
          })
          setIsConfigReady(true)
        })
        .catch((error) => {
          console.warn('Failed to load session overlay config:', error)
        })
        .finally(() => {
          if (!cancelled) {
            setIsConfigReady(true)
          }
        })
    }

    const unsubscribe = globalThis.api?.overlay?.onConfigUpdate?.((incoming) => {
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
  }, [canLoadInitialConfig])

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setPreviewIndex((current) => (current + 1) % SESSION_PREVIEW_SEQUENCE.length)
    }, SESSION_PREVIEW_STEP_MS)

    return () => window.clearInterval(timerId)
  }, [])

  const isPreview = appState.connection !== 'CONNECTED' || appState.session === null
  const liveSession = appState.session
  const previewSession = SESSION_PREVIEW_SEQUENCE[previewIndex]
  const session = (isPreview ? previewSession : liveSession) as SessionInfo
  const settings = { ...SESSION_OVERLAY_DEFAULT_SETTINGS, ...overlayConfig.settings }
  const remainingAnchorKey = isPreview
    ? previewIndex
    : (appState.lastUpdated ?? session.timeRemaining)

  useEffect(() => {
    let frameId = 0

    remainingClockRef.current = {
      baseSeconds: session.timeRemaining,
      basePerf: performance.now()
    }

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
  }, [remainingAnchorKey, session.timeRemaining])

  useEffect(() => {
    const previousFlagState = previousFlagStateRef.current
    const currentFlagState = session.flagState
    const previousSession = previousSessionRef.current
    let applyTimer = 0
    let clearTransitionTimer = 0
    const hasSessionReset =
      previousSession !== null &&
      (previousSession.trackName !== session.trackName ||
        previousSession.sessionType !== session.sessionType ||
        session.sessionTime + 5 < previousSession.sessionTime ||
        session.timeRemaining > previousSession.timeRemaining + 30 ||
        session.currentLap < previousSession.currentLap)

    if (hasSessionReset) {
      chequeredLatchedRef.current = false
    }

    if (currentFlagState === 'CHEQUERED' || chequeredLatchedRef.current) {
      chequeredLatchedRef.current = true
      applyTimer = window.setTimeout(() => {
        setFlagBarState('chequered')
      }, 0)
    } else if (isFlagAlert(currentFlagState)) {
      applyTimer = window.setTimeout(() => {
        setFlagBarState(getFlagAlertBarState(currentFlagState))
      }, 0)
    } else if (previousFlagState !== null && isFlagAlert(previousFlagState)) {
      applyTimer = window.setTimeout(() => {
        setFlagBarState('green')
      }, 0)
      clearTransitionTimer = window.setTimeout(() => {
        setFlagBarState('default')
      }, 3000)
    } else {
      applyTimer = window.setTimeout(() => {
        setFlagBarState('default')
      }, 0)
    }

    previousFlagStateRef.current = currentFlagState
    previousSessionRef.current = {
      trackName: session.trackName,
      sessionType: session.sessionType,
      currentLap: session.currentLap,
      sessionTime: session.sessionTime,
      timeRemaining: session.timeRemaining
    }
    return () => {
      window.clearTimeout(applyTimer)
      window.clearTimeout(clearTransitionTimer)
    }
  }, [
    session.currentLap,
    session.flagState,
    session.sessionTime,
    session.sessionType,
    session.timeRemaining,
    session.trackName
  ])

  const accent = useMemo(
    () => getSessionAccent(settings.progressBarColor),
    [settings.progressBarColor]
  )
  const customLabel = settings.customLabel.trim() || SESSION_OVERLAY_DEFAULT_SETTINGS.customLabel

  return {
    session,
    settings,
    customLabel,
    headline: getSessionHeadline(session, settings),
    lapLabel: getLapLabel(session, settings.showLapCount),
    timeLabel: formatRemainingTime(displayRemaining),
    progress: getSessionProgress(session, displayRemaining, session.totalSessionTime),
    flagBarState,
    accent,
    dragMode: overlayConfig.dragMode,
    opacity: overlayConfig.opacity / 100,
    scale: overlayConfig.scale,
    isConfigReady
  }
}
