import React from 'react'
import type { CarClass, DriverStatus } from '../../types/lmu'
import { CLASS_BADGE_CLASSES, STATUS_BADGE_CLASSES } from './infoToneUtils'

export const ClassBadge = ({ carClass }: { carClass: CarClass }): React.ReactElement => (
  <span
    className={`rounded-full px-2 py-1 font-mono text-[10px] font-semibold ${CLASS_BADGE_CLASSES[carClass]}`}
  >
    {carClass === 'UNKNOWN' ? '???' : carClass}
  </span>
)

export const StatusBadge = ({ status }: { status: DriverStatus }): React.ReactElement => (
  <span
    className={`rounded-full px-2 py-1 font-mono text-[10px] font-semibold ${STATUS_BADGE_CLASSES[status]}`}
  >
    {status}
  </span>
)
