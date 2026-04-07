import React from 'react'
import { AlertTriangle, Power, X } from 'lucide-react'

interface QuitConfirmPopupProps {
  dontAskAgain: boolean
  isBusy?: boolean
  errorMessage?: string | null
  onDontAskAgainChange: (value: boolean) => void
  onCancel: () => void | Promise<void>
  onConfirm: () => void | Promise<void>
}

const QuitConfirmPopup = ({
  dontAskAgain,
  isBusy = false,
  errorMessage = null,
  onDontAskAgainChange,
  onCancel,
  onConfirm
}: QuitConfirmPopupProps): React.ReactElement => {
  return (
    <div className="w-full max-w-[490px] p-3 text-rd-text">
      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-rd-accent/25 bg-rd-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-rd-border px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rd-accent/12 text-rd-accent">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-rd-accent">
                Confirm Quit
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-rd-text">Quit RaceDirector?</h1>
            </div>
          </div>
          <button
            aria-label="Cancel quit"
            onClick={() => void onCancel()}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rd-border bg-rd-elevated text-rd-subtle transition-colors hover:border-rd-muted hover:text-rd-text"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 px-6 py-5">
          <p className="break-words text-sm leading-6 text-rd-muted">
            This action will close everything.
          </p>

          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-rd-border bg-rd-elevated px-4 py-3">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(event) => onDontAskAgainChange(event.target.checked)}
              disabled={isBusy}
              className="h-4 w-4 appearance-none rounded border border-rd-border bg-rd-surface shadow-inner checked:border-rd-accent checked:bg-rd-accent focus:outline-none focus:ring-0"
            />
            <span className="text-sm text-rd-text">Don&apos;t ask me again</span>
          </label>
          {errorMessage ? (
            <p className="mt-4 rounded-lg border border-rd-error/30 bg-rd-error/10 px-3 py-2 text-xs text-rd-error">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-rd-border px-6 py-4">
          <button
            onClick={() => void onCancel()}
            disabled={isBusy}
            className="inline-flex items-center rounded-lg border border-rd-border bg-rd-elevated px-4 py-2 text-sm font-semibold text-rd-text transition-colors hover:border-rd-muted hover:bg-rd-bg"
          >
            Cancel
          </button>
          <button
            onClick={() => void onConfirm()}
            disabled={isBusy}
            className="inline-flex items-center gap-2 rounded-lg border border-rd-accent/30 bg-rd-accent/10 px-4 py-2 text-sm font-semibold text-rd-accent transition-colors hover:bg-rd-accent/20"
          >
            <Power size={16} />
            {isBusy ? 'Closing…' : 'Quit RaceDirector'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuitConfirmPopup
