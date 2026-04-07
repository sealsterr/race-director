import type { SessionInfo } from '../../../types/lmu'

export const SESSION_PREVIEW_STEP_MS = 3000
const PREVIEW_TOTAL_SESSION_TIME = 144 * 60

export const SESSION_PREVIEW_SEQUENCE: readonly SessionInfo[] = [
  {
    sessionType: 'RACE',
    trackName: 'Circuit de la Sarthe',
    currentLap: 1,
    totalLaps: 24,
    timeRemaining: PREVIEW_TOTAL_SESSION_TIME,
    totalSessionTime: PREVIEW_TOTAL_SESSION_TIME,
    sessionTime: 0,
    flagState: 'NONE',
    numCars: 36,
    numCarsOnTrack: 35,
    isActive: true
  },
  {
    sessionType: 'RACE',
    trackName: 'Circuit de la Sarthe',
    currentLap: 6,
    totalLaps: 24,
    timeRemaining: 6105,
    totalSessionTime: PREVIEW_TOTAL_SESSION_TIME,
    sessionTime: PREVIEW_TOTAL_SESSION_TIME - 6105,
    flagState: 'YELLOW',
    numCars: 36,
    numCarsOnTrack: 34,
    isActive: true
  },
  {
    sessionType: 'RACE',
    trackName: 'Circuit de la Sarthe',
    currentLap: 6,
    totalLaps: 24,
    timeRemaining: 6102,
    totalSessionTime: PREVIEW_TOTAL_SESSION_TIME,
    sessionTime: PREVIEW_TOTAL_SESSION_TIME - 6102,
    flagState: 'GREEN',
    numCars: 36,
    numCarsOnTrack: 35,
    isActive: true
  },
  {
    sessionType: 'RACE',
    trackName: 'Circuit de la Sarthe',
    currentLap: 18,
    totalLaps: 24,
    timeRemaining: 1680,
    totalSessionTime: PREVIEW_TOTAL_SESSION_TIME,
    sessionTime: PREVIEW_TOTAL_SESSION_TIME - 1680,
    flagState: 'RED',
    numCars: 36,
    numCarsOnTrack: 29,
    isActive: true
  },
  {
    sessionType: 'RACE',
    trackName: 'Circuit de la Sarthe',
    currentLap: 18,
    totalLaps: 24,
    timeRemaining: 1677,
    totalSessionTime: PREVIEW_TOTAL_SESSION_TIME,
    sessionTime: PREVIEW_TOTAL_SESSION_TIME - 1677,
    flagState: 'GREEN',
    numCars: 36,
    numCarsOnTrack: 34,
    isActive: true
  },
  {
    sessionType: 'RACE',
    trackName: 'Circuit de la Sarthe',
    currentLap: 24,
    totalLaps: 24,
    timeRemaining: 0,
    totalSessionTime: PREVIEW_TOTAL_SESSION_TIME,
    sessionTime: PREVIEW_TOTAL_SESSION_TIME,
    flagState: 'CHEQUERED',
    numCars: 36,
    numCarsOnTrack: 35,
    isActive: true
  }
]
