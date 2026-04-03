import { useSyncExternalStore } from 'react'
import type { MeasurementUnits } from '../../../shared/measurementUnits'
import {
  getMeasurementUnitsSnapshot,
  subscribeMeasurementUnits
} from '../units/measurementUnitStore'

export function useMeasurementUnits(): MeasurementUnits {
  return useSyncExternalStore(
    subscribeMeasurementUnits,
    getMeasurementUnitsSnapshot,
    getMeasurementUnitsSnapshot
  )
}
