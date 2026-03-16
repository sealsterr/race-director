import type { DriverStanding, SectorTime } from "../../../types/lmu";

const MOCK_CURRENT_SECTORS: SectorTime = {
    sector1: 27.412,
    sector2: 31.865,
    sector3: 24.991,
};

const MOCK_BEST_SECTORS: SectorTime = {
    sector1: 27.301,
    sector2: 31.972,
    sector3: 24.884,
};

export const MOCK_SESSION_BEST_SECTORS: SectorTime = {
    sector1: 27.118,
    sector2: 31.551,
    sector3: 24.991,
};

export const MOCK_DRIVER: DriverStanding = {
    position: 2,
    carNumber: "16",
    driverName: "Ryan REYNOLDS",
    nationalityCode: "CAN",
    teamName: "Apex Velocity",
    carClass: "HYPERCAR",
    carName: "Ferrari 499P",
    lastLapTime: 83.406,
    bestLapTime: 84.007,
    currentSectors: MOCK_CURRENT_SECTORS,
    bestSectors: MOCK_BEST_SECTORS,
    gapToLeader: 0.124,
    intervalToAhead: 0.124,
    lapsCompleted: 18,
    lapsDown: 0,
    fuel: 62,
    tyreCompound: "SOFT",
    tyreSet: {
        frontLeft: "SOFT",
        frontRight: "SOFT",
        rearLeft: "SOFT",
        rearRight: "SOFT",
    },
    pitStopCount: 1,
    penalties: [],
    status: "RACING",
    isPlayer: true,
    isFocused: true,
    slotId: 16,
    telemetryId: 16,
};
