import type { ReactElement } from 'react'
import { Flag } from 'lucide-react'
import type { ActiveFlagState, FlagType } from './types'
import { FLAG_LABELS, FLAG_TONES } from './types'

interface FlagCommandPanelProps {
  readonly effectiveFlag: ActiveFlagState | null
  readonly currentLap: number
  readonly timeRemaining: string
  readonly sectorFlags: [FlagType | null, FlagType | null, FlagType | null]
  readonly onApplyManualFlag: (type: FlagType) => void
}

const ACTIONS: Array<{ type: FlagType; label: string }> = [
  { type: 'FCY', label: 'FCY' },
  { type: 'SC', label: 'SC' },
  { type: 'RED', label: 'RED FLAG' }
]

export function FlagCommandPanel({
  effectiveFlag,
  currentLap,
  timeRemaining,
  sectorFlags,
  onApplyManualFlag
}: FlagCommandPanelProps): ReactElement {
  const effectiveTone = effectiveFlag ? FLAG_TONES[effectiveFlag.type] : null
  const activeFlagLabel =
    effectiveFlag?.type === 'FCY'
      ? 'FCY'
      : effectiveFlag
        ? FLAG_LABELS[effectiveFlag.type].toUpperCase()
        : 'NO ACTIVE FLAG'

  const getActionLabel = (type: FlagType): string => {
    return ACTIONS.find((action) => action.type === type)?.label ?? FLAG_LABELS[type]
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-rd-border bg-rd-surface">
      <div className="flex items-center gap-2 border-b border-rd-border px-4 py-3">
        <Flag size={14} className="text-rd-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-rd-text">
          Flag Control
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="border-b border-rd-border pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className={`text-2xl font-semibold ${effectiveTone?.textClass ?? 'text-rd-text'}`}>
                {activeFlagLabel}
              </p>
              <div className="mt-4 flex items-center gap-2">
                {sectorFlags.map((sectorFlag, index) => {
                  const tone = sectorFlag ? FLAG_TONES[sectorFlag] : null
                  return (
                    <div
                      key={`sector-${index + 1}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold"
                      style={{
                        borderColor: sectorFlag ? `${tone?.fill}66` : 'var(--color-rd-border)',
                        backgroundColor: sectorFlag ? `${tone?.fill}22` : 'var(--color-rd-elevated)'
                      }}
                    >
                      <span className={tone?.textClass ?? 'text-rd-subtle'}>{index + 1}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 text-right">
              <div>
                <p className="font-mono text-base font-semibold text-rd-text">{timeRemaining}</p>
              </div>
              <div>
                <p className="font-mono text-base font-semibold text-rd-text">Lap {currentLap}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-4">
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map((action) => (
              <button
                key={action.type}
                type="button"
                onClick={() => onApplyManualFlag(action.type)}
                className="rounded border border-rd-border bg-rd-elevated px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-rd-text transition-colors hover:border-rd-accent/40 hover:bg-rd-accent/10"
              >
                {getActionLabel(action.type).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
