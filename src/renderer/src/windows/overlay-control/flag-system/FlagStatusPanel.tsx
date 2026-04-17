import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { Clock3, MonitorSmartphone, Radio } from 'lucide-react'
import type { ActiveFlagState, PreviewSettings, SyncState } from './types'
import { FLAG_LABELS, FLAG_TONES } from './types'

interface FlagStatusPanelProps {
  readonly effectiveFlag: ActiveFlagState | null
  readonly previewSettings: PreviewSettings
  readonly syncState: SyncState
}

const syncDescriptions: Record<SyncState, string> = {
  idle: 'No active flag from either source.',
  'detected-only': 'The UI is following the game feed.',
  'manual-override': 'An operator command is active and no detected flag is matching it yet.',
  synced: 'Manual and detected sources are aligned.',
  conflict: 'Manual and detected sources disagree. Operator review recommended.'
}

export function FlagStatusPanel({
  effectiveFlag,
  previewSettings,
  syncState
}: FlagStatusPanelProps): ReactElement {
  const effectiveTone = effectiveFlag ? FLAG_TONES[effectiveFlag.type] : null

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-rd-border bg-rd-surface">
      <div className="flex items-center gap-2 border-b border-rd-border px-4 py-3">
        <Radio size={14} className="text-rd-accent" />
        <span className="text-xs font-semibold uppercase tracking-wider text-rd-text">
          Live State
        </span>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 xl:grid-cols-[1.15fr_0.95fr]">
        <section className="flex flex-col gap-3">
          <motion.div
            animate={
              effectiveTone &&
              previewSettings.pulse &&
              (effectiveFlag?.type === 'FCY' || effectiveFlag?.type === 'RED')
                ? {
                    boxShadow: [
                      '0 0 0 rgba(0,0,0,0)',
                      `0 0 24px ${effectiveTone.glow}`,
                      '0 0 0 rgba(0,0,0,0)'
                    ]
                  }
                : { boxShadow: '0 0 0 rgba(0,0,0,0)' }
            }
            transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.4 }}
            className={`rounded border p-4 ${effectiveTone?.borderClass ?? 'border-rd-border'}`}
            style={{
              background: 'linear-gradient(180deg, rgba(15,17,23,0.96), rgba(8,9,12,0.96))'
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rd-subtle">
              Effective flag
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p
                  className={`text-3xl font-semibold ${effectiveTone?.textClass ?? 'text-rd-text'}`}
                >
                  {effectiveFlag ? FLAG_LABELS[effectiveFlag.type] : 'No active flag'}
                </p>
                <p className="mt-2 max-w-[38rem] text-sm text-rd-muted">
                  {effectiveFlag?.note ??
                    'Awaiting either a manual command or a detected game flag.'}
                </p>
              </div>
              <div className="rounded border border-rd-border bg-rd-bg px-3 py-2 text-right">
                <p className="font-mono text-xs text-rd-text">
                  {effectiveFlag?.timestamp ?? '--:--:--'}
                </p>
                <p className="font-mono text-xs text-rd-subtle">Lap {effectiveFlag?.lap ?? '--'}</p>
              </div>
            </div>
          </motion.div>

          <div className="rounded border border-rd-border bg-rd-bg/60 p-3">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-rd-subtle">
              <Clock3 size={13} className="text-rd-muted" />
              Sync assessment
            </div>
            <p className="text-sm text-rd-text">{syncDescriptions[syncState]}</p>
          </div>
        </section>

        <section className="rounded border border-rd-border bg-rd-bg/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-rd-subtle">
            <MonitorSmartphone size={13} className="text-rd-muted" />
            Session overlay preview
          </div>
          <div
            className="overflow-hidden rounded border border-rd-border bg-black"
            style={{ opacity: previewSettings.opacity / 100 }}
          >
            <div
              className={
                effectiveFlag?.type === 'CHEQUERED'
                  ? 'bg-[repeating-linear-gradient(135deg,#111827_0_12px,#e2e8f0_12px_24px)]'
                  : ''
              }
              style={{
                height: 8,
                backgroundColor: effectiveTone?.fill ?? '#475569'
              }}
            />
            <div className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rd-subtle">
                    Session info overlay
                  </p>
                  <p className="mt-2 text-lg font-semibold text-rd-text">24h Le Mans | Race</p>
                  {!previewSettings.compactMeta ? (
                    <p className="mt-1 text-sm text-rd-muted">Lap 27 / 62 | 01:12:44 remaining</p>
                  ) : null}
                </div>
                <span
                  className={`rounded px-2 py-1 text-[10px] font-semibold uppercase ${effectiveTone?.badgeClass ?? 'bg-rd-elevated text-rd-text'}`}
                >
                  {effectiveFlag ? FLAG_LABELS[effectiveFlag.type] : 'Neutral'}
                </span>
              </div>
              {previewSettings.showTimer ? (
                <div className="flex items-center justify-between rounded border border-rd-border bg-rd-elevated/80 px-3 py-2">
                  <span className="text-xs text-rd-muted">Overlay timer</span>
                  <span className="font-mono text-xs text-rd-text">
                    {effectiveFlag ? effectiveFlag.timestamp : '--:--:--'}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
