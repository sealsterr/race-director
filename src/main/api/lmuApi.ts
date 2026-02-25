// src/main/api/lmuApi.ts

import type {
  AppState,
  SessionInfo,
  DriverStanding,
  SessionType,
  FlagState,
  CarClass,
  TyreCompound,
  DriverStatus,
  ConnectionStatus,
  SectorTime,
  Penalty,
} from "../../shared/types";

// -- raw API shapes --
// -- these match what the LMU REST API actually returns --

interface RawSessionInfo {
  session: string;           // "PRACTICE1", "QUALIFY1", "RACE1", etc.
  trackName: string;
  currentEventTime: number;  // elapsed time in seconds
  endEventTime: number;      // session end time in seconds
  maxTime: number;           // max session time in seconds
  timeRemainingInGamePhase: number;      // in s
  maximumLaps: number;       // 4294967295 means no lap limit
  gamePhase: number;         // numeric phase (not used for flag)
  yellowFlagState: string;   // "NONE", "PENDING", "RESUME", "FULLCOURSE"
  inRealtime: boolean;
  numberOfVehicles: number;
  sectorFlag: string[];      // per-sector flag states
  
}

interface RawVehicleStanding {
  position: number;
  carClass: string;          // "Hyper", "LMP2", "LMP3", "GT3", etc.
  carNumber: string;         // often empty string!
  slotID: number;            // reliable unique identifier
  driverName: string;
  fullTeamName: string;
  vehicleName: string;       // "Aston Martin THOR Team 2025 #007:EC"
  vehicleFilename: string;   // "007_25_THOEAFB145B"
  lastLapTime: number;       // 0.0 if no lap set
  bestLapTime: number;       // -1.0 if no lap set
  timeBehindLeader: number;
  timeBehindNext: number;
  lapsCompleted: number;
  lapsBehindLeader: number;
  lapsBehindNext: number;
  pitting: boolean;
  inGarageStall: boolean;
  pitstops: number;
  finishStatus: string;      // "FSTAT_NONE", "FSTAT_FINISHED", "FSTAT_DNF", "FSTAT_DQ"
  penalties: number;         // count of pending penalties
  fuelFraction: number;      // 0.0 - 1.0
  flag: string;              // per-car flag: "GREEN", "YELLOW", etc.
  gamePhase: string;         // per-car game phase string
  sector: string;            // "SECTOR1", "SECTOR2", "SECTOR3"
  player: boolean;
  focus: boolean;
  hasFocus: boolean;
  currentSectorTime1: number;
  currentSectorTime2: number;
  lastSectorTime1: number;
  lastSectorTime2: number;
  bestLapSectorTime1: number;
  bestLapSectorTime2: number;
  bestSectorTime1: number;
  bestSectorTime2: number;
  qualification: number;     // grid position
}

// -- mapping helpers --

const mapSessionType = (session: string): SessionType => {
  const upper = session.toUpperCase();
  
  if (upper.startsWith("PRACTICE")) return "PRACTICE";
  if (upper.startsWith("QUALIFY")) return "QUALIFYING";
  if (upper.startsWith("RACE")) return "RACE";

  return "UNKNOWN";
};

const mapFlagState = (yellowFlagState: string, sectorFlags: string[]): FlagState => {
  // -- check for full course yellow / safety car first --
  const upper = yellowFlagState.toUpperCase();
  const map: Record<string, FlagState> = {
    NONE: "GREEN",
    PENDING: "YELLOW",
    RESUME: "YELLOW",
    FULLCOURSE: "FULL_COURSE_YELLOW",
    SAFETYCAR: "SAFETY_CAR",
  };

  // -- check sector flags for any yellows --
  const hasYellow = sectorFlags.some((f) =>
    f.toUpperCase().includes("YELLOW")
  );
  if (hasYellow && upper === "NONE") return "YELLOW";

  return map[upper] ?? "NONE";
};

const mapCarClass = (vehicleClass: string): CarClass => {
  const upper = vehicleClass.toUpperCase();
  const map: Record<string, CarClass> = {
    HYPER: "HYPERCAR",
    HYPERCAR: "HYPERCAR",
    LMH: "HYPERCAR",
    LMP2: "LMP2",
    LMP3: "LMP3",
    GT3: "LMGT3",
    LMGT3: "LMGT3",
    GTE: "GTE",
  };
  return map[upper] ?? "UNKNOWN";
};

// -- tyre compound not available via REST yet --
const mapTyreCompound = (): TyreCompound => "UNKNOWN";

const mapDriverStatus = (v: RawVehicleStanding): DriverStatus => {
  const finish = v.finishStatus.toUpperCase();
  if (finish === "FSTAT_DQ") return "DISQUALIFIED";
  if (finish === "FSTAT_DNF") return "RETIRED";
  if (finish === "FSTAT_FINISHED") return "FINISHED";
  if (v.inGarageStall) return "RETIRED";
  if (v.pitting) return "PITTING";
  return "RACING";
};

// -- extract car number from vehicleName or vehicleFilename as fallback --
// -- vehicleName format: "Make Model #007:EC" --
const extractCarNumber = (v: RawVehicleStanding): string => {
  if (v.carNumber && v.carNumber.trim() !== "") return v.carNumber;

  // -- try to extract from vehicleName: "... #007:EC" → "007" --
  const nameMatch = /#(\w+)/.exec(v.vehicleName);
  if (nameMatch) return nameMatch[1];

  // -- fallback to slotID --
  return String(v.slotID);
};

// -- clean up vehicle name for display --
// -- "Aston Martin THOR Team 2025 #007:EC" → "Aston Martin THOR" --
const cleanCarName = (vehicleName: string): string => {
  // -- strip the "#xxx:XX" suffix --
  return vehicleName.replace(/#\w+.*$/, "").trim();
};

const mapSectorTime = (s1: number, s2: number): SectorTime => ({
  sector1: s1 > 0 ? s1 : null,
  sector2: s2 > 0 ? s2 : null,
  sector3: null, // -- not available via REST --
});

// -- build penalty array from count --
// -- REST only gives us a count, detail comes later via shared memory --
const mapPenalties = (count: number): Penalty[] =>
  Array.from({ length: count }, () => ({
    type: "TIME_PENALTY" as const,
    time: 0,
    reason: "Pending penalty",
  }));

// -- transform functions --

const transformSession = (
  raw: RawSessionInfo,
  vehicles: RawVehicleStanding[],
): SessionInfo => {
  const vehicleCount = raw.numberOfVehicles > 0 ? raw.numberOfVehicles : vehicles.length;
  const current = Number.isFinite(raw.currentEventTime) 
    ? raw.currentEventTime 
    : 0;
  const remainingDirect = Number.isFinite(raw.timeRemainingInGamePhase) && raw.timeRemainingInGamePhase >= 0 
    ? raw.timeRemainingInGamePhase
    : null;
  const remainingFromMax = Number.isFinite(raw.maxTime) && raw.maxTime > 0
    ? Math.max(0, raw.maxTime - current)
    : null;               
  const timeRemaining = remainingDirect ?? remainingFromMax ?? 0;

  // -- laps --
  const noLapLimit = raw.maximumLaps >= 4294967295 || raw.maximumLaps === 0;

  // use leader lapCompleted + 1
  const leader = vehicles.length > 0 
    ? vehicles.reduce<RawVehicleStanding>((best, v) => (v.position < best.position ? v : best), vehicles[0])
    : null;

  const currentLap = leader && Number.isFinite(leader.lapsCompleted)
    ? Math.max(0, leader.lapsCompleted) + 1
    : 0;

  // -- on track --
  const numCarsOnTrack = vehicles.filter((v) => {
    const finish = (v.finishStatus ?? "").toUpperCase();
    const inactiveFinish = 
      finish === "FSTAT_DNF" ||
      finish === "FSTAT_DQ" ||
      finish === "FSTAT_FINISHED";
    
    if (inactiveFinish) return false;
    if (v.inGarageStall) return false;

    return true;
  }).length;

  return {
    sessionType: mapSessionType(raw.session),
    trackName: raw.trackName || "Unknown Track",
    currentLap,
    totalLaps: noLapLimit ? 0 : raw.maximumLaps,
    timeRemaining,
    sessionTime: current,
    flagState: mapFlagState(raw.yellowFlagState, raw.sectorFlag),
    numCars: vehicleCount,
    numCarsOnTrack,
    isActive: vehicleCount > 0,
  };
};

const transformVehicle = (raw: RawVehicleStanding): DriverStanding => ({
  position: raw.position,
  carNumber: extractCarNumber(raw),
  driverName: raw.driverName,
  teamName: raw.fullTeamName,
  carClass: mapCarClass(raw.carClass),
  carName: cleanCarName(raw.vehicleName),
  lastLapTime: raw.lastLapTime > 0 ? raw.lastLapTime : null,
  bestLapTime: raw.bestLapTime > 0 ? raw.bestLapTime : null,
  currentSectors: mapSectorTime(raw.currentSectorTime1, raw.currentSectorTime2),
  bestSectors: mapSectorTime(raw.bestSectorTime1, raw.bestSectorTime2),
  gapToLeader: raw.timeBehindLeader > 0 ? raw.timeBehindLeader : null,
  intervalToAhead: raw.timeBehindNext > 0 ? raw.timeBehindNext : null,
  lapsCompleted: raw.lapsCompleted,
  lapsDown: raw.lapsBehindLeader,
  fuel: raw.fuelFraction * 100,  // -- convert to percentage --
  tyreCompound: mapTyreCompound(),
  pitStopCount: raw.pitstops,
  penalties: mapPenalties(raw.penalties),
  status: mapDriverStatus(raw),
  isPlayer: raw.player || raw.hasFocus,
});

// -- LmuApiClient --

type StateUpdateCallback = (state: AppState) => void;
type ConnectionCallback = (status: ConnectionStatus) => void;

export class LmuApiClient {
  private baseUrl: string = "http://localhost:6397";
  private pollRate: number = 200;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private currentState: AppState = {
    connection: "DISCONNECTED",
    session: null,
    standings: [],
    lastUpdated: null,
  };

  private onStateUpdate: StateUpdateCallback | null = null;
  private onConnectionChange: ConnectionCallback | null = null;

  // -- public API --

  public configure(url: string, pollRate: number): void {
    this.baseUrl = url;
    this.pollRate = pollRate;
  }

  public setStateUpdateCallback(cb: StateUpdateCallback): void {
    this.onStateUpdate = cb;
  }

  public setConnectionCallback(cb: ConnectionCallback): void {
    this.onConnectionChange = cb;
  }

  public getState(): AppState {
    return this.currentState;
  }

  public async connect(): Promise<void> {
    this.emitConnection("CONNECTING");
    const alive = await this.ping();
    if (!alive) {
      this.emitConnection("ERROR");
      setTimeout(() => this.emitConnection("DISCONNECTED"), 3000);
      return;
    }
    this.emitConnection("CONNECTED");
    this.startPolling();
  }

  public disconnect(): void {
    this.stopPolling();
    this.currentState = {
      ...this.currentState,
      session: null,
      standings: [],
      lastUpdated: Date.now(),
    };

    this.emitConnection("DISCONNECTED");
    this.onStateUpdate?.(this.currentState);
  }

  // -- private methods --

  private async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/rest/watch/sessionInfo`, {
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollTimer = setInterval(() => {
      void this.poll();
    }, this.pollRate);
  }

  private stopPolling(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async poll(): Promise<void> {
    try {
      const [sessionRes, standingsRes] = await Promise.all([
        fetch(`${this.baseUrl}/rest/watch/sessionInfo`),
        fetch(`${this.baseUrl}/rest/watch/standings`),
      ]);

      if (!sessionRes.ok || !standingsRes.ok) {
        this.handlePollError();
        return;
      }

      const rawSession = (await sessionRes.json()) as RawSessionInfo;
      const rawVehicles = (await standingsRes.json()) as RawVehicleStanding[];

      const newState: AppState = {
        connection: "CONNECTED",
        session: transformSession(rawSession, rawVehicles),
        standings: rawVehicles.map(transformVehicle),
        lastUpdated: Date.now(),
      };

      this.currentState = newState;
      this.onStateUpdate?.(newState);
    } catch {
      this.handlePollError();
    }
  }

  private handlePollError(): void {
    this.stopPolling();
    this.emitConnection("ERROR");
    setTimeout(() => this.emitConnection("DISCONNECTED"), 3000);
  }

  private emitConnection(status: ConnectionStatus): void {
    this.currentState = { ...this.currentState, connection: status };
    this.onConnectionChange?.(status);
  }
}

// -- one client for whole app lifetime --
export const lmuClient = new LmuApiClient();