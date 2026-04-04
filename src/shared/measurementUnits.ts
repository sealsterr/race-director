export type SpeedUnit = 'kph' | 'mph'
export type TemperatureUnit = 'c' | 'f'
export type DistanceUnit = 'km' | 'mi'
export type PressureUnit = 'kpa' | 'psi' | 'bar'

export interface MeasurementUnits {
  speedUnit: SpeedUnit
  temperatureUnit: TemperatureUnit
  distanceUnit: DistanceUnit
  pressureUnit: PressureUnit
}

export const DEFAULT_MEASUREMENT_UNITS: MeasurementUnits = {
  speedUnit: 'kph',
  temperatureUnit: 'c',
  distanceUnit: 'km',
  pressureUnit: 'kpa'
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
