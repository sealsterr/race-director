import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { withAlpha } from './sessionOverlayUtils'

interface SessionProgressBarProps {
  readonly progress: number
  readonly animatePulse: boolean
  readonly accent: {
    accent: string
    glow: string
    border: string
  }
}

export function SessionProgressBar({
  progress,
  animatePulse,
  accent
}: SessionProgressBarProps): ReactElement {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const pulseTravelSeconds = 1
  const pulsePauseSeconds = 1
  const pulseCycleSeconds = pulseTravelSeconds + pulsePauseSeconds

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'relative',
        height: 6,
        background: 'rgba(255, 255, 255, 0.06)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: `${clampedProgress * 100}%`,
          background: `linear-gradient(90deg, ${accent.accent} 0%, ${accent.glow} 100%)`,
          boxShadow: `0 0 14px ${withAlpha(accent.accent, '80')}`,
          willChange: 'width'
        }}
      >
        {animatePulse ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              maskImage: 'linear-gradient(90deg, #000 0%, #000 88%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(90deg, #000 0%, #000 88%, transparent 100%)'
            }}
          >
            <motion.span
              animate={{
                left: ['-26%', '0%', '74%', '90%', '100%', '100%'],
                opacity: [0, 0.55, 1, 0.75, 0, 0]
              }}
              transition={{
                duration: pulseCycleSeconds,
                ease: 'linear',
                repeat: Number.POSITIVE_INFINITY,
                times: [0, 0.12, 0.4, 0.46, pulseTravelSeconds / pulseCycleSeconds, 1]
              }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '0%',
                width: '26%',
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.48) 50%, rgba(255,255,255,0) 100%)',
                mixBlendMode: 'screen'
              }}
            />
          </div>
        ) : null}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderTop: `1px solid ${withAlpha(accent.border, '35')}`
        }}
      />
    </div>
  )
}
