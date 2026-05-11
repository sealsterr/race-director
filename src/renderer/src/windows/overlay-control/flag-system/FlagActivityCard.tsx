import type { ReactElement, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { FlagHistoryItem, SpeedAlert } from './types'
import { FLAG_TONES } from './types'
import { formatSessionElapsed } from './flagTimeUtils'

interface SpeedAlertCardProps {
  readonly alert: SpeedAlert
  readonly onDismissAlert: (id: string) => void
}

interface HistoryCardProps {
  readonly item: FlagHistoryItem
  readonly onDismissHistoryItem: (id: string) => void
}

interface ActivityCardFrameProps {
  readonly children: ReactNode
  readonly className: string
  readonly dismissDisabled?: boolean
  readonly dismissLabel: string
  readonly onDismiss: () => void
  readonly pulseTone?: {
    readonly fill: string
    readonly glow: string
  }
}

const cardBaseClass =
  'relative min-h-[120px] overflow-hidden rounded border bg-rd-bg/60 p-3 transition-colors'

const pulseTransition = {
  duration: 1.85,
  repeat: Number.POSITIVE_INFINITY,
  ease: 'easeInOut' as const
}

const layoutTransition = {
  layout: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  opacity: { duration: 0.22 },
  scale: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  y: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  filter: { duration: 0.2 }
}

const categoryBorderClass = {
  alert: 'border-rd-error/35',
  flag: 'border-cyan-400/30',
  warning: 'border-rd-warning/35'
} as const

const getAlertTitleClass = (kind: SpeedAlert['kind']): string => {
  if (kind === 'penalty') return 'text-rd-error'
  return 'text-rd-gold'
}

const getFlagTitleClass = (item: FlagHistoryItem): string => {
  if (item.kind === 'warning') return 'text-rd-warning'
  if (item.flagType === 'RED') return 'text-rd-error'
  if (item.flagType === 'YELLOW' || item.flagType === 'FCY') return 'text-rd-gold'
  if (item.flagType === 'GREEN') return 'text-rd-success'
  if (item.flagType === 'SC' || item.flagType === 'SC_THIS_LAP') return 'text-sky-300'
  return 'text-rd-text'
}

function CarDriverLabel({
  carNumber,
  driverName
}: {
  readonly carNumber?: string
  readonly driverName?: string
}): ReactElement {
  return (
    <p className="mt-3 truncate text-sm font-semibold uppercase">
      {carNumber ? <span className="tracking-[0.2em] text-rd-muted">#{carNumber}</span> : null}
      {carNumber ? <span className="text-rd-subtle"> </span> : null}
      <span className="tracking-[0.12em] text-rd-text">{driverName ?? 'Unknown driver'}</span>
    </p>
  )
}

function ActivityCardFrame({
  children,
  className,
  dismissDisabled = false,
  dismissLabel,
  onDismiss,
  pulseTone
}: ActivityCardFrameProps): ReactElement {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.975, y: 10, filter: 'blur(3px)' }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.96, y: -8, filter: 'blur(4px)' }}
      transition={layoutTransition}
      className="min-w-0"
    >
      <motion.article
        animate={
          pulseTone
            ? {
                borderColor: [`${pulseTone.fill}45`, `${pulseTone.fill}9f`, `${pulseTone.fill}59`],
                boxShadow: [
                  `inset 0 0 0 1px ${pulseTone.fill}10, 0 0 8px ${pulseTone.fill}12`,
                  `inset 0 0 0 1px ${pulseTone.fill}38, 0 0 18px ${pulseTone.glow}`,
                  `inset 0 0 0 1px ${pulseTone.fill}18, 0 0 10px ${pulseTone.fill}16`
                ]
              }
            : undefined
        }
        transition={pulseTone ? pulseTransition : undefined}
        className={`${cardBaseClass} group overflow-visible ${className}`}
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-36 bg-[linear-gradient(to_left,rgba(8,9,12,0.92)_0%,rgba(8,9,12,0.78)_42%,rgba(8,9,12,0.38)_72%,rgba(8,9,12,0)_100%)] opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
        <div className="pointer-events-none absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2 opacity-0 transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
          <button
            type="button"
            aria-label={dismissLabel}
            disabled={dismissDisabled}
            onClick={onDismiss}
            className="flex h-9 w-9 appearance-none items-center justify-center border-none bg-transparent p-0 text-rd-muted shadow-none outline-none ring-0 transition-colors hover:text-rd-text focus-visible:text-rd-text disabled:cursor-default disabled:opacity-45 disabled:hover:text-rd-muted"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>
        {children}
      </motion.article>
    </motion.div>
  )
}

export function SpeedAlertCard({ alert, onDismissAlert }: SpeedAlertCardProps): ReactElement {
  const tone = FLAG_TONES.FCY

  return (
    <ActivityCardFrame
      className={categoryBorderClass.alert}
      dismissLabel="Close alert"
      onDismiss={() => {
        onDismissAlert(alert.id)
      }}
      pulseTone={alert.pulseActive ? tone : undefined}
    >
      <div className="h-full">
        <div className="min-w-0">
          <span className="font-mono text-[11px] text-rd-subtle">
            {formatSessionElapsed(alert.sessionElapsedSeconds)}
          </span>
          <p className={`mt-2 truncate text-lg font-semibold ${getAlertTitleClass(alert.kind)}`}>
            {alert.title}
          </p>
          <CarDriverLabel carNumber={alert.carNumber} driverName={alert.driverName} />
          <p className="mt-3 max-w-[17rem] text-[15px] leading-snug text-rd-muted">
            {alert.detail}
          </p>
        </div>
      </div>
    </ActivityCardFrame>
  )
}

export function HistoryCard({ item, onDismissHistoryItem }: HistoryCardProps): ReactElement {
  const cardBorderClass =
    item.kind === 'warning' ? categoryBorderClass.warning : categoryBorderClass.flag

  return (
    <ActivityCardFrame
      className={cardBorderClass}
      dismissLabel="Close card"
      onDismiss={() => onDismissHistoryItem(item.id)}
    >
      <span className="font-mono text-[11px] text-rd-subtle">
        {formatSessionElapsed(item.sessionElapsedSeconds)}
      </span>

      <p className={`mt-2 truncate text-lg font-semibold ${getFlagTitleClass(item)}`}>
        {item.title}
      </p>

      {item.driverName || item.carNumber ? (
        <CarDriverLabel carNumber={item.carNumber} driverName={item.driverName} />
      ) : null}
      <p className="mt-2 text-[15px] leading-snug text-rd-muted">{item.detail}</p>
    </ActivityCardFrame>
  )
}
