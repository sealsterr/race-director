import type { CarClass } from '../../types/lmu'

export type ColumnKey =
  | 'position'
  | 'class'
  | 'carNumber'
  | 'driver'
  | 'team'
  | 'lastLap'
  | 'bestLap'
  | 'gap'
  | 'interval'
  | 'lapsDown'
  | 'fuel'
  | 'tyres'
  | 'pits'
  | 'penalties'
  | 'status'

export interface ColumnDef {
  key: ColumnKey
  label: string
  defaultVisible: boolean
}

export const DEFAULT_CAMERA = 4

export const COLUMNS: ColumnDef[] = [
  { key: 'position', label: 'P', defaultVisible: true },
  { key: 'class', label: 'Class', defaultVisible: true },
  { key: 'carNumber', label: '#', defaultVisible: true },
  { key: 'driver', label: 'Driver', defaultVisible: true },
  { key: 'team', label: 'Team', defaultVisible: false },
  { key: 'lastLap', label: 'Last Lap', defaultVisible: true },
  { key: 'bestLap', label: 'Best Lap', defaultVisible: true },
  { key: 'gap', label: 'Gap', defaultVisible: true },
  { key: 'interval', label: 'Interval', defaultVisible: true },
  { key: 'lapsDown', label: 'Laps Down', defaultVisible: true },
  { key: 'fuel', label: 'Fuel', defaultVisible: true },
  { key: 'tyres', label: 'Tyres', defaultVisible: true },
  { key: 'pits', label: 'Pits', defaultVisible: true },
  { key: 'penalties', label: 'Penalties', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true }
]

export const ALL_CLASSES: CarClass[] = ['HYPERCAR', 'LMP2', 'LMP3', 'LMGT3', 'GTE', 'UNKNOWN']
