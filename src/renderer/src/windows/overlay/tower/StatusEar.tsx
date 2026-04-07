import type { ReactElement } from 'react'
import { motion } from 'framer-motion'

export const STATUS_EAR_GUTTER = 60

export type StatusEarVariant = 'pit' | 'finish'

interface StatusEarProps {
  readonly accentColor: string
  readonly animDuration: number
  readonly label: string
  readonly variant: StatusEarVariant
}

function getStripeBackground(variant: StatusEarVariant, accentColor: string): string {
  if (variant === 'finish') {
    return `repeating-linear-gradient(
            180deg,
            ${accentColor} 0 4px,
            rgba(8, 9, 14, 0.9) 4px 8px
        )`
  }

  return accentColor
}

export default function StatusEar({
  accentColor,
  animDuration,
  label,
  variant
}: StatusEarProps): ReactElement {
  return (
    <motion.div
      initial={{ x: -14, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -14, opacity: 0 }}
      transition={{ duration: animDuration, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: '50%',
        left: 'calc(100% + 4px)',
        transform: 'translateY(-50%)',
        height: 20,
        minWidth: 46,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 9px 0 11px',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(8, 9, 14, 0.82)',
        backdropFilter: 'blur(18px) saturate(1.35) brightness(0.72)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.35) brightness(0.72)',
        color: accentColor,
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        lineHeight: 1,
        boxShadow: '0 4px 18px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'hidden'
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 3,
          bottom: 3,
          width: 3,
          borderRadius: 999,
          background: getStripeBackground(variant, accentColor),
          boxShadow: `0 0 10px ${accentColor}66`,
          pointerEvents: 'none'
        }}
      />
      <span
        style={{
          position: 'relative',
          top: -0.5,
          textShadow: `0 0 10px ${accentColor}22`
        }}
      >
        {label}
      </span>
    </motion.div>
  )
}
