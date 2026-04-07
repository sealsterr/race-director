/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { TowerSettings } from '../../../store/overlayStore'
import type { SectorTime } from '../../../types/lmu'
import type { TowerRow } from './useTowerData'
import { formatLapTime } from './useTowerData'
import SectorBar from './SectorBar'
import TyreDisplay from './TyreDisplay'

function resolvePositionColor(isLeader: boolean, change: number | null): string {
  if (isLeader) return '#f59e0b'
  if (change !== null && change > 0) return '#4ade80'
  if (change !== null && change < 0) return '#f87171'
  return '#e2e8f0'
}

interface TowerRowValueProps {
  readonly row: TowerRow
  readonly settings: TowerSettings
  readonly sessionBestSectors: SectorTime
  readonly isQuali: boolean
  readonly animDuration: number
  readonly lapHighlightTime: number | null
  readonly lapHighlightColor: string
}

export default function TowerRowValue({
  row,
  settings,
  sessionBestSectors,
  isQuali,
  animDuration,
  lapHighlightTime,
  lapHighlightColor
}: TowerRowValueProps) {
  if (isQuali) {
    const qualiDisplay =
      lapHighlightTime === null
        ? {
            text: row.displayValue,
            color: '#f1f5f9'
          }
        : {
            text: formatLapTime(lapHighlightTime),
            color: lapHighlightColor
          }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 3
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: qualiDisplay.color,
            letterSpacing: '0.03em',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {qualiDisplay.text}
        </span>
        <SectorBar
          currentSectors={row.standing.currentSectors}
          bestSectors={row.standing.bestSectors}
          sessionBestSectors={sessionBestSectors}
          width={88}
          animationDuration={animDuration}
        />
      </div>
    )
  }

  if (settings.raceMode === 'TYRES') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          minHeight: 28,
          width: '100%',
          paddingRight: 1,
          boxSizing: 'border-box'
        }}
      >
        <TyreDisplay
          tyreCompound={row.standing.tyreCompound}
          tyreSet={row.standing.tyreSet}
          settings={settings}
        />
      </div>
    )
  }

  const isLeader = row.displayValue === 'LEADER'
  const valueColor = resolvePositionColor(isLeader, row.positionsChange)

  return (
    <span
      style={{
        fontSize: isLeader ? 10 : 13,
        fontWeight: isLeader ? 800 : 500,
        color: valueColor,
        letterSpacing: isLeader ? '0.1em' : '0.03em',
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums'
      }}
    >
      {row.displayValue}
    </span>
  )
}
