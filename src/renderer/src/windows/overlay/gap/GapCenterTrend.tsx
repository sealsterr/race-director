import type { ReactElement } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { GapTrend } from './gapTypes'
import { formatGapTime, withAlpha } from './gapOverlayUtils'
import { GapCenterBurstField } from './GapCenterBurstField'
import { GapCenterToneLayer } from './GapCenterToneLayer'

export function GapCenterTrend({
  gapSeconds,
  trend,
  color,
  closingColor,
  growingColor
}: {
  readonly gapSeconds: number
  readonly trend: GapTrend
  readonly color: string
  readonly closingColor: string
  readonly growingColor: string
}): ReactElement {
  const reduceMotion = useReducedMotion()

  return (
    <div style={centerWrapStyle}>
      <GapCenterToneLayer active={trend === 'closing'}>
        <div style={centerGlowStyle(closingColor)} />
      </GapCenterToneLayer>
      <GapCenterToneLayer active={trend === 'growing'}>
        <div style={centerGlowStyle(growingColor)} />
      </GapCenterToneLayer>
      <GapCenterBurstField
        side="left"
        trend={trend}
        closingColor={closingColor}
        growingColor={growingColor}
        reduceMotion={Boolean(reduceMotion)}
      />
      <div style={valueWrapStyle}>
        <motion.div
          animate={gapValueStyle(color)}
          transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {formatGapTime(gapSeconds)}
        </motion.div>
      </div>
      <GapCenterBurstField
        side="right"
        trend={trend}
        closingColor={closingColor}
        growingColor={growingColor}
        reduceMotion={Boolean(reduceMotion)}
      />
    </div>
  )
}

function centerGlowStyle(color: string) {
  return {
    position: 'absolute' as const,
    inset: '-34px 6px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${withAlpha(color, '2b')} 0%, ${withAlpha(color, '12')} 40%, transparent 76%)`,
    filter: 'blur(26px)',
    pointerEvents: 'none' as const
  }
}

const centerWrapStyle = {
  position: 'relative' as const,
  width: 760,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const valueWrapStyle = {
  position: 'relative' as const,
  zIndex: 1,
  minWidth: 142,
  marginInline: 4,
  textAlign: 'center' as const
}

function gapValueStyle(color: string) {
  return {
    color,
    fontSize: 64,
    fontWeight: 800,
    lineHeight: 0.92,
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
    textShadow: `0 0 26px ${withAlpha(color, '3d')}`
  }
}
