export type SpeedUnit = 'kph' | 'mph'

export interface MeasurementUnits {
  speedUnit: SpeedUnit
}

export const DEFAULT_MEASUREMENT_UNITS: MeasurementUnits = {
  speedUnit: 'kph'
}

export function convertSpeedFromKph(valueKph: number, speedUnit: SpeedUnit): number {
  return speedUnit === 'mph' ? valueKph * 0.621371 : valueKph
}

export function formatSpeedValue(valueKph: number, speedUnit: SpeedUnit): string {
  return `${Math.max(0, Math.round(convertSpeedFromKph(valueKph, speedUnit)))}`
}

export function getSpeedUnitLabel(speedUnit: SpeedUnit): string {
  return speedUnit === 'mph' ? 'MPH' : 'KPH'
}
