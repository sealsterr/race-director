import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import type { GapTrend } from './gapTypes'
import { withAlpha } from './gapOverlayUtils'
import { GapCenterToneLayer } from './GapCenterToneLayer'
import { CENTER_FLOW_ROWS, flowMask } from './gapCenterTrendShapes'

const FLOW_DURATION_SECONDS = 1.92

export function GapCenterBurstField({
  side,
  trend,
  closingColor,
  growingColor,
  reduceMotion
}: {
  readonly side: 'left' | 'right'
  readonly trend: GapTrend
  readonly closingColor: string
  readonly growingColor: string
  readonly reduceMotion: boolean
}): ReactElement {
  return (
    <div style={stackStyle}>
      <GapCenterToneLayer active={trend === 'closing'}>
        <FlowField side={side} trend="closing" color={closingColor} reduceMotion={reduceMotion} />
      </GapCenterToneLayer>
      <GapCenterToneLayer active={trend === 'growing'}>
        <FlowField side={side} trend="growing" color={growingColor} reduceMotion={reduceMotion} />
      </GapCenterToneLayer>
    </div>
  )
}

function FlowField({
  side,
  trend,
  color,
  reduceMotion
}: {
  readonly side: 'left' | 'right'
  readonly trend: GapTrend
  readonly color: string
  readonly reduceMotion: boolean
}): ReactElement {
  const inward = trend === 'closing'
  const direction = side === 'left' ? (inward ? 1 : -1) : inward ? -1 : 1
  const justifyContent = side === 'left' ? 'flex-end' : 'flex-start'
  const sideOffset = side === 'left' ? -1 : 1

  return (
    <div style={laneStyle}>
      {CENTER_FLOW_ROWS.map((row) => (
        <div
          key={`${side}-${row.y}-${row.width}`}
          style={{
            ...rowStyle,
            justifyContent,
            transform: `translate(${sideOffset * row.inset}px, ${row.y}px)`
          }}
        >
          <div
            style={{
              ...trackStyle,
              width: row.width,
              maskImage: flowMask(side),
              WebkitMaskImage: flowMask(side)
            }}
          >
            <div style={{ ...baseRailStyle, background: withAlpha(color, '18') }} />
            <FlowPacket
              color={color}
              width={row.packet}
              direction={direction}
              reduceMotion={reduceMotion}
              delay={row.delay}
            />
            <FlowPacket
              color={color}
              width={Math.round(row.packet * 0.72)}
              direction={direction}
              reduceMotion={reduceMotion}
              delay={row.delay + FLOW_DURATION_SECONDS * 0.48}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function FlowPacket({
  color,
  width,
  direction,
  reduceMotion,
  delay
}: {
  readonly color: string
  readonly width: number
  readonly direction: 1 | -1
  readonly reduceMotion: boolean
  readonly delay: number
}): ReactElement {
  const start = direction * -122
  const end = direction * 174

  return (
    <motion.div
      initial={false}
      animate={
        reduceMotion
          ? { opacity: 0.42, x: 0 }
          : { opacity: [0, 0.92, 0.92, 0], x: [start, start * 0.12, end * 0.66, end] }
      }
      transition={{
        duration: reduceMotion ? 0.01 : FLOW_DURATION_SECONDS,
        ease: 'linear',
        delay: reduceMotion ? 0 : delay,
        repeat: reduceMotion ? 0 : Number.POSITIVE_INFINITY,
        repeatDelay: reduceMotion ? 0 : 0
      }}
      style={{
        ...packetStyle,
        width,
        background: `linear-gradient(90deg, ${withAlpha(color, '00')} 0%, ${withAlpha(color, '72')} 18%, ${color} 50%, ${withAlpha(color, '72')} 82%, ${withAlpha(color, '00')} 100%)`,
        boxShadow: `0 0 18px ${withAlpha(color, '6a')}`
      }}
    />
  )
}

const stackStyle = {
  display: 'grid',
  width: 276,
  minHeight: 1
}

const laneStyle = { display: 'grid', gap: 14 }
const rowStyle = { width: 276, display: 'flex' }

const trackStyle = {
  position: 'relative' as const,
  height: 10,
  overflow: 'hidden' as const
}

const baseRailStyle = {
  position: 'absolute' as const,
  inset: '3px 0',
  borderRadius: 999
}

const packetStyle = {
  position: 'absolute' as const,
  top: 0,
  height: 10,
  borderRadius: 999,
  filter: 'blur(0.2px)',
  willChange: 'transform, opacity'
}
