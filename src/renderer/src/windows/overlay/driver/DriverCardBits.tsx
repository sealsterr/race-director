import type { CSSProperties, ReactElement } from 'react'
import { motion } from 'framer-motion'
import type { NationalityMark } from './driverCardUtils'

export function FlagTag({ mark }: { readonly mark: NationalityMark }): ReactElement {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <span
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          width: 34,
          height: 22,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 12px rgba(0,0,0,0.35)'
        }}
      >
        {mark.colors.map((color, index) => (
          <span key={`${mark.code}-${index}`} style={{ background: color }} />
        ))}
      </span>
      <span style={{ ...metaValueStyle, fontSize: 21 }}>{mark.code}</span>
    </div>
  )
}

export function BrandFlagTag({
  nationalityMark
}: {
  readonly nationalityMark: NationalityMark
}): ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0.7, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}
    >
      <span
        style={{
          width: 40,
          height: 24,
          borderRadius: 6,
          border: '1px dashed rgba(109,117,141,0.36)',
          background: 'rgba(18,21,31,0.26)'
        }}
      />
      <FlagTag mark={nationalityMark} />
    </motion.div>
  )
}

export function MetricBadge({
  label,
  value,
  width = 114
}: {
  readonly label: string
  readonly value: string
  readonly width?: number
}): ReactElement {
  return (
    <div
      style={{
        width,
        padding: '9px 11px 10px',
        borderRadius: 11,
        border: '1px solid rgba(164,54,48,0.7)',
        background: 'linear-gradient(180deg, rgba(56,16,15,0.35), rgba(16,17,26,0.86))',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
      }}
    >
      <div style={tinyLabelStyle}>{label}</div>
      <div style={{ ...metricValueStyle, marginTop: 5 }}>{value}</div>
    </div>
  )
}

export function MetaField({
  label,
  value
}: {
  readonly label: string
  readonly value: string
}): ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={tinyLabelStyle}>{label}</span>
      <span style={fieldValueStyle}>{value}</span>
    </div>
  )
}

const tinyLabelStyle: CSSProperties = {
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: '0.05em',
  color: '#8f93a8',
  fontFamily: "'Oxanium', 'Inter', sans-serif"
}

const metaValueStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 500,
  color: '#f3f4f6',
  lineHeight: 1,
  fontFamily: "'Oxanium', 'Inter', sans-serif"
}

const metricValueStyle: CSSProperties = {
  fontSize: 19,
  fontWeight: 700,
  lineHeight: 1,
  color: '#f8fafc',
  fontVariantNumeric: 'tabular-nums',
  fontFamily: "'Oxanium', 'Inter', sans-serif"
}

const fieldValueStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.12,
  color: '#f8fafc',
  fontFamily: "'Oxanium', 'Inter', sans-serif"
}
