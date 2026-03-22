const EMPTY_VALUE = '—'

export const formatTime = (seconds: number | null): string => {
  if (seconds === null || seconds <= 0) {
    return EMPTY_VALUE
  }

  const minutes = Math.floor(seconds / 60)
  const remainder = (seconds % 60).toFixed(3).padStart(6, '0')

  return minutes > 0 ? `${minutes}:${remainder}` : remainder
}

export const formatGap = (seconds: number | null, isLeader: boolean): string => {
  if (isLeader) {
    return 'LEAD'
  }

  if (seconds === null) {
    return EMPTY_VALUE
  }

  return seconds.toFixed(3)
}

export const formatFuel = (fuel: number | null): string => {
  if (fuel === null) {
    return EMPTY_VALUE
  }

  return `${fuel.toFixed(1)}%`
}

export const formatLapSummary = (currentLap: number, totalLaps: number): string => {
  if (totalLaps > 0) {
    return `${currentLap} / ${totalLaps}`
  }

  return `${currentLap} / ${EMPTY_VALUE}`
}
