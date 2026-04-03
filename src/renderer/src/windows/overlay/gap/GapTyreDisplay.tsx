import type { ReactElement } from 'react'
import type { TyreCompound, TyreSet } from '../../../types/lmu'
import { TYRE_INFO, type TyreCompoundKey } from '../tower/constants'
import { getGapTyreLayout, hasMixedGapTyres } from './gapTyreUtils'

export function GapTyreDisplay({
  tyre,
  tyreSet
}: {
  readonly tyre: TyreCompound
  readonly tyreSet: TyreSet | null
}): ReactElement {
  const layout = getGapTyreLayout(tyre, tyreSet)

  if (!hasMixedGapTyres(layout)) {
    return (
      <div style={singleWrapStyle}>
        <TyreGlyph compound={layout[0]} compact={false} />
      </div>
    )
  }

  return (
    <div style={clusterWrapStyle}>
      <div style={clusterGridStyle}>
        {layout.map((compound, index) => (
          <TyreGlyph key={`${compound}-${index}`} compound={compound} compact />
        ))}
      </div>
    </div>
  )
}

function TyreGlyph({
  compound,
  compact
}: {
  readonly compound: TyreCompoundKey
  readonly compact: boolean
}): ReactElement {
  const info = TYRE_INFO[compound]

  return (
    <div
      style={{
        width: compact ? 'auto' : 54,
        height: compact ? 'auto' : 54,
        paddingInline: compact ? 2 : 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: compact ? 0 : 999,
        border: compact ? 'none' : `1px solid ${info.defaultColor}52`,
        background: compact ? 'transparent' : `${info.defaultColor}14`,
        color: info.defaultColor,
        fontSize: compact ? 18 : 26,
        fontWeight: 900,
        letterSpacing: '0.04em'
      }}
    >
      {info.initial}
    </div>
  )
}

const singleWrapStyle = {
  display: 'grid',
  justifyItems: 'center',
  alignItems: 'center',
  height: 54
}

const clusterWrapStyle = {
  display: 'grid',
  justifyItems: 'center',
  alignItems: 'center',
  height: 54
}

const clusterGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 34px)',
  gap: 6
}
