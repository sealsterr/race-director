import React, { type ReactNode } from 'react'
import { X } from 'lucide-react'

interface SystemDialogFrameProps {
  readonly maxWidth: number
  readonly borderClassName: string
  readonly iconClassName: string
  readonly icon: ReactNode
  readonly eyebrow: string
  readonly eyebrowClassName: string
  readonly title: string
  readonly titleClassName?: string
  readonly closeAriaLabel: string
  readonly onClose: () => void | Promise<void>
  readonly isWindowFrame?: boolean
  readonly children: ReactNode
  readonly footer: ReactNode
}

const dragRegion = { WebkitAppRegion: 'drag' } as React.CSSProperties
const noDragRegion = { WebkitAppRegion: 'no-drag' } as React.CSSProperties

export function SystemDialogFrame({
  maxWidth,
  borderClassName,
  iconClassName,
  icon,
  eyebrow,
  eyebrowClassName,
  title,
  titleClassName = 'mt-1 text-2xl font-semibold text-rd-text',
  closeAriaLabel,
  onClose,
  isWindowFrame = false,
  children,
  footer
}: SystemDialogFrameProps): React.ReactElement {
  return (
    <div
      className={
        isWindowFrame
          ? 'h-screen w-screen bg-transparent p-3 text-rd-text'
          : 'w-full p-3 text-rd-text'
      }
      style={isWindowFrame ? noDragRegion : { maxWidth }}
    >
      <div
        className={`flex ${isWindowFrame ? 'h-full' : ''} w-full flex-col overflow-hidden rounded-2xl border bg-rd-surface shadow-2xl ${borderClassName}`}
      >
        <div
          className="flex items-start justify-between gap-4 border-b border-rd-border px-6 py-5"
          style={isWindowFrame ? dragRegion : undefined}
        >
          <div className="flex items-center gap-4">
            <div className={iconClassName}>{icon}</div>
            <div>
              <p className={eyebrowClassName}>{eyebrow}</p>
              <h1 className={titleClassName}>{title}</h1>
            </div>
          </div>
          <button
            aria-label={closeAriaLabel}
            onClick={() => void onClose()}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rd-border bg-rd-elevated text-rd-subtle transition-colors hover:border-rd-muted hover:text-rd-text"
            style={isWindowFrame ? noDragRegion : undefined}
          >
            <X size={15} />
          </button>
        </div>

        {children}

        <div
          className="flex justify-end gap-3 border-t border-rd-border px-6 py-4"
          style={isWindowFrame ? noDragRegion : undefined}
        >
          {footer}
        </div>
      </div>
    </div>
  )
}
