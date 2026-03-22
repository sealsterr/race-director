import React from 'react'
import type { ConnectionStatus } from '../../../types/lmu'
import { getConnectionDotClass } from '../infoToneUtils'

interface InfoHeaderProps {
  title: string
  sessionType: string | null
  sessionCars: string | null
  connection: ConnectionStatus
}

const InfoHeader = ({
  title,
  sessionType,
  sessionCars,
  connection
}: InfoHeaderProps): React.ReactElement => (
  <div
    className="rd-panel-header flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rd-border bg-rd-surface/90 px-3 py-2 sm:px-4"
    style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
  >
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-rd-accent">
        Info Window
      </span>
      <div className="hidden h-4 w-px bg-rd-border sm:block" />
      <span className="min-w-0 font-mono text-xs text-rd-muted">{title}</span>
      {sessionType && (
        <>
          <div className="hidden h-4 w-px bg-rd-border sm:block" />
          <span className="font-mono text-xs text-rd-subtle">{sessionType}</span>
        </>
      )}
      {sessionCars && (
        <>
          <div className="hidden h-4 w-px bg-rd-border sm:block" />
          <span className="font-mono text-xs text-rd-subtle">{sessionCars}</span>
        </>
      )}
    </div>

    <div
      className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${getConnectionDotClass(connection)}`} />
      <span className="font-mono text-xs text-rd-muted">{connection}</span>
    </div>
  </div>
)

export default InfoHeader
