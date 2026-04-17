export function clampTelemetryMetric(value: number | null | undefined): number {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, value)
}

export function smoothTelemetryValue(
  current: number,
  target: number,
  deltaSeconds: number,
  responsiveness: number
): number {
  if (Math.abs(current - target) < 0.02) {
    return target
  }

  const easing = 1 - Math.exp(-deltaSeconds * responsiveness)
  return current + (target - current) * easing
}
