/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { motion, AnimatePresence } from 'framer-motion'
import type { TowerSettings } from '../../../store/overlayStore'
import type { SectorTime } from '../../../types/lmu'
import { getClassColor, ANIMATION_DURATION } from './constants'
import type { TowerRow as TowerRowData } from './useTowerData'
import StatusEar, { type StatusEarVariant } from './StatusEar'
import TowerRowValue from './TowerRowValue'
import { useLapHighlight } from './useLapHighlight'

interface TowerRowProps {
  readonly row: TowerRowData
  readonly settings: TowerSettings
  readonly isFirstRow: boolean
  readonly isLastRow: boolean
  readonly isOvertaking: 'gained' | 'lost' | null
  readonly sessionBestSectors: SectorTime
  readonly isQuali: boolean
  readonly classBestLapTime: number | null
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}

function resolveFlashBackground(overtaking: 'gained' | 'lost' | null): string {
  if (overtaking === 'gained') return 'rgba(74,222,128,0.18)'
  if (overtaking === 'lost') return 'rgba(248,113,113,0.18)'
  return 'transparent'
}

function getStatusEarConfig(
  settings: TowerSettings,
  status: string
): {
  accentColor: string
  label: string
  variant: StatusEarVariant
} | null {
  if (status === 'PITTING') {
    return { accentColor: settings.colorPitBadge, label: 'PIT', variant: 'pit' }
  }

  if (status === 'FINISHED') {
    return { accentColor: settings.colorFinishBadge, label: 'FIN', variant: 'finish' }
  }

  return null
}

export default function TowerRow({
  row,
  settings,
  isFirstRow,
  isLastRow,
  isOvertaking,
  sessionBestSectors,
  isQuali,
  classBestLapTime
}: TowerRowProps) {
  const { standing } = row
  const animDuration = ANIMATION_DURATION[settings.animationSpeed]
  const classColor = getClassColor(standing.carClass, settings)
  const statusEar = getStatusEarConfig(settings, standing.status)
  const surname = standing.driverName.split(' ').pop() ?? standing.driverName
  const rowRadius = isFirstRow ? '6px 6px 0 0' : isLastRow ? '0 0 6px 6px' : '0'
  const classBarRadius = isFirstRow ? '6px 0 0 0' : isLastRow ? '0 0 0 6px' : '0'
  const { lapHighlightTime, lapHighlightColor } = useLapHighlight({
    enabled: isQuali,
    lastLapTime: standing.lastLapTime,
    bestLapTime: standing.bestLapTime,
    classBestLapTime
  })

  return (
    <motion.div
      layout
      layoutId={row.key}
      transition={{ duration: animDuration }}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 36,
        width: '100%',
        backgroundColor: resolveFlashBackground(isOvertaking),
        borderRadius: rowRadius,
        overflow: 'visible',
        position: 'relative',
        zIndex: 1
      }}
    >
      {settings.showClassBar && (
        <div
          style={{
            width: 4,
            alignSelf: 'stretch',
            backgroundColor: classColor,
            flexShrink: 0,
            borderRadius: classBarRadius,
            marginTop: isFirstRow ? -1 : 0,
            marginBottom: isLastRow ? -1 : 0
          }}
        />
      )}

      <div
        style={{
          width: 38,
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: '#cbd5e1',
          flexShrink: 0,
          letterSpacing: '0.03em'
        }}
      >
        {ordinal(row.classPosition)}
      </div>

      {settings.showCarNumber && (
        <div
          style={{
            width: 38,
            textAlign: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: '#64748b',
            flexShrink: 0
          }}
        >
          #{standing.carNumber || '—'}
        </div>
      )}

      <div
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 700,
          color: '#f8fafc',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          paddingRight: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}
      >
        {surname}
      </div>

      <div style={{ minWidth: 88, textAlign: 'right', paddingRight: 10, flexShrink: 0 }}>
        <TowerRowValue
          row={row}
          settings={settings}
          sessionBestSectors={sessionBestSectors}
          isQuali={isQuali}
          animDuration={animDuration}
          lapHighlightTime={lapHighlightTime}
          lapHighlightColor={lapHighlightColor}
        />
      </div>

      <AnimatePresence>
        {statusEar && (
          <StatusEar
            animDuration={animDuration}
            accentColor={statusEar.accentColor}
            label={statusEar.label}
            variant={statusEar.variant}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
