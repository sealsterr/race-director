import type { ReactElement } from 'react'
import { AlertTriangle, Search, Waves } from 'lucide-react'
import type { ActivityFilter, FlagHistoryItem, SpeedAlert } from './types'
import { FLAG_LABELS, FLAG_TONES } from './types'

interface FlagActivityPanelProps {
  readonly activityFilter: ActivityFilter
  readonly activityQuery: string
  readonly filteredHistory: FlagHistoryItem[]
  readonly filteredAlerts: SpeedAlert[]
  readonly onActivityFilterChange: (filter: ActivityFilter) => void
  readonly onActivityQueryChange: (query: string) => void
  readonly onAcknowledgeAlert: (id: string) => void
}

const ACTIVITY_FILTERS: ActivityFilter[] = ['all', 'flags', 'warnings', 'alerts']

const activityFilterLabel: Record<ActivityFilter, string> = {
  all: 'All',
  flags: 'Flags',
  warnings: 'Warnings',
  alerts: 'Alerts'
}

export function FlagActivityPanel(props: FlagActivityPanelProps): ReactElement {
  const itemCount = props.filteredHistory.length + props.filteredAlerts.length

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-rd-border bg-rd-surface">
      <div className="flex items-center gap-2 border-b border-rd-border px-4 py-3">
        <Waves size={14} className="text-rd-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-rd-text">
          Activity
        </span>
        <span className="ml-auto font-mono text-xs text-rd-subtle">{itemCount} items</span>
      </div>

      <div className="flex items-center gap-2 border-b border-rd-border px-4 py-3">
        <label className="flex min-w-[16rem] flex-1 items-center gap-2 border-b border-rd-border py-2">
          <Search size={13} className="text-rd-subtle" />
          <input
            type="text"
            value={props.activityQuery}
            onChange={(event) => props.onActivityQueryChange(event.target.value)}
            placeholder="Search driver, car, #, sector, lap, time, corner..."
            className="w-full bg-transparent text-sm text-rd-text outline-none placeholder:text-rd-subtle"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-rd-border px-4 py-3">
        {ACTIVITY_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => props.onActivityFilterChange(filter)}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
              props.activityFilter === filter
                ? 'bg-rd-elevated text-rd-text'
                : 'text-rd-subtle hover:text-rd-text'
            }`}
          >
            {activityFilterLabel[filter]}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {props.filteredAlerts.map((alert) => (
            <div key={alert.id} className="rounded border border-rd-border bg-rd-bg/60 p-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-rd-subtle">{alert.timestamp}</span>
                <span className="text-xs text-rd-muted">Car {alert.carNumber}</span>
                <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-rd-subtle">
                  {alert.status === 'acknowledged' ? 'Acknowledged' : 'Speed Alert'}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <AlertTriangle size={14} className="text-rd-gold" />
                <p className="text-base font-semibold text-rd-text">{alert.driverName}</p>
              </div>
              <p className="mt-2 text-sm text-rd-muted">
                {alert.location} | {alert.speedKph} km/h in a {alert.zoneLimitKph} km/h FCY zone
              </p>
              <p className="mt-1 text-xs text-rd-subtle">
                {alert.carName} | {alert.sector} | Lap {alert.lap}
              </p>
              <button
                type="button"
                onClick={() => props.onAcknowledgeAlert(alert.id)}
                disabled={alert.status === 'acknowledged'}
                className="mt-3 rounded border border-rd-border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rd-text transition-colors hover:border-rd-muted disabled:cursor-default disabled:opacity-45"
              >
                {alert.status === 'acknowledged' ? 'Done' : 'Acknowledge'}
              </button>
            </div>
          ))}

          {props.filteredHistory.map((item) => {
            const tone = item.flagType ? FLAG_TONES[item.flagType] : null
            return (
              <div key={item.id} className="rounded border border-rd-border bg-rd-bg/60 p-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-rd-subtle">{item.timestamp}</span>
                  <span className="text-xs text-rd-muted">Lap {item.lap}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-[0.16em] text-rd-subtle">
                    {item.source === 'race-control'
                      ? 'External RC'
                      : item.source === 'game'
                        ? 'Game Detected'
                        : item.source === 'system'
                          ? 'System Alert'
                          : 'Manual'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {tone ? (
                    <span
                      className={`rounded px-2 py-1 text-[10px] font-semibold uppercase ${tone.badgeClass}`}
                    >
                      {FLAG_LABELS[item.flagType!]}
                    </span>
                  ) : (
                    <span className="rounded bg-rd-elevated px-2 py-1 text-[10px] font-semibold uppercase text-rd-text">
                      Clear
                    </span>
                  )}
                  <p className="text-base font-semibold text-rd-text">{item.title}</p>
                </div>
                <p className="mt-2 text-sm text-rd-muted">{item.detail}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
