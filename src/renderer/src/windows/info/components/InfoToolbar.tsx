import React from 'react'
import type { CarClass } from '../../../types/lmu'
import { ALL_CLASSES } from '../infoConstants'
import { getClassFilterClass } from '../infoToneUtils'

interface InfoToolbarProps {
  activeClasses: Set<CarClass>
  filteredCount: number
  columnButtonRef: React.RefObject<HTMLButtonElement | null>
  onToggleClass: (carClass: CarClass) => void
  onToggleColumnMenu: () => void
}

const InfoToolbar = ({
  activeClasses,
  filteredCount,
  columnButtonRef,
  onToggleClass,
  onToggleColumnMenu
}: InfoToolbarProps): React.ReactElement => (
  <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-rd-border bg-rd-surface/80 px-3 py-2 sm:px-4">
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
      {ALL_CLASSES.filter((carClass) => carClass !== 'UNKNOWN').map((carClass) => (
        <button
          key={carClass}
          type="button"
          onClick={() => onToggleClass(carClass)}
          className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold transition-all ${getClassFilterClass(
            carClass,
            activeClasses.has(carClass)
          )}`}
        >
          {carClass}
        </button>
      ))}
    </div>

    <div className="flex w-full items-center justify-between gap-2 sm:ml-auto sm:w-auto sm:justify-end">
      <span className="font-mono text-xs text-rd-muted">{filteredCount} cars</span>

      <button
        ref={columnButtonRef}
        type="button"
        onClick={onToggleColumnMenu}
        className="rd-button-muted rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
      >
        Filter
      </button>
    </div>
  </div>
)

export default InfoToolbar
