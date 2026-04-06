import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import type { SessionSettings } from '../../../store/overlayStore'
import { SessionProgressBar } from './SessionProgressBar'
import { withAlpha } from './sessionOverlayUtils'

interface SessionInfoPanelProps {
  readonly settings: SessionSettings
  readonly headline: string
  readonly lapLabel: string
  readonly timeLabel: string
  readonly progress: number
  readonly accent: {
    accent: string
    glow: string
    muted: string
    border: string
  }
  readonly disableEnterAnimation: boolean
}

export function SessionInfoPanel({
  settings,
  headline,
  lapLabel,
  timeLabel,
  progress,
  accent,
  disableEnterAnimation
}: SessionInfoPanelProps): ReactElement {
  return (
    <motion.section
      initial={disableEnterAnimation ? false : { opacity: 0, y: -18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Session information overlay"
      style={{
        position: 'relative',
        width: 1120,
        minHeight: 430,
        borderRadius: 24,
        overflow: 'hidden',
        background: 'rgba(8, 10, 14, 0.88)',
        backdropFilter: 'blur(28px) saturate(1.28) brightness(0.76)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.28) brightness(0.76)',
        border: `2px solid ${withAlpha(accent.border, 'cc')}`,
        boxShadow: `0 0 0 1px ${withAlpha(accent.accent, '12')} inset, 0 0 40px ${withAlpha(
          accent.accent,
          '18'
        )}, inset 0 0 110px rgba(0,0,0,0.38)`,
        fontFamily: "'Arial Narrow', 'Bahnschrift Condensed', 'Roboto Condensed', sans-serif"
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 8% 16%, ${withAlpha(accent.accent, '36')}, transparent 26%), radial-gradient(circle at 50% 88%, ${withAlpha(accent.accent, '24')}, transparent 26%), linear-gradient(180deg, ${withAlpha(accent.muted, 'a8')} 0%, rgba(7,9,13,0.96) 40%, rgba(7,9,13,0.98) 100%)`,
          pointerEvents: 'none'
        }}
      />
      <motion.div
        animate={{ opacity: [0.72, 1, 0.72] }}
        transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: `inset 0 0 34px ${withAlpha(accent.accent, '1c')}`,
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, padding: '62px 70px 56px' }}>
        {settings.showTimeRemaining ? (
          <div
            style={{
              fontSize: 118,
              lineHeight: 0.88,
              fontWeight: 800,
              letterSpacing: '-0.06em',
              color: '#f8fafc',
              textShadow: '0 3px 14px rgba(0,0,0,0.42)'
            }}
          >
            {timeLabel}
          </div>
        ) : null}

        <div
          style={{
            marginTop: settings.showTimeRemaining ? 54 : 20,
            height: 1,
            background: 'rgba(248,250,252,0.46)'
          }}
        />

        <div style={{ marginTop: 28 }}>
          <SessionProgressBar progress={progress} accent={accent} />
        </div>

        <div
          style={{
            marginTop: 42,
            display: 'grid',
            gap: 18
          }}
        >
          <h1
            style={{
              maxWidth: 920,
              fontSize: 76,
              lineHeight: 0.94,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              textTransform: 'uppercase',
              textWrap: 'balance'
            }}
          >
            {headline}
          </h1>
          <div
            style={{
              fontSize: 56,
              lineHeight: 0.92,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              textTransform: 'uppercase'
            }}
          >
            {lapLabel}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
