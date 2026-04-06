import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { withAlpha } from './sessionOverlayUtils'

interface SessionProgressBarProps {
  readonly progress: number
  readonly accent: {
    accent: string
    glow: string
    border: string
  }
}

export function SessionProgressBar({
  progress,
  accent
}: SessionProgressBarProps): ReactElement {
  const width = progress <= 0 ? '0%' : `${Math.max(4, progress * 100)}%`

  return (
    <div
      style={{
        position: 'relative',
        height: 36,
        borderRadius: 999,
        overflow: 'hidden',
        border: `2px solid ${withAlpha(accent.border, 'b8')}`,
        background: 'rgba(7,10,12,0.92)',
        boxShadow: `0 0 0 1px ${withAlpha(accent.accent, '18')} inset, 0 0 30px ${withAlpha(
          accent.accent,
          '1c'
        )}`
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${withAlpha(accent.accent, '10')} 0%, transparent 36%)`
        }}
      />
      <motion.div
        animate={{ width }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          height: '100%',
          margin: 3,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${accent.accent} 0%, #19ff7a 60%, ${accent.glow} 100%)`,
          boxShadow: `0 0 18px ${withAlpha(accent.accent, '90')}, 0 0 42px ${withAlpha(
            accent.accent,
            '45'
          )}`
        }}
      >
        <motion.span
          animate={{ x: ['-35%', '115%'] }}
          transition={{ duration: 1.8, ease: 'linear', repeat: Number.POSITIVE_INFINITY }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '40%',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.52) 50%, transparent 100%)',
            mixBlendMode: 'screen'
          }}
        />
      </motion.div>
    </div>
  )
}
