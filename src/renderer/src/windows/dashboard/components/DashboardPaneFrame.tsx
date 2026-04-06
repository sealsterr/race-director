import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

const MAX_PANE_SCALE = 1.08
const MIN_PANE_SCALE = 0.9

interface DashboardPaneFrameProps {
  baseHeight: number
  baseWidth: number
  children: ReactNode
  className?: string
}

const DashboardPaneFrame = ({
  baseHeight,
  baseWidth,
  children,
  className
}: DashboardPaneFrameProps): React.ReactElement => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: baseWidth, height: baseHeight })

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({
        width: Math.max(width, 1),
        height: Math.max(height, 1)
      })
    })

    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [])

  const scale = useMemo(() => {
    const fitScale = Math.min(size.width / baseWidth, size.height / baseHeight)

    if (fitScale >= 1) {
      return Math.min(MAX_PANE_SCALE, 1 + (fitScale - 1) * 0.2)
    }

    return Math.max(MIN_PANE_SCALE, fitScale)
  }, [baseHeight, baseWidth, size.height, size.width])

  const style = useMemo<CSSProperties>(
    () => ({
      fontSize: `${16 * scale}px`
    }),
    [scale]
  )

  return (
    <div ref={containerRef} style={style} className={className}>
      {children}
    </div>
  )
}

export default DashboardPaneFrame
