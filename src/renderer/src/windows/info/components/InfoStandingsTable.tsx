import React from 'react'
import type { DriverStanding, Penalty, PenaltyType } from '../../../types/lmu'
import { COLUMNS, type ColumnKey } from '../infoConstants'
import { formatFuel, formatGap, formatTime } from '../infoFormatters'
import { ClassBadge, StatusBadge } from '../infoPresentation'

interface InfoStandingsTableProps {
  standings: DriverStanding[]
  visibleCols: Set<ColumnKey>
  focusedSlotId: number | null
  hasStandings: boolean
  onRowClick: (driver: DriverStanding) => void
}

const PENALTY_LABELS: Record<PenaltyType, string> = {
  DRIVE_THROUGH: 'DT',
  STOP_AND_GO: 'S&G',
  TIME_PENALTY: 'PEN',
  DISQUALIFICATION: 'DQ'
}

const formatPenaltyLabel = (penalty: Penalty): string => {
  if (penalty.type === 'TIME_PENALTY' && penalty.time > 0) {
    return `+${penalty.time}s`
  }

  const match = /^(\d+) pending$/.exec(penalty.reason)
  if (match && Number(match[1]) > 1) {
    return `PEN x${match[1]}`
  }

  return PENALTY_LABELS[penalty.type] ?? penalty.type
}

const renderCell = (key: ColumnKey, driver: DriverStanding): React.ReactElement => {
  const cellBase = 'border-r border-rd-border px-2 py-2 text-center last:border-r-0'

  switch (key) {
    case 'position':
      return <td className={`${cellBase} font-mono text-xs font-semibold`}>{driver.position}</td>
    case 'class':
      return (
        <td className={cellBase}>
          <ClassBadge carClass={driver.carClass} />
        </td>
      )
    case 'carNumber':
      return <td className={`${cellBase} font-mono text-xs text-rd-muted`}>#{driver.carNumber}</td>
    case 'driver':
      return (
        <td className="border-r border-rd-border px-2 py-2 text-left last:border-r-0">
          <span
            className={`rd-clamp-2 rd-wrap block text-xs font-medium ${driver.isPlayer ? 'text-rd-gold' : 'text-rd-text'}`}
            title={driver.driverName}
          >
            {driver.driverName}
          </span>
        </td>
      )
    case 'team':
      return (
        <td className="max-w-[140px] border-r border-rd-border px-2 py-2 text-xs text-rd-muted last:border-r-0">
          <span className="rd-clamp-2 rd-wrap block" title={driver.teamName || '—'}>
            {driver.teamName || '—'}
          </span>
        </td>
      )
    case 'lastLap':
      return (
        <td className={`${cellBase} font-mono text-xs text-rd-muted`}>
          {formatTime(driver.lastLapTime)}
        </td>
      )
    case 'bestLap':
      return (
        <td className={`${cellBase} font-mono text-xs text-rd-text`}>
          {formatTime(driver.bestLapTime)}
        </td>
      )
    case 'gap':
      return (
        <td
          className={`${cellBase} font-mono text-xs ${driver.position === 1 ? 'font-semibold text-rd-success' : 'text-rd-muted'}`}
        >
          {formatGap(driver.gapToLeader, driver.position === 1)}
        </td>
      )
    case 'interval':
      return (
        <td className={`${cellBase} font-mono text-xs text-rd-subtle`}>
          {driver.position === 1 ? '—' : formatGap(driver.intervalToAhead, false)}
        </td>
      )
    case 'lapsDown':
      return (
        <td
          className={`${cellBase} font-mono text-xs ${driver.lapsDown > 0 ? 'text-rd-warning' : 'text-rd-subtle'}`}
        >
          {driver.lapsDown > 0 ? `+${driver.lapsDown}L` : '—'}
        </td>
      )
    case 'fuel': {
      const fuelClass =
        driver.fuel !== null && driver.fuel < 10
          ? 'text-rd-error'
          : driver.fuel !== null && driver.fuel < 25
            ? 'text-rd-warning'
            : 'text-rd-muted'

      return (
        <td className={`${cellBase} font-mono text-xs ${fuelClass}`}>{formatFuel(driver.fuel)}</td>
      )
    }
    case 'tyres':
      return (
        <td className={`${cellBase} font-mono text-xs text-rd-subtle`}>
          {driver.tyreCompound === 'UNKNOWN' ? '—' : driver.tyreCompound}
        </td>
      )
    case 'pits':
      return (
        <td className={`${cellBase} font-mono text-xs text-rd-muted`}>{driver.pitStopCount}</td>
      )
    case 'penalties':
      return (
        <td className={cellBase}>
          {driver.penalties.length === 0 ? (
            <span className="font-mono text-xs text-rd-subtle">—</span>
          ) : (
            <div className="flex flex-wrap justify-center gap-1">
              {driver.penalties.map((penalty, index) => (
                <span
                  key={`${penalty.type}-${index}`}
                  className="rounded-full bg-rd-error-soft px-2 py-1 font-mono text-[10px] font-semibold text-rd-error ring-1 ring-inset ring-rd-error/25"
                >
                  {formatPenaltyLabel(penalty)}
                </span>
              ))}
            </div>
          )}
        </td>
      )
    case 'status':
      return (
        <td className={cellBase}>
          <StatusBadge status={driver.status} />
        </td>
      )
  }
}

const InfoStandingsTable = ({
  standings,
  visibleCols,
  focusedSlotId,
  hasStandings,
  onRowClick
}: InfoStandingsTableProps): React.ReactElement => {
  if (standings.length === 0) {
    return (
      <div className="rd-empty-state m-4 flex h-[calc(100%-2rem)] flex-col items-center justify-center gap-2 rounded-2xl px-4 text-center">
        <p className="text-sm text-rd-muted">
          {hasStandings ? 'No cars match the filter!' : 'No standings yet!'}
        </p>
        <p className="font-mono text-xs text-rd-subtle">
          {hasStandings
            ? 'Enable a class filter above!'
            : 'Connect to LMU and load into a session!'}
        </p>
      </div>
    )
  }

  return (
    <table className="min-w-full border-collapse text-left">
      <thead className="sticky top-0 z-10 bg-rd-surface/95 backdrop-blur-sm">
        <tr className="border-b border-rd-border">
          {COLUMNS.filter((column) => visibleCols.has(column.key)).map((column) => (
            <th
              key={column.key}
              className="border-r border-rd-border px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-rd-subtle last:border-r-0"
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {standings.map((driver, index) => {
          const isInactive =
            driver.lapsDown > 0 || driver.status === 'RETIRED' || driver.status === 'DISQUALIFIED'
          const rowTone =
            focusedSlotId === driver.slotId
              ? 'bg-rd-gold-soft/65'
              : index % 2 === 0
                ? 'bg-rd-surface/72'
                : 'bg-rd-panel/36'

          return (
            <tr
              key={`${driver.carNumber}-${driver.driverName}`}
              onClick={() => onRowClick(driver)}
              className={`rd-data-row cursor-pointer border-b border-rd-border transition-colors ${rowTone} ${isInactive ? 'opacity-60' : ''}`}
            >
              {COLUMNS.filter((column) => visibleCols.has(column.key)).map((column) => (
                <React.Fragment key={column.key}>{renderCell(column.key, driver)}</React.Fragment>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default InfoStandingsTable
