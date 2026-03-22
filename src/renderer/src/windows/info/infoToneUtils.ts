import type { CarClass, ConnectionStatus, DriverStatus } from '../../types/lmu'

export const CLASS_BADGE_CLASSES: Record<CarClass, string> = {
  HYPERCAR: 'bg-rd-class-hypercar text-rd-paper',
  LMP2: 'bg-rd-class-lmp2 text-rd-paper',
  LMP3: 'bg-rd-class-lmp3 text-rd-ink',
  LMGT3: 'bg-rd-class-lmgt3 text-rd-ink',
  GTE: 'bg-rd-class-gte text-rd-ink',
  UNKNOWN: 'bg-rd-panel-strong text-rd-muted ring-1 ring-inset ring-rd-border'
}

export const STATUS_BADGE_CLASSES: Record<DriverStatus, string> = {
  RACING: 'bg-rd-success-soft text-rd-success ring-1 ring-inset ring-rd-success/25',
  PITTING: 'bg-rd-gold-soft text-rd-gold ring-1 ring-inset ring-rd-gold/25',
  RETIRED: 'bg-rd-error-soft text-rd-error ring-1 ring-inset ring-rd-error/25',
  FINISHED: 'bg-rd-panel-strong text-rd-muted ring-1 ring-inset ring-rd-border',
  DISQUALIFIED: 'bg-rd-error-soft text-rd-error ring-1 ring-inset ring-rd-error/25',
  CONTACT: 'bg-rd-gold-soft text-rd-warning ring-1 ring-inset ring-rd-warning/25',
  CRASHED: 'animate-rd-flash bg-rd-error-soft text-rd-error ring-1 ring-inset ring-rd-error/25',
  FIGHTING:
    'bg-rd-logo-secondary/18 text-rd-logo-secondary ring-1 ring-inset ring-rd-logo-secondary/25',
  UNKNOWN: 'bg-rd-panel-strong text-rd-subtle ring-1 ring-inset ring-rd-border'
}

export const getConnectionDotClass = (connection: ConnectionStatus): string => {
  if (connection === 'CONNECTED') {
    return 'bg-rd-success'
  }

  if (connection === 'CONNECTING') {
    return 'animate-rd-flash bg-rd-warning'
  }

  if (connection === 'ERROR') {
    return 'animate-rd-flash bg-rd-error'
  }

  return 'bg-rd-subtle'
}

export const getClassFilterClass = (carClass: CarClass, isActive: boolean): string => {
  if (isActive) {
    return CLASS_BADGE_CLASSES[carClass]
  }

  return 'bg-rd-panel text-rd-subtle ring-1 ring-inset ring-rd-border opacity-60'
}
