import React from 'react'
import { AlertTriangle, Power, WifiOff } from 'lucide-react'
import { SystemDialogFrame } from './SystemDialogFrame'

interface QuitConfirmDialogProps {
  readonly dontAskAgain: boolean
  readonly onDontAskAgainChange: (value: boolean) => void
  readonly onCancel: () => void | Promise<void>
  readonly onConfirm: () => void | Promise<void>
  readonly isBusy?: boolean
  readonly errorMessage?: string | null
  readonly isWindowFrame?: boolean
}

interface DisconnectNoticeDialogProps {
  readonly onDismiss: () => void | Promise<void>
  readonly isBusy?: boolean
  readonly errorMessage?: string | null
  readonly isWindowFrame?: boolean
}

const noDragRegion = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

export function QuitConfirmDialog({
  dontAskAgain,
  onDontAskAgainChange,
  onCancel,
  onConfirm,
  isBusy = false,
  errorMessage = null,
  isWindowFrame = false
}: QuitConfirmDialogProps): React.ReactElement {
  return (
    <SystemDialogFrame
      maxWidth={490}
      borderClassName="border-rd-accent/25"
      iconClassName="flex h-12 w-12 items-center justify-center rounded-xl bg-rd-accent/12 text-rd-accent"
      icon={<AlertTriangle size={24} />}
      eyebrow="Confirm Quit"
      eyebrowClassName="text-xs font-bold uppercase tracking-[0.24em] text-rd-accent"
      title="Quit RaceDirector?"
      closeAriaLabel="Cancel quit"
      onClose={onCancel}
      isWindowFrame={isWindowFrame}
      footer={
        <>
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
            {isBusy ? 'Closing...' : 'Quit RaceDirector'}
          </button>
        </>
      }
    >
      <div className="flex-1 px-6 py-5">
        <p className="break-words text-sm leading-6 text-rd-muted">
          This action will close everything.
        </p>

        <label
          className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-rd-border bg-rd-elevated px-4 py-3"
          style={isWindowFrame ? noDragRegion : undefined}
        >
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
    </SystemDialogFrame>
  )
}

export function DisconnectNoticeDialog({
  onDismiss,
  isBusy = false,
  errorMessage = null,
  isWindowFrame = false
}: DisconnectNoticeDialogProps): React.ReactElement {
  return (
    <SystemDialogFrame
      maxWidth={460}
      borderClassName="border-rd-warning/25"
      iconClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rd-warning/15 text-rd-warning"
      icon={<WifiOff size={22} />}
      eyebrow="Connection Lost"
      eyebrowClassName="text-xs font-bold uppercase tracking-[0.22em] text-rd-warning"
      title="Disconnected from lobby"
      titleClassName="mt-0.5 text-xl font-semibold text-rd-text"
      closeAriaLabel="Dismiss notice"
      onClose={onDismiss}
      isWindowFrame={isWindowFrame}
      footer={
        <button
          onClick={() => void onDismiss()}
          disabled={isBusy}
          className="inline-flex items-center gap-2 rounded-lg border border-rd-warning/30 bg-rd-warning/10 px-4 py-2 text-sm font-semibold text-rd-warning transition-colors hover:bg-rd-warning/20"
        >
          {isBusy ? 'Closing...' : 'Continue'}
        </button>
      }
    >
      <div className="flex-1 px-6 py-5">
        <p className="break-words text-sm leading-6 text-rd-muted">
          RaceDirector lost connection to the API. Please reconnect.
        </p>
        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-rd-error/30 bg-rd-error/10 px-3 py-2 text-xs text-rd-error">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </SystemDialogFrame>
  )
}
