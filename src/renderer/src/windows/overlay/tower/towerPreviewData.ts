import type { DriverStanding, SessionInfo } from '../../../types/lmu'

function createStanding(
  standing: Partial<DriverStanding> & Pick<DriverStanding, 'position' | 'slotId' | 'driverName'>
): DriverStanding {
  return {
    position: standing.position,
    slotId: standing.slotId,
    carNumber: standing.carNumber ?? String(standing.slotId),
    driverName: standing.driverName,
    nationalityCode: standing.nationalityCode ?? 'INT',
    teamName: standing.teamName ?? 'Independent Racing',
    carClass: standing.carClass ?? 'HYPERCAR',
    carName: standing.carName ?? 'Prototype',
    lastLapTime: standing.lastLapTime ?? 191.214,
    bestLapTime: standing.bestLapTime ?? 190.982,
    currentSectors: standing.currentSectors ?? { sector1: 32.114, sector2: 58.224, sector3: null },
    bestSectors: standing.bestSectors ?? { sector1: 31.982, sector2: 57.941, sector3: null },
    gapToLeader: standing.gapToLeader ?? null,
    intervalToAhead: standing.intervalToAhead ?? null,
    lapsCompleted: standing.lapsCompleted ?? 18,
    lapsDown: standing.lapsDown ?? 0,
    fuel: standing.fuel ?? 54,
    tyreCompound: standing.tyreCompound ?? 'MEDIUM',
    tyreSet: standing.tyreSet ?? null,
    pitStopCount: standing.pitStopCount ?? 0,
    penalties: standing.penalties ?? [],
    status: standing.status ?? 'RACING',
    isPlayer: standing.isPlayer ?? false,
    isFocused: standing.isFocused ?? false,
    telemetryId: standing.telemetryId ?? standing.slotId
  }
}

export const TOWER_PREVIEW_SESSION: SessionInfo = {
  sessionType: 'RACE',
  trackName: 'Circuit de la Sarthe',
  currentLap: 19,
  totalLaps: 24,
  timeRemaining: 1542,
  totalSessionTime: 8640,
  sessionTime: 7200,
  flagState: 'GREEN',
  numCars: 8,
  numCarsOnTrack: 8,
  isActive: true
}

export const TOWER_PREVIEW_STANDINGS: DriverStanding[] = [
  createStanding({
    position: 1,
    slotId: 51,
    carNumber: '51',
    driverName: 'Antonio GIOVINAZZI',
    nationalityCode: 'IT',
    teamName: 'Ferrari AF Corse',
    carName: 'Ferrari 499P',
    tyreCompound: 'SOFT',
    tyreSet: { frontLeft: 'SOFT', frontRight: 'SOFT', rearLeft: 'SOFT', rearRight: 'SOFT' },
    isFocused: true
  }),
  createStanding({
    position: 2,
    slotId: 6,
    carNumber: '6',
    driverName: 'Kevin ESTRE',
    nationalityCode: 'FR',
    teamName: 'Porsche Penske',
    carName: 'Porsche 963',
    gapToLeader: 0.2,
    intervalToAhead: 0.2,
    tyreCompound: 'UNKNOWN',
    tyreSet: { frontLeft: 'MEDIUM', frontRight: 'MEDIUM', rearLeft: 'SOFT', rearRight: 'SOFT' }
  }),
  createStanding({
    position: 3,
    slotId: 50,
    carNumber: '50',
    driverName: 'Miguel MOLINA',
    nationalityCode: 'ESP',
    teamName: 'Ferrari AF Corse',
    carName: 'Ferrari 499P',
    gapToLeader: 1.041,
    intervalToAhead: 0.841,
    tyreCompound: 'SOFT'
  }),
  createStanding({
    position: 4,
    slotId: 12,
    carNumber: '12',
    driverName: 'Will STEVENS',
    nationalityCode: 'GB',
    teamName: 'Cadillac Hertz Team JOTA',
    carName: 'Cadillac V-Series.R',
    gapToLeader: 2.992,
    intervalToAhead: 1.951,
    tyreCompound: 'MEDIUM'
  }),
  createStanding({
    position: 5,
    slotId: 15,
    carNumber: '15',
    driverName: 'Dries VANTHOOR',
    nationalityCode: 'DE',
    teamName: 'BMW M Team WRT',
    carName: 'BMW M Hybrid V8',
    gapToLeader: 4.804,
    intervalToAhead: 1.812,
    tyreCompound: 'MEDIUM'
  }),
  createStanding({
    position: 6,
    slotId: 46,
    carNumber: '46',
    driverName: 'Valentino ROSSI',
    nationalityCode: 'IT',
    teamName: 'Team WRT',
    carClass: 'LMGT3',
    carName: 'BMW M4 GT3',
    gapToLeader: 0,
    intervalToAhead: null,
    tyreCompound: 'MEDIUM'
  }),
  createStanding({
    position: 7,
    slotId: 92,
    carNumber: '92',
    driverName: 'Richard LIETZ',
    nationalityCode: 'DE',
    teamName: 'Manthey EMA',
    carClass: 'LMGT3',
    carName: 'Porsche 911 GT3 R',
    gapToLeader: 0.177,
    intervalToAhead: 0.177,
    tyreCompound: 'SOFT'
  }),
  createStanding({
    position: 8,
    slotId: 31,
    carNumber: '31',
    driverName: 'Augusto FARFUS',
    nationalityCode: 'BR',
    teamName: 'The Bend Team WRT',
    carClass: 'LMGT3',
    carName: 'BMW M4 GT3',
    gapToLeader: 1.124,
    intervalToAhead: 0.947,
    tyreCompound: 'HARD'
  })
]

export const TOWER_PREVIEW_START_POSITIONS = new Map<number, number>([
  [51, 2],
  [6, 1],
  [50, 4],
  [12, 5],
  [15, 3],
  [46, 1],
  [92, 3],
  [31, 2]
])
