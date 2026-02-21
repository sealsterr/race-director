// -- session --

export type SessionType = 
    | "WARMUP"
    | "PRACTICE"
    | "QUALIFYING"
    | "RACE"
    | "UNKNOWN";

export type FlagState =
    | "GREEN"
    | "YELLOW"
    | "FULL_COURSE_YELLOW"
    | "SAFETY_CAR"
    | "RED"
    | "CHEQUERED"
    | "NONE";

export interface SessionInfo {
    sessionType: SessionType;
    trackName: string;
    currentLap: number;
    totalLaps: number;
    timeRemaining: number; // in s
    sessionTime: number; // elapsed time in s
    flagState: FlagState;
    isActive: boolean;
}

// -- car --

export type CarClass = 
    | "LMGT3"
    | "GTE"
    | "LMP2"
    | "LMP3"
    | "HYPERCAR"
    | "UNKNOWN";

export type TyreCompound = 
    | "SOFT"
    | "MEDIUM"
    | "HARD"
    | "WET"
    | "UNKNOWN";

export type DriverStatus = 
    | "RACING"
    | "PITTING"
    | "RETIRED"
    | "FINISHED"
    | "DISQUALIFIED"
    | "CONTACT"
    | "CRASHED"
    | "FIGHTING"
    | "UNKNOWN";

export interface SectorTime {
    sector1: number | null; // in s, null if not completed
    sector2: number | null; // in s, null if not completed
    sector3: number | null; // in s, null if not completed
}

export interface DriverStanding {
    position: number;
    carNumber: string;
    driverName: string;
    teamName: string;
    carClass: CarClass;
    carName: string;
    lastLapTime: number | null; // in s, null if not completed
    bestLapTime: number | null; // in s, null if not completed
    currentSectors: SectorTime;
    bestSectors: SectorTime;
    gapToLeader: number | null; // in s, null if leader
    intervalToAhead: number | null; // in s, null if leader
    lapsCompleted: number;
    lapsDown: number; // compared to class leader, 0 on lead lap
    fuel: number | null; // percentage
    tyreCompound: TyreCompound;
    pitStopCount: number;
    penalties: Penalty[];
    status: DriverStatus;
    isPlayer: boolean; // is this the spectated car?
}

export type PenaltyType =
    | "DRIVE_THROUGH"
    | "STOP_AND_GO"
    | "TIME_PENALTY"
    | "DISQUALIFICATION";

export interface Penalty {
    type: PenaltyType;
    time: number; // in s
    reason: string;
}

// -- connection --

export type ConnectionStatus =
    | "CONNECTED"
    | "CONNECTING"
    | "DISCONNECTED"
    | "ERROR";

// -- app-level state --

export interface AppState {
    connection: ConnectionStatus;
    session: SessionInfo | null;
    standings: DriverStanding[];
    lastUpdated: number | null; // timestamp
}