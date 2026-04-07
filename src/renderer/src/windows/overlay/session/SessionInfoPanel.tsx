import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import type { SessionSettings } from '../../../store/overlayStore'
import { SessionFlagIndicator } from './SessionFlagIndicator'
import { SessionProgressBar } from './SessionProgressBar'
import type { SessionFlagBarState } from './sessionOverlayUtils'

interface SessionInfoPanelProps {
  readonly settings: SessionSettings
  readonly customLabel: string
  readonly headline: string
  readonly lapLabel: string
  readonly timeLabel: string
  readonly progress: number
  readonly flagBarState: SessionFlagBarState
  readonly accent: {
    accent: string
    glow: string
    border: string
  }
  readonly disableEnterAnimation: boolean
}

export function SessionInfoPanel({
  settings,
  customLabel,
  headline,
  lapLabel,
  timeLabel,
  progress,
  flagBarState,
  accent,
  disableEnterAnimation
}: SessionInfoPanelProps): ReactElement {
  return (
    <motion.section
      initial={disableEnterAnimation ? false : { opacity: 0, y: -10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Session information overlay"
      style={{
        position: 'relative',
        width: 320,
        minHeight: 78,
        padding: '0 12px 6px',
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: 'rgba(8, 9, 14, 0.75)',
        backdropFilter: 'blur(18px) saturate(1.4) brightness(0.7)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.4) brightness(0.7)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0
        }}
      >
        <SessionFlagIndicator flagBarState={flagBarState} />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 28%, transparent 100%)',
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gap: 6,
          minHeight: 70,
          alignContent: 'center',
          paddingTop: 2
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: settings.showLapCount ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr)',
            alignItems: 'center',
            gap: settings.showLapCount ? 12 : 0,
            minHeight: 11
          }}
        >
          <span
            style={{
              minWidth: 0,
              fontSize: 10,
              lineHeight: 1,
              fontWeight: 500,
              letterSpacing: '0.05em',
              color: 'rgba(226, 232, 240, 0.8)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {customLabel}
          </span>
          {settings.showLapCount ? (
            <span
              style={{
                fontSize: 11,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: 'rgba(236, 240, 248, 0.88)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}
            >
              {lapLabel}
            </span>
          ) : null}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            alignItems: 'end',
            gap: 14
          }}
        >
          <h1
            style={{
              minWidth: 0,
              margin: 0,
              fontSize: 23,
              lineHeight: 0.92,
              fontWeight: 900,
              letterSpacing: '0.06em',
              color: '#f2f5fa',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {headline}
          </h1>
          {settings.showTimeRemaining ? (
            <div
              style={{
                fontSize: 25,
                lineHeight: 0.9,
                fontWeight: 800,
                letterSpacing: '0.02em',
                color: '#f2f5fa',
                whiteSpace: 'nowrap',
                fontVariantNumeric: 'tabular-nums',
                textShadow: '0 1px 10px rgba(0,0,0,0.28)'
              }}
            >
              {timeLabel}
            </div>
          ) : null}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        <SessionProgressBar
          progress={progress}
          animatePulse={settings.animateProgressPulse}
          accent={accent}
        />
      </div>
    </motion.section>
  )
}
