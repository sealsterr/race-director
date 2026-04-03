import type { ReactElement } from 'react'
import type { TyreCompound, TyreSet } from '../../../types/lmu'
import { GapTyreDisplay } from './GapTyreDisplay'

export function GapTelemetryStrip({
  tyre,
  tyreSet,
  speed,
  speedLabel,
  gear,
  align
}: {
  readonly tyre: TyreCompound
  readonly tyreSet: TyreSet | null
  readonly speed: string
  readonly speedLabel: string
  readonly gear: string
  readonly align: 'left' | 'right'
}): ReactElement {
  return (
    <div style={stripWrapStyle}>
      <div style={gridStyle(align)}>
        {align === 'left' ? (
          <>
            <GapTyreDisplay tyre={tyre} tyreSet={tyreSet} />
            <div />
            <MetricValue value={gear} compact />
            <MetricValue value={speed} />
            <MetricLabel label="Tyre" />
            <div />
            <MetricLabel label="Gear" />
            <MetricLabel label={speedLabel} />
          </>
        ) : (
          <>
            <MetricValue value={speed} />
            <MetricValue value={gear} compact />
            <div />
            <GapTyreDisplay tyre={tyre} tyreSet={tyreSet} />
            <MetricLabel label={speedLabel} />
            <MetricLabel label="Gear" />
            <div />
            <MetricLabel label="Tyre" />
          </>
        )}
      </div>
    </div>
  )
}

function MetricValue({
  value,
  compact = false
}: {
  readonly value: string
  readonly compact?: boolean
}): ReactElement {
  return <div style={valueStyle(compact)}>{value}</div>
}

function MetricLabel({ label }: { readonly label: string }): ReactElement {
  return <div style={labelStyle}>{label}</div>
}

const stripWrapStyle = {
  marginTop: 18,
  paddingTop: 14,
  borderTop: '1px solid rgba(255,255,255,0.08)'
}

function gridStyle(align: 'left' | 'right') {
  return {
    display: 'grid',
    gridTemplateColumns:
      align === 'left'
        ? ('78px minmax(0, 1fr) 88px 126px' as const)
        : ('126px 88px minmax(0, 1fr) 78px' as const),
    gridTemplateRows: '54px 16px',
    alignItems: 'end',
    columnGap: 18,
    rowGap: 10
  }
}

function valueStyle(compact: boolean) {
  return {
    display: 'grid',
    alignItems: 'end',
    justifyItems: 'center',
    height: 54,
    fontSize: compact ? 40 : 54,
    fontWeight: 700,
    lineHeight: 0.94,
    color: '#f7f8fb',
    fontVariantNumeric: 'tabular-nums'
  }
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: '#8f95a3',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
  whiteSpace: 'nowrap' as const
}
