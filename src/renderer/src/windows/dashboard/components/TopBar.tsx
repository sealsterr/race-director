import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, Loader, AlertTriangle } from 'lucide-react'
import type { ConnectionStatus } from '../../../types/lmu'

interface TopBarProps {
  connection: ConnectionStatus
}

const connectionConfig: Record<
  ConnectionStatus,
  { label: string; color: string; borderBg: string; icon: React.ReactElement }
> = {
  CONNECTED: {
    label: 'CONNECTED',
    color: 'text-rd-accent',
    borderBg: 'border-rd-accent/30 bg-rd-accent/10',
    icon: <Wifi size={13} />
  },
  CONNECTING: {
    label: 'CONNECTING',
    color: 'text-rd-accent',
    borderBg: 'border-rd-accent/30 bg-rd-accent/10',
    icon: <Loader size={13} className="animate-spin" />
  },
  DISCONNECTED: {
    label: 'DISCONNECTED',
    color: 'text-rd-accent',
    borderBg: 'border-rd-accent/30 bg-rd-accent/10',
    icon: <WifiOff size={13} />
  },
  ERROR: {
    label: 'ERROR',
    color: 'text-rd-accent',
    borderBg: 'border-rd-accent/30 bg-rd-accent/10',
    icon: <AlertTriangle size={13} />
  }
}

interface WindowControlsOverlayLike {
  visible: boolean
  getTitlebarAreaRect: () => DOMRect
  addEventListener: (type: 'geometrychange', listener: () => void) => void
  removeEventListener: (type: 'geometrychange', listener: () => void) => void
}

type OverlayInsets = { left: number; right: number; height: number }
const MIN_WINDOW_CONTROLS_WIDTH = 138
const DEFAULT_OVERLAY_INSETS: OverlayInsets = { left: 0, right: 160, height: 56 }

const getWindowControlsOverlay = (): WindowControlsOverlayLike | undefined => {
  const navigatorWithOverlay = navigator as Navigator & {
    windowControlsOverlay?: WindowControlsOverlayLike
  }

  return navigatorWithOverlay.windowControlsOverlay
}

const computeOverlayInsets = (fallback: OverlayInsets = DEFAULT_OVERLAY_INSETS): OverlayInsets => {
  const wco = getWindowControlsOverlay()
  if (!wco?.visible) return fallback

  const rect = wco.getTitlebarAreaRect()

  // Space outside the safe titlebar rect belongs to native window controls.
  const left = Math.max(0, Math.round(rect.x))
  const right = Math.max(0, Math.round(window.innerWidth - (rect.x + rect.width)))
  const height = Math.max(0, Math.round(rect.height))

  const looksInvalid = height === 0 || (left === 0 && right === 0)
  if (looksInvalid) return fallback

  return { left, right, height }
}

const TopBar = ({ connection }: TopBarProps): React.ReactElement => {
  const [time, setTime] = useState(new Date())
  const [overlayInsets, setOverlayInsets] = useState<OverlayInsets>(DEFAULT_OVERLAY_INSETS)

  const BASE_PAD_PX = 20
  const CONTROLS_GAP_PX = 16

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const update = (): void => {
      setOverlayInsets((current) => computeOverlayInsets(current))
    }

    update()

    const wco = getWindowControlsOverlay()
    if (!wco) return
    wco.addEventListener('geometrychange', update)
    window.addEventListener('resize', update)

    return () => {
      wco.removeEventListener('geometrychange', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const cfg = connectionConfig[connection]

  const pad = (n: number): string => String(n).padStart(2, '0')
  const timeString = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
  const dateString = time.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
  const barHeight = Math.max(56, overlayInsets.height || 56)
  const safeRightInset = Math.max(overlayInsets.right, MIN_WINDOW_CONTROLS_WIDTH)

  const containerStyle = useMemo(() => {
    return {
      WebkitAppRegion: 'drag' as const,
      height: barHeight,
      paddingLeft: overlayInsets.left + BASE_PAD_PX,
      paddingRight: safeRightInset + CONTROLS_GAP_PX
    }
  }, [barHeight, overlayInsets.left, safeRightInset])

  return (
    <div
      style={containerStyle}
      className="relative flex w-full shrink-0 items-center justify-between overflow-hidden bg-rd-surface px-5"
      aria-label="Dashboard title bar"
      role="banner"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-px bg-rd-border"
        style={{ right: safeRightInset }}
      />

      <div
        aria-hidden="true"
        className="rd-titlebar-controls-strip pointer-events-none absolute right-0 top-0 z-10 h-full"
        style={{ width: safeRightInset, background: 'var(--rd-titlebar-controls-surface)' }}
      >
        <div aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-rd-border" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 h-px w-full bg-rd-border" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-10 h-full border-r border-rd-border bg-rd-elevated/50"
        style={{ width: overlayInsets.left }}
      />

      <div className="relative z-20 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-[0.2em] text-rd-logo-primary">Race</span>
          <span className="text-sm font-light tracking-[0.2em] text-rd-logo-secondary">
            Director
          </span>
        </div>
        <div className="h-4 w-px bg-rd-border" />
        <span className="font-mono text-xs text-rd-subtle">v0.2.0-pre</span>
      </div>

      <div className="relative z-20 flex items-center gap-4">
        <div className="text-right">
          <p className="font-mono text-sm font-medium text-rd-text">{timeString}</p>
          <p className="font-mono text-xs text-rd-subtle">{dateString}</p>
        </div>

        <div className="h-6 w-px bg-rd-border" />

        <motion.div
          key={connection}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            flex items-center gap-1.5 rounded border px-3 py-1.5
            font-mono text-xs font-medium
            ${cfg.color}
            ${cfg.borderBg}
          `}
        >
          {cfg.icon}
          <span>{cfg.label}</span>
        </motion.div>
      </div>
    </div>
  )
}

export default TopBar
