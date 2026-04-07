import type { CSSProperties, ReactElement } from 'react'
import { motion } from 'framer-motion'
import type { SpeedUnit } from '../../../../../shared/measurementUnits'
import { formatSpeedValue, getSpeedUnitLabel } from '../../../../../shared/measurementUnits'
import type { GapOverlayDriver } from './gapTypes'
import { GapTelemetryStrip } from './GapDriverBands'

export function GapDriverIsland({
  driver,
  align,
  speedUnit,
  disableEnterAnimation
}: {
  readonly driver: GapOverlayDriver
  readonly align: 'left' | 'right'
  readonly speedUnit: SpeedUnit
  readonly disableEnterAnimation: boolean
}): ReactElement {
  const textAlign = align === 'left' ? 'left' : 'right'

  return (
    <motion.div
      initial={disableEnterAnimation ? false : { opacity: 0, x: align === 'left' ? -18 : 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: 520,
        minHeight: 260,
        padding: '24px 28px 22px',
        borderRadius: 28,
        color: '#f7f8fb',
        background:
          'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.04), transparent 32%), linear-gradient(180deg, rgba(9,12,20,0.46), rgba(6,8,14,0.3))',
        backdropFilter: 'blur(24px) saturate(138%)',
        WebkitBackdropFilter: 'blur(24px) saturate(138%)',
        border: '1px solid transparent',
        boxShadow: 'none',
        fontFamily: "'Oxanium', 'Inter', sans-serif"
      }}
    >
      <div style={headerStyle(align)}>
        <div style={{ ...firstNameStyle, textAlign }}>{driver.firstName}</div>
        <div style={cornerCarNumberStyle}>#{driver.carNumber}</div>
      </div>

      <div style={{ textAlign }}>
        <div style={lastNameStyle}>{driver.lastName}</div>
        <div style={metaLineStyle(align)}>{driver.teamName}</div>
      </div>

      <GapTelemetryStrip
        tyre={driver.tyreCompound}
        tyreSet={driver.tyreSet ?? null}
        speed={formatSpeedValue(driver.speedKph, speedUnit)}
        speedLabel={getSpeedUnitLabel(speedUnit)}
        gear={driver.gear}
        align={align}
      />
    </motion.div>
  )
}

const firstNameStyle = { fontSize: 28, fontWeight: 400, color: '#d0d3db', flex: 1 }
const lastNameStyle = {
  marginTop: 2,
  fontSize: 54,
  fontWeight: 800,
  lineHeight: 0.9,
  color: '#ffffff'
}
const cornerCarNumberStyle = {
  paddingInline: 4,
  fontSize: 26,
  fontWeight: 700,
  letterSpacing: '0.12em',
  color: '#e8ebf2',
  fontVariantNumeric: 'tabular-nums'
}

function headerStyle(align: 'left' | 'right'): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
    flexDirection: align === 'left' ? ('row' as const) : ('row-reverse' as const)
  }
}

function metaLineStyle(align: 'left' | 'right'): CSSProperties {
  return {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 600,
    color: '#bcc3d0',
    textAlign: align,
    letterSpacing: '0.015em',
    lineHeight: 1.08,
    textShadow: '0 1px 10px rgba(0,0,0,0.22)'
  }
}
