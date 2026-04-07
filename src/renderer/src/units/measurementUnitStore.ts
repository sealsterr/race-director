import { DEFAULT_MEASUREMENT_UNITS, type MeasurementUnits } from '../../../shared/measurementUnits'

let currentUnits: MeasurementUnits = DEFAULT_MEASUREMENT_UNITS
const listeners = new Set<() => void>()

export function applyMeasurementUnits(next: MeasurementUnits): void {
  currentUnits = next
  listeners.forEach((listener) => listener())
}

export function getMeasurementUnitsSnapshot(): MeasurementUnits {
  return currentUnits
}

export function subscribeMeasurementUnits(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
