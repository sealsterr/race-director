import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getErrorMessage } from '../../../../../hooks/useAsyncAction'
import type { AppUpdaterState } from '../../../../../types/updater'
import { SettingsRow } from '../SettingsPrimitives'
import {
  getUpdateCheckerViewModel,
  type UpdateCheckerTone
} from '../../../updater/updateCheckerViewModel'

const STATUS_TONE_CLASS: Record<UpdateCheckerTone, string> = {
  neutral: 'border-rd-border bg-rd-elevated text-rd-subtle',
  accent: 'border-rd-accent/35 bg-rd-accent/10 text-rd-accent',
  warning: 'border-rd-logo-primary/35 bg-rd-logo-primary/10 text-rd-logo-primary'
}

const UpdateCheckerRow = (): React.ReactElement => {
  const [updaterState, setUpdaterState] = useState<AppUpdaterState | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const hydrate = async (): Promise<void> => {
      try {
        const state = await globalThis.api.updater.getState()
        if (!isMounted) return
        setUpdaterState(state)
      } catch (error) {
        console.warn('Failed to hydrate updater state for settings:', error)
      }
    }

    void hydrate()

    const unsubscribe = globalThis.api.updater.onStateChange((state) => {
      setUpdaterState(state)
      setActionError(null)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const viewModel = useMemo(() => {
    const baseModel = getUpdateCheckerViewModel(updaterState)

    if (!actionError) return baseModel

    return {
      ...baseModel,
      statusNote: actionError
    }
  }, [actionError, updaterState])

  const handleAction = useCallback(async (): Promise<void> => {
    const control = viewModel.control
    if (control.kind !== 'button') return

    try {
      setActionError(null)

      if (control.action === 'install') {
        const nextState = await globalThis.api.updater.install()
        setUpdaterState(nextState)
        return
      }

      if (control.action === 'download') {
        const nextState = await globalThis.api.updater.download()
        setUpdaterState(nextState)
        return
      }

      const nextState = await globalThis.api.updater.check()
      setUpdaterState(nextState)
    } catch (error) {
      setActionError(getErrorMessage(error, 'Failed to run update.'))
    }
  }, [viewModel.control])

  return (
    <SettingsRow label="Update Checker" description={viewModel.description}>
      {({ controlId, descriptionId, labelId }) => {
        const control = viewModel.control
        return (
          <div className="flex min-w-0 flex-col items-end gap-1.5">
            {control.kind === 'status' ? (
              <span
                id={controlId}
                aria-describedby={descriptionId}
                aria-labelledby={labelId}
                className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${STATUS_TONE_CLASS[control.tone]}`}
              >
                {control.label === 'Checking...' ? (
                  <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                ) : null}
                <span>{control.label}</span>
              </span>
            ) : (
              <span title={control.title}>
                <button
                  id={controlId}
                  type="button"
                  aria-describedby={descriptionId}
                  aria-labelledby={labelId}
                  disabled={control.disabled}
                  onClick={() => void handleAction()}
                  className={`inline-flex min-w-32 items-center justify-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rd-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface ${
                    control.disabled
                      ? 'cursor-not-allowed border-rd-border bg-rd-elevated text-rd-subtle'
                      : 'border-rd-accent/40 bg-rd-accent/15 hover:bg-rd-accent/25'
                  }`}
                >
                  {control.busy ? (
                    <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                  ) : null}
                  {control.label}
                </button>
              </span>
            )}

            {viewModel.statusNote ? (
              <p className="max-w-64 text-right text-[11px] leading-4 text-rd-muted">
                {viewModel.statusNote}
              </p>
            ) : null}
            <p className="text-right text-[11px] leading-4 text-rd-subtle">
              {viewModel.lastCheckedLabel}
            </p>
          </div>
        )
      }}
    </SettingsRow>
  )
}

export default UpdateCheckerRow
