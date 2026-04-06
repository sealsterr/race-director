import type { SessionInfo } from '../../../types/lmu'

export const SESSION_PREVIEW_STEP_MS = 2200

export const SESSION_PREVIEW_SEQUENCE: readonly SessionInfo[] = [
  {
    sessionType: 'RACE',
    trackName: 'Circuit de la Sarthe',
    currentLap: 19,
    totalLaps: 24,
    timeRemaining: 1542,
    sessionTime: 7200,
    flagState: 'GREEN',
    numCars: 36,
    numCarsOnTrack: 34,
    isActive: true
  },
  {
    sessionType: 'RACE',
    trackName: 'Circuit de la Sarthe',
    currentLap: 19,
    totalLaps: 24,
    timeRemaining: 1538,
    sessionTime: 7204,
    flagState: 'YELLOW',
    numCars: 36,
    numCarsOnTrack: 31,
    isActive: true
  },
  {
    sessionType: 'RACE',
    trackName: 'Circuit de la Sarthe',
    currentLap: 20,
    totalLaps: 24,
    timeRemaining: 1534,
    sessionTime: 7208,
    flagState: 'GREEN',
    numCars: 36,
    numCarsOnTrack: 35,
    isActive: true
  }
]
