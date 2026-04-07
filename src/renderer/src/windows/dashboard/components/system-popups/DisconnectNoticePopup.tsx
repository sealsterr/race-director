import React from 'react'
import { WifiOff, X } from 'lucide-react'

interface DisconnectNoticePopupProps {
  onDismiss: () => void | Promise<void>
  isBusy?: boolean
  errorMessage?: string | null
}

const DisconnectNoticePopup = ({
  onDismiss,
  isBusy = false,
  errorMessage = null
}: DisconnectNoticePopupProps): React.ReactElement => {
  return (
    <div className="w-full max-w-[460px] p-3 text-rd-text">
      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-rd-warning/25 bg-rd-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-rd-border px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rd-warning/15 text-rd-warning">
              <WifiOff size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-rd-warning">
                Connection Lost
              </p>
              <h1 className="mt-0.5 text-xl font-semibold text-rd-text">Disconnected from lobby</h1>
            </div>
          </div>
          <button
            aria-label="Dismiss notice"
            onClick={() => void onDismiss()}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rd-border bg-rd-elevated text-rd-subtle transition-colors hover:border-rd-muted hover:text-rd-text"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="break-words text-sm leading-6 text-rd-muted">
            RaceDirector lost connection to the API. Please reconnect.
          </p>
          {errorMessage ? (
            <p className="mt-4 rounded-lg border border-rd-error/30 bg-rd-error/10 px-3 py-2 text-xs text-rd-error">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-rd-border px-6 py-4">
          <button
            onClick={() => void onDismiss()}
            disabled={isBusy}
            className="inline-flex items-center gap-2 rounded-lg border border-rd-warning/30 bg-rd-warning/10 px-4 py-2 text-sm font-semibold text-rd-warning transition-colors hover:bg-rd-warning/20"
          >
            {isBusy ? 'Closing…' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DisconnectNoticePopup
