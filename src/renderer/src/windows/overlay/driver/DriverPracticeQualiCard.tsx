import type { ReactElement } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { DriverSettings } from '../../../store/overlayStore'
import type { DriverStanding, SectorTime } from '../../../types/lmu'
import { DriverCardShell } from './DriverCardShell'
import { BrandFlagTag } from './DriverCardBits'
import { DriverLeftPanel } from './DriverLeftPanel'
import { DriverPanelFrame } from './DriverPanelFrame'
import { DriverRightPanel } from './DriverRightPanel'
import { DriverSectorStrip } from './DriverSectorStrip'
import { useDriverSectorHighlights } from './useDriverSectorHighlights'
import {
  formatLapTime,
  getClassAccent,
  getClassGradient,
  getClassLabel,
  type NationalityMark
} from './driverCardUtils'

function formatBestLapLabel(bestLapTime: number | null): string {
  return bestLapTime === null ? 'NO LAP SET' : formatLapTime(bestLapTime)
}

interface DriverPracticeQualiCardProps {
  readonly driver: DriverStanding
  readonly settings: DriverSettings
  readonly classPosition: number
  readonly currentLapTime: number | null
  readonly classBestLapTime: number | null
  readonly sessionBestSectors: SectorTime
  readonly nameParts: { first: string; last: string }
  readonly nationalityMark: NationalityMark
  readonly isPreview: boolean
  readonly disableEnterAnimation?: boolean
}

export function DriverPracticeQualiCard({
  driver,
  settings,
  classPosition,
  currentLapTime,
  classBestLapTime,
  sessionBestSectors,
  nameParts,
  nationalityMark,
  isPreview,
  disableEnterAnimation = false
}: DriverPracticeQualiCardProps): ReactElement {
  const classAccent = getClassAccent(driver.carClass)
  const sectorHighlight = useDriverSectorHighlights({
    currentSectors: driver.currentSectors,
    bestSectors: driver.bestSectors,
    sessionBestSectors,
    lastLapTime: driver.lastLapTime,
    bestLapTime: driver.bestLapTime,
    classBestLapTime,
    settings,
    enabled: !isPreview
  })
  const hasVisibleParts = settings.showPart1 || settings.showPart2 || settings.showPart3

  if (!hasVisibleParts) {
    return <></>
  }

  return (
    <DriverCardShell>
      <AnimatePresence initial={false} mode="popLayout">
        {settings.showPart1 && (
          <DriverPanelFrame key="part1" width={208} disableEnterAnimation={disableEnterAnimation}>
            <DriverLeftPanel
              accent={classAccent}
              accentGradient={getClassGradient(driver.carClass)}
              position={classPosition}
              carNumber={driver.carNumber}
              carClass={getClassLabel(driver.carClass)}
              bestLap={formatBestLapLabel(driver.bestLapTime)}
              showCarNumber={true}
              showBestLap={true}
              showClass={true}
              showPosition={true}
              bestLapColor={sectorHighlight.bestLapColor}
            />
          </DriverPanelFrame>
        )}
        {settings.showPart2 && (
          <DriverPanelFrame key="part2" width={458} disableEnterAnimation={disableEnterAnimation}>
            <motion.div
              layout
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '10px 14px 12px',
                borderRadius: 11,
                border: `1px solid ${classAccent}66`,
                background: 'linear-gradient(180deg, rgba(22,24,35,0.96), rgba(17,19,28,0.92))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16
                  }}
                >
                  <div style={{ paddingTop: 6 }}>
                    <BrandFlagTag nationalityMark={nationalityMark} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={timerLabelStyle}>LAP TIMER</div>
                    <div style={timerValueStyle}>{formatLapTime(currentLapTime)}</div>
                  </div>
                </div>
                <div style={{ marginTop: 6 }}>
                  <div style={firstNameStyle}>{nameParts.first}</div>
                  <div style={lastNameStyle}>{nameParts.last}</div>
                </div>
              </div>
              <div style={{ paddingTop: 0 }}>
                <DriverSectorStrip sectorVisuals={sectorHighlight.sectorVisuals} />
              </div>
            </motion.div>
          </DriverPanelFrame>
        )}
        {settings.showPart3 && (
          <DriverPanelFrame key="part3" width={182} disableEnterAnimation={disableEnterAnimation}>
            <DriverRightPanel driver={driver} isPreview={isPreview} />
          </DriverPanelFrame>
        )}
      </AnimatePresence>
    </DriverCardShell>
  )
}

const firstNameStyle = {
  fontSize: 26,
  fontWeight: 500,
  lineHeight: 0.9,
  letterSpacing: '0.04em',
  color: '#f3f4f6'
}

const lastNameStyle = {
  marginTop: 4,
  fontSize: 44,
  fontWeight: 800,
  lineHeight: 0.88,
  letterSpacing: '0.01em',
  color: '#ffffff'
}

const timerLabelStyle = {
  fontSize: 12,
  fontWeight: 500,
  color: '#a4a7b5'
}

const timerValueStyle = {
  marginTop: 3,
  fontSize: 42,
  fontWeight: 700,
  lineHeight: 0.9,
  color: '#f8fafc',
  fontVariantNumeric: 'tabular-nums'
}
