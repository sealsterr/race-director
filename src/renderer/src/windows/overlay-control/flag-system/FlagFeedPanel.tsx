import type { ReactElement } from 'react'
import { AlertTriangle, Radar, ShieldAlert } from 'lucide-react'
import type { ActiveFlagState, SpeedAlert, SyncState } from './types'
import { FLAG_LABELS, FLAG_TONES, SOURCE_LABELS } from './types'

interface FlagFeedPanelProps {
  readonly manualFlag: ActiveFlagState | null
  readonly detectedFlag: ActiveFlagState | null
  readonly syncState: SyncState
  readonly speedLimitKph: number
  readonly toleranceKph: number
  readonly speedAlerts: SpeedAlert[]
}

const syncClasses: Record<SyncState, string> = {
  idle: 'border-rd-border bg-rd-elevated text-rd-text',
  'detected-only': 'border-sky-400/35 bg-sky-400/10 text-sky-300',
  'manual-override': 'border-rd-gold/35 bg-rd-gold/10 text-rd-gold',
  synced: 'border-rd-success/35 bg-rd-success/10 text-rd-success',
  conflict: 'border-rd-error/35 bg-rd-error/10 text-rd-error'
}

const renderFlagRow = (title: string, flag: ActiveFlagState | null): ReactElement => (
  <div className="rounded border border-rd-border bg-rd-bg/60 p-3">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rd-subtle">
        {title}
      </p>
      <span className="font-mono text-xs text-rd-subtle">{flag?.timestamp ?? '--:--:--'}</span>
    </div>
    <div className="mt-3 flex items-center gap-2">
      {flag ? (
        <span
          className={`rounded px-2 py-1 text-[10px] font-semibold uppercase ${FLAG_TONES[flag.type].badgeClass}`}
        >
          {FLAG_LABELS[flag.type]}
        </span>
      ) : (
        <span className="rounded bg-rd-elevated px-2 py-1 text-[10px] font-semibold uppercase text-rd-text">
          Clear
        </span>
      )}
      <span className="text-xs text-rd-muted">
        {flag ? SOURCE_LABELS[flag.source] : 'No source active'}
      </span>
    </div>
    <p className="mt-2 text-sm text-rd-muted">{flag?.note ?? 'No data from this source yet.'}</p>
  </div>
)

export function FlagFeedPanel({
  manualFlag,
  detectedFlag,
  syncState,
  speedLimitKph,
  toleranceKph,
  speedAlerts
}: FlagFeedPanelProps): ReactElement {
  const visibleAlerts = speedAlerts.slice(0, 2)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-rd-border bg-rd-surface">
      <div className="flex items-center gap-2 border-b border-rd-border px-4 py-3">
        <Radar size={14} className="text-sky-300" />
        <span className="text-xs font-semibold uppercase tracking-wider text-rd-text">
          Detection Feed
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className={`rounded border px-3 py-3 text-sm ${syncClasses[syncState]}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Sync state</p>
          <p className="mt-1">
            {syncState === 'conflict'
              ? 'Manual and detected flags disagree.'
              : syncState === 'synced'
                ? 'Manual and detected flags match.'
                : syncState === 'manual-override'
                  ? 'Manual control is leading the session state.'
                  : syncState === 'detected-only'
                    ? 'The game feed is driving the current flag.'
                    : 'No active flag is being tracked.'}
          </p>
        </div>

        {renderFlagRow('Manual / external race control', manualFlag)}
        {renderFlagRow('Automatic game detection', detectedFlag)}

        <div className="rounded border border-rd-border bg-rd-bg/60 p-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={13} className="text-rd-gold" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rd-subtle">
              QoL monitor
            </p>
          </div>
          <p className="mt-2 text-sm text-rd-muted">
            Triggering when a car exceeds {speedLimitKph + toleranceKph} km/h under FCY.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {visibleAlerts.length > 0 ? (
              visibleAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 rounded border border-rd-border bg-rd-elevated px-3 py-2"
                >
                  <AlertTriangle size={14} className="text-rd-gold" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-rd-text">
                      Car {alert.carNumber} | {alert.driverName}
                    </p>
                    <p className="text-xs text-rd-subtle">
                      {alert.location} | {alert.speedKph} km/h
                    </p>
                  </div>
                  <span className="font-mono text-xs text-rd-subtle">{alert.timestamp}</span>
                </div>
              ))
            ) : (
              <div className="rounded border border-dashed border-rd-border px-3 py-4 text-sm text-rd-subtle">
                No overspeed alerts at the current threshold.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
