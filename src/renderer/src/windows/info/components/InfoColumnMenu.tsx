import React from 'react'
import { COLUMNS, type ColumnKey } from '../infoConstants'

interface InfoColumnMenuProps {
  menuRef: React.RefObject<HTMLDivElement | null>
  visibleCols: Set<ColumnKey>
  onToggleCol: (key: ColumnKey) => void
}

const InfoColumnMenu = ({
  menuRef,
  visibleCols,
  onToggleCol
}: InfoColumnMenuProps): React.ReactElement => (
  <div
    ref={menuRef}
    className="rd-panel absolute right-4 top-[92px] z-50 flex flex-col gap-1 rounded-2xl p-3 shadow-[var(--shadow-rd-soft)]"
  >
    <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rd-subtle">
      Toggle Columns
    </span>

    {COLUMNS.map((column) => (
      <label
        key={column.key}
        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-xs text-rd-muted transition-colors hover:bg-rd-panel hover:text-rd-text"
      >
        <input
          type="checkbox"
          checked={visibleCols.has(column.key)}
          onChange={() => onToggleCol(column.key)}
          className="accent-rd-accent"
        />
        {column.label}
      </label>
    ))}
  </div>
)

export default InfoColumnMenu
