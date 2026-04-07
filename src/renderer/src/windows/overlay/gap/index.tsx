import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react'
import { GAP_OVERLAY_RENDER_SCALE } from '../../../../../shared/overlayWindowSizing'
import { GapOverlayShell } from './GapOverlayShell'
import { GapDriverIsland } from './GapDriverIsland'
import { GapCenterTrend } from './GapCenterTrend'
import { useGapOverlayData } from './useGapOverlayData'
import { useTowerWindowAutosize } from '../tower/useTowerWindowAutosize'

const rootStyle: CSSProperties = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  background: 'none'
}

export default function GapOverlay(): ReactElement {
  const {
    battle,
    center,
    dragMode,
    opacity,
    scale,
    isConfigReady,
    speedUnit,
    trendPalette,
    trendColors
  } = useGapOverlayData()
  const effectiveScale = scale * GAP_OVERLAY_RENDER_SCALE
  const contentRef = useRef<HTMLDivElement>(null)
  const [disableEnterAnimation, setDisableEnterAnimation] = useState(true)
  const hasLiveBattle = battle !== null && center !== null

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setDisableEnterAnimation(false))
    return () => cancelAnimationFrame(frameId)
  }, [])

  useTowerWindowAutosize({
    enabled: true,
    overlayId: 'OVERLAY-GAP',
    scale: effectiveScale,
    targetRef: contentRef
  })

  return (
    <div
      style={
        {
          ...rootStyle,
          pointerEvents: dragMode ? 'auto' : 'none',
          WebkitAppRegion: dragMode ? 'drag' : 'no-drag'
        } as CSSProperties
      }
    >
      <div
        ref={contentRef}
        style={
          {
            position: 'relative',
            opacity: isConfigReady ? opacity : 0,
            transform: `scale(${effectiveScale})`,
            transformOrigin: 'top left',
            pointerEvents: dragMode ? 'auto' : 'none',
            WebkitAppRegion: dragMode ? 'drag' : 'no-drag',
            cursor: dragMode ? 'grab' : 'default',
            width: 'fit-content'
          } as CSSProperties
        }
      >
        {hasLiveBattle ? (
          <GapOverlayShell accentColor={trendPalette.primary}>
            <GapDriverIsland
              driver={battle.ahead}
              align="left"
              speedUnit={speedUnit}
              disableEnterAnimation={disableEnterAnimation}
            />
            <GapCenterTrend
              gapSeconds={center.gapSeconds}
              trend={center.trend}
              color={trendPalette.primary}
              closingColor={trendColors.closing}
              growingColor={trendColors.growing}
            />
            <GapDriverIsland
              driver={battle.behind}
              align="right"
              speedUnit={speedUnit}
              disableEnterAnimation={disableEnterAnimation}
            />
          </GapOverlayShell>
        ) : null}
      </div>
    </div>
  )
}
