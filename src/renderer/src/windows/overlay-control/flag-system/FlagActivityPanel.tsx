import type { ReactElement } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Search, Trash2, Waves } from 'lucide-react'
import type { ActivityFilter, ActivityFilterToggle, FlagHistoryItem, SpeedAlert } from './types'
import { HistoryCard, SpeedAlertCard } from './FlagActivityCard'

interface FlagActivityPanelProps {
  readonly activityFilters: readonly ActivityFilter[]
  readonly activityQuery: string
  readonly filteredHistory: FlagHistoryItem[]
  readonly filteredAlerts: SpeedAlert[]
  readonly onActivityFilterToggle: (filter: ActivityFilterToggle) => void
  readonly onActivityQueryChange: (query: string) => void
  readonly onDismissAlert: (id: string) => void
  readonly onDismissHistoryItem: (id: string) => void
  readonly onClearActivities: () => void
}

const ACTIVITY_FILTERS: ActivityFilterToggle[] = ['all', 'flags', 'warnings', 'alerts']

const ACTIVITY_FILTER_KEYS: ActivityFilter[] = ['flags', 'warnings', 'alerts']

const activityFilterLabel: Record<ActivityFilterToggle, string> = {
  all: 'All',
  flags: 'Flags',
  warnings: 'Warnings',
  alerts: 'Alerts'
}

const activityFilterClass: Record<ActivityFilterToggle, { active: string; inactive: string }> = {
  all: {
    active: 'bg-rd-elevated text-rd-text',
    inactive: 'text-rd-subtle hover:text-rd-text'
  },
  flags: {
    active: 'bg-cyan-400/12 text-cyan-200 ring-1 ring-cyan-400/25',
    inactive: 'text-cyan-300/45 hover:text-cyan-200'
  },
  warnings: {
    active: 'bg-rd-warning/12 text-rd-warning ring-1 ring-rd-warning/25',
    inactive: 'text-rd-warning/45 hover:text-rd-warning'
  },
  alerts: {
    active: 'bg-rd-error/12 text-rd-error ring-1 ring-rd-error/25',
    inactive: 'text-rd-error/45 hover:text-rd-error'
  }
}

export function FlagActivityPanel(props: FlagActivityPanelProps): ReactElement {
  const itemCount = props.filteredHistory.length + props.filteredAlerts.length
  const allFiltersSelected = ACTIVITY_FILTER_KEYS.every((filter) =>
    props.activityFilters.includes(filter)
  )

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-rd-border bg-rd-surface">
      <div className="flex items-center gap-2 border-b border-rd-border px-4 py-3">
        <Waves size={14} className="text-rd-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-rd-text">
          Activity
        </span>
        <span className="ml-auto" />
        <button
          type="button"
          aria-label="Clear activity list"
          title="Clear activity list"
          disabled={itemCount === 0}
          onClick={props.onClearActivities}
          className="flex h-8 w-8 items-center justify-center rounded border-none bg-transparent p-0 text-rd-subtle outline-none ring-0 transition-colors hover:text-rd-text focus-visible:text-rd-text disabled:cursor-default disabled:opacity-35 disabled:hover:text-rd-subtle"
        >
          <Trash2 size={14} strokeWidth={2.1} />
        </button>
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
        {ACTIVITY_FILTERS.map((filter) => {
          const isActive =
            filter === 'all' ? allFiltersSelected : props.activityFilters.includes(filter)

          return (
            <button
              key={filter}
              type="button"
              aria-pressed={isActive}
              onClick={() => props.onActivityFilterToggle(filter)}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                isActive ? activityFilterClass[filter].active : activityFilterClass[filter].inactive
              }`}
            >
              {activityFilterLabel[filter]}
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <LayoutGroup>
          <motion.div layout className="grid grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {props.filteredAlerts.map((alert) => (
                <SpeedAlertCard
                  key={alert.id}
                  alert={alert}
                  onDismissAlert={props.onDismissAlert}
                />
              ))}

              {props.filteredHistory.map((item) => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  onDismissHistoryItem={props.onDismissHistoryItem}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </div>
    </div>
  )
}
