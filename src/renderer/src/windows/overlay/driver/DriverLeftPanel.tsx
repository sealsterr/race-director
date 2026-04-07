import type { ReactElement } from 'react'

export function DriverLeftPanel({
  accent,
  accentGradient,
  carNumber,
  carClass,
  bestLap,
  position,
  showCarNumber,
  showBestLap,
  showClass,
  showPosition,
  bestLapColor = '#b3b8c8'
}: {
  readonly accent: string
  readonly accentGradient: string
  readonly carNumber: string
  readonly carClass: string
  readonly bestLap: string
  readonly position: number
  readonly showCarNumber: boolean
  readonly showBestLap: boolean
  readonly showClass: boolean
  readonly showPosition: boolean
  readonly bestLapColor?: string
}): ReactElement {
  return (
    <div
      style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column', gap: 10 }}
    >
      <div
        style={{
          position: 'relative',
          minHeight: 82,
          padding: '14px 16px 13px',
          clipPath: 'polygon(0 0, 100% 0, 83% 100%, 0 100%)',
          borderRadius: 11,
          background: accentGradient,
          border: `1px solid ${accent}66`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.025), 0 0 14px ${accent}1a`
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'stretch',
            columnGap: 14
          }}
        >
          {showPosition && <MetricCell label="POS" value={`P${position}`} />}
          <span
            style={{
              alignSelf: 'stretch',
              width: 1,
              background: 'rgba(255,255,255,0.12)'
            }}
          />
          {showCarNumber && <MetricCell label="CAR" value={`#${carNumber || '--'}`} />}
        </div>
      </div>
      {(showClass || showBestLap) && (
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '12px 14px 13px',
            borderRadius: 11,
            border: `1px solid ${accent}3d`,
            background: 'linear-gradient(180deg, rgba(28,31,43,0.96), rgba(22,24,34,0.92))',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
          }}
        >
          <div
            style={{
              display: 'flex',
              minHeight: 0,
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}
          >
            {showClass && (
              <>
                <div style={labelStyle}>CLASS</div>
                <div style={{ ...valueStyle, marginTop: 8, fontSize: 20, color: accent }}>
                  {carClass}
                </div>
              </>
            )}
          </div>
          <span
            style={{
              display: 'block',
              width: '100%',
              height: 1,
              marginBlock: 10,
              background: 'rgba(255,255,255,0.08)'
            }}
          />
          {showBestLap && (
            <div
              style={{
                display: 'flex',
                minHeight: 0,
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: 7
              }}
            >
              <div style={labelStyle}>BEST LAP</div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: 0.95,
                  color: bestLapColor,
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'color 120ms linear'
                }}
              >
                {bestLap}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MetricCell({
  label,
  value
}: {
  readonly label: string
  readonly value: string
}): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}
    >
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{value}</span>
    </div>
  )
}

const labelStyle = {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.05em',
  color: '#a4a7b5'
}

const valueStyle = {
  fontSize: 25,
  fontWeight: 700,
  lineHeight: 0.95,
  color: '#f8fafc'
}
