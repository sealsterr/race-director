import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react'
import { useTowerWindowAutosize } from '../tower/useTowerWindowAutosize'
import { SessionInfoPanel } from './SessionInfoPanel'
import { useSessionOverlayData } from './useSessionOverlayData'

const rootStyle: CSSProperties = {
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  background: 'none'
}

export default function SessionOverlay(): ReactElement {
  const {
    settings,
    customLabel,
    headline,
    lapLabel,
    timeLabel,
    progress,
    flagBarState,
    accent,
    dragMode,
    opacity,
    scale,
    isConfigReady
  } = useSessionOverlayData()
  const contentRef = useRef<HTMLDivElement>(null)
  const [disableEnterAnimation, setDisableEnterAnimation] = useState(true)

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setDisableEnterAnimation(false))
    return () => cancelAnimationFrame(frameId)
  }, [])

  useTowerWindowAutosize({
    enabled: true,
    overlayId: 'OVERLAY-SESSION',
    scale,
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
            opacity: isConfigReady ? opacity : 0,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: 'fit-content',
            pointerEvents: dragMode ? 'auto' : 'none',
            WebkitAppRegion: dragMode ? 'drag' : 'no-drag',
            cursor: dragMode ? 'grab' : 'default'
          } as CSSProperties
        }
      >
        <SessionInfoPanel
          settings={settings}
          customLabel={customLabel}
          headline={headline}
          lapLabel={lapLabel}
          timeLabel={timeLabel}
          progress={progress}
          flagBarState={flagBarState}
          accent={accent}
          disableEnterAnimation={disableEnterAnimation}
        />
      </div>
    </div>
  )
}
