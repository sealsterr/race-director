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
} from "../../shared/types";

// -- raw API shapes --
// -- these match what the LMU REST API actually returns --

interface RawSessionInfo {
  session: number;          // 0 = Practice, 1 = Qualifying, 5 = Race, etc.
  trackName: string;
  currentLap: number;
  maxLaps: number;
  endET: number;            // session end elapsed time
  currentET: number;        // current elapsed time
  gamePhase: number;        // flag / phase state
  inRealtime: boolean;
}

interface RawVehicleInfo {
  place: number;
  vehicleClass: string;
  vehicleNum: string;
  driverName: string;
  teamName: string;
  vehicleName: string;
  lastLapTime: number;      // -1 if no lap set
  bestLapTime: number;      // -1 if no lap set
  timeBehindLeader: number;
  timeBehindNext: number;
  lapsCompleted: number;
  lapsBehindLeader: number;
  pit: boolean;
  inPits: boolean;
  numPitStops: number;
  finish: boolean;
  dnf: boolean;
  dq: boolean;
  isPlayer: boolean;
  sector1LastLap: number;
  sector2LastLap: number;
  sector3LastLap: number;
}

// -- mapping helpers --

const mapSessionType = (session: number): SessionType => {
  const map: Record<number, SessionType> = {
    0: "PRACTICE",
    1: "PRACTICE",
    2: "PRACTICE",
    3: "QUALIFYING",
    4: "QUALIFYING",
    5: "WARMUP",
    6: "RACE",
    7: "RACE",
  };
  return map[session] ?? "UNKNOWN";
};

const mapFlagState = (gamePhase: number): FlagState => {
  const map: Record<number, FlagState> = {
    0: "NONE",
    1: "GREEN",
    2: "FULL_COURSE_YELLOW",
    3: "YELLOW",
    4: "SAFETY_CAR",
    5: "RED",
    9: "CHEQUERED",
  };
  return map[gamePhase] ?? "NONE";
};

const mapCarClass = (vehicleClass: string): CarClass => {
  const upper = vehicleClass.toUpperCase();
  if (upper.includes("HYPERCAR") || upper.includes("LMH")) return "HYPERCAR";
  if (upper.includes("LMP2")) return "LMP2";
  if (upper.includes("LMP3")) return "LMP3";
  if (upper.includes("LMGT3") || upper.includes("GT3")) return "LMGT3";
  if (upper.includes("GTE")) return "GTE";
  return "UNKNOWN";
};

// -- LMU doesn't expose tyre compound directly in the REST API yet --
// -- we default to UNKNOWN and will enrich this via shared memory later --
const mapTyreCompound = (): TyreCompound => "UNKNOWN";

const mapDriverStatus = (vehicle: RawVehicleInfo): DriverStatus => {
  if (vehicle.dq) return "DISQUALIFIED";
  if (vehicle.dnf) return "RETIRED";
  if (vehicle.finish) return "FINISHED";
  if (vehicle.inPits || vehicle.pit) return "PITTING";
  return "RACING";
};

const mapSectorTime = (s1: number, s2: number, s3: number): SectorTime => ({
  sector1: s1 > 0 ? s1 : null,
  sector2: s2 > 0 ? s2 : null,
  sector3: s3 > 0 ? s3 : null,
});

// -- transform functions --

const transformSession = (raw: RawSessionInfo): SessionInfo => ({
  sessionType: mapSessionType(raw.session),
  trackName: raw.trackName || "Unknown Track",
  currentLap: raw.currentLap,
  totalLaps: raw.maxLaps,
  timeRemaining: Math.max(0, raw.endET - raw.currentET),
  sessionTime: raw.currentET,
  flagState: mapFlagState(raw.gamePhase),
  isActive: raw.inRealtime,
});

const transformVehicle = (raw: RawVehicleInfo): DriverStanding => ({
  position: raw.place,
  carNumber: raw.vehicleNum,
  driverName: raw.driverName,
  teamName: raw.teamName,
  carClass: mapCarClass(raw.vehicleClass),
  carName: raw.vehicleName,
  lastLapTime: raw.lastLapTime > 0 ? raw.lastLapTime : null,
  bestLapTime: raw.bestLapTime > 0 ? raw.bestLapTime : null,
  currentSectors: { sector1: null, sector2: null, sector3: null },
  bestSectors: mapSectorTime(
    raw.sector1LastLap,
    raw.sector2LastLap,
    raw.sector3LastLap
  ),
  gapToLeader: raw.timeBehindLeader > 0 ? raw.timeBehindLeader : null,
  intervalToAhead: raw.timeBehindNext > 0 ? raw.timeBehindNext : null,
  lapsCompleted: raw.lapsCompleted,
  lapsDown: raw.lapsBehindLeader,
  fuel: null,
  tyreCompound: mapTyreCompound(),
  pitStopCount: raw.numPitStops,
  penalties: [],
  status: mapDriverStatus(raw),
  isPlayer: raw.isPlayer,
});

// -- LmuApiClient --

type StateUpdateCallback = (state: AppState) => void;
type ConnectionCallback = (status: ConnectionStatus) => void;

export class LmuApiClient {
  private baseUrl: string = "http://localhost:5397";
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

    // -- test connection with a single fetch before starting poll loop --
    const alive = await this.ping();
    if (!alive) {
      this.emitConnection("ERROR");
      // -- auto-reset to DISCONNECTED after error --
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
      connection: "DISCONNECTED",
      session: null,
      standings: [],
    };
    this.emitConnection("DISCONNECTED");
  }

  // -- private methods --

  private async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/rest/watch/sessionInfo`, {
        signal: AbortSignal.timeout(3000), // 3s timeout
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private startPolling(): void {
    this.stopPolling(); // Clear any existing timer first
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
      const [sessionRes, vehiclesRes] = await Promise.all([
        fetch(`${this.baseUrl}/rest/watch/sessionInfo`),
        fetch(`${this.baseUrl}/rest/watch/vehicleInfo`),
      ]);

      if (!sessionRes.ok || !vehiclesRes.ok) {
        this.handlePollError();
        return;
      }

      const rawSession = (await sessionRes.json()) as RawSessionInfo;
      const rawVehicles = (await vehiclesRes.json()) as RawVehicleInfo[];

      const newState: AppState = {
        connection: "CONNECTED",
        session: transformSession(rawSession),
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