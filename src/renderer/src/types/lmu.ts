// -- session --

export type SessionType = 
    | "PRACTICE"
    | "QUALIFYING"
    | "RACE"
    | "UNKNOWN";

export type FlagState =
    | "GREEN" // custom
    | "YELLOW"
    | "FULL_COURSE_YELLOW" // custom
    | "SAFETY_CAR" // custom
    | "RED" // custom
    | "CHEQUERED" 
    | "NONE";

// -- for dashboard info panel --
export interface SessionInfo {
    sessionType: SessionType;
    trackName: string;
    currentLap: number;
    totalLaps: number;
    timeRemaining: number; // in s
    sessionTime: number; // elapsed time in s
    flagState: FlagState;
    numCars: number;
    numCarsOnTrack: number;
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

//  -- custom detect -- 
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
    sector2: number | null;
    sector3: number | null;
}

export interface DriverStanding {
    position: number;
    carNumber: string;
    driverName: string;
    teamName: string;
    carClass: CarClass;
    carName: string;
    lastLapTime: number | null; // in s, null if not completed
    bestLapTime: number | null;
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
    slotId: number;
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