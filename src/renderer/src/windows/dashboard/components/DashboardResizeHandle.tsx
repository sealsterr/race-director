import React from 'react'
import type { KeyboardEventHandler, PointerEventHandler } from 'react'

interface DashboardResizeHandleProps {
  active: boolean
  ariaLabel: string
  className: string
  orientation: 'horizontal' | 'vertical'
  onPointerDown: PointerEventHandler<HTMLDivElement>
  onStep: (direction: 1 | -1) => void
}

const DashboardResizeHandle = ({
  active,
  ariaLabel,
  className,
  orientation,
  onPointerDown,
  onStep
}: DashboardResizeHandleProps): React.ReactElement => {
  const isVertical = orientation === 'vertical'

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (isVertical && event.key === 'ArrowLeft') {
      event.preventDefault()
      onStep(-1)
    } else if (isVertical && event.key === 'ArrowRight') {
      event.preventDefault()
      onStep(1)
    } else if (!isVertical && event.key === 'ArrowUp') {
      event.preventDefault()
      onStep(-1)
    } else if (!isVertical && event.key === 'ArrowDown') {
      event.preventDefault()
      onStep(1)
    }
  }

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-orientation={orientation}
      className={`group relative z-20 flex touch-none items-center justify-center outline-none ${className}`}
      onKeyDown={handleKeyDown}
      onPointerDown={onPointerDown}
    >
      <div
        className={`rounded-full transition-colors ${
          isVertical
            ? `h-[calc(100%-0.75rem)] w-px ${active ? 'bg-rd-accent/80' : 'bg-rd-border/0 group-hover:bg-rd-border group-focus-visible:bg-rd-accent/70'}`
            : `h-px w-[calc(100%-0.75rem)] ${active ? 'bg-rd-accent/80' : 'bg-rd-border/0 group-hover:bg-rd-border group-focus-visible:bg-rd-accent/70'}`
        }`}
      />
    </div>
  )
}

export default DashboardResizeHandle
