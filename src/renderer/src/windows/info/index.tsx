import React, { useState, useEffect } from "react";
import { useRaceStore } from "../../store/raceStore"; // "@renderer/store/raceStore"
import type {
  CarClass,
  DriverStanding,
  DriverStatus,
} from "../../types/lmu";

// -- camera types --
// -- trackSideGroup lways 0 && shouldAdvance always false --
export const CAMERA_TYPES = [
  { label: "Cockpit",    value: 1,  description: "Driver eye, facing forward -> classic onboard"     },
  { label: "Grille",     value: 2,  description: "Top of hood/grille, good for watching a chaser"    },
  { label: "Chase",      value: 3,  description: "Third person, full car visible -> niche use"       },
  { label: "Trackside",  value: 4,  description: "Cycles trackside groups -> best all-round camera"  },
  { label: "Windshield", value: 6,  description: "Inside windshield offset right -> unique angle"    },
  { label: "Hood Fwd",   value: 7,  description: "Hood visible at bottom, good for chase spectating" },
  { label: "Cockpit Hi", value: 12, description: "Top-right cockpit interior -> cinematic onboard"   },
  { label: "Rear Hi",    value: 11, description: "Rear-facing elevated -> recommended for battles"   },
] as const;

export type CameraTypeValue = (typeof CAMERA_TYPES)[number]["value"];

// -- helpers --
const formatTime = (s: number | null): string => {
  if (s === null || s <= 0) return "—";

  const mins = Math.floor(s / 60);
  const secs = (s % 60).toFixed(3).padStart(6, "0");

  return mins > 0 ? `${mins}:${secs}` : `${secs}`;
};

const formatGap = (s: number | null, isLeader: boolean): string => {
  if (isLeader) return "LEAD";
  if (s === null) return "—";

  return `${s.toFixed(3)}`;
};

const formatFuel = (f: number | null): string => {
  if (f === null) return "—";
  
  return `${f.toFixed(1)}%`;
};

// -- class badge --
const CLASS_COLORS: Record<CarClass, string> = {
  HYPERCAR: "bg-red-700 text-white",
  LMP2:     "bg-blue-700 text-white",
  LMP3:     "bg-blue-400 text-rd-bg",
  LMGT3:    "bg-rd-gold text-rd-bg",
  GTE:      "bg-green-700 text-white",
  UNKNOWN:  "bg-rd-elevated text-rd-muted",
};

const ClassBadge = ({ cls }: { cls: CarClass}): React.ReactElement => (
  <span
    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${CLASS_COLORS[cls]}`}
  >
    {cls === "UNKNOWN" ? "???" : cls}
  </span>
);

// -- status badge --
const STATUS_STYLES: Record<DriverStatus, string> = {
  RACING:       "bg-rd-success/20 text-rd-success",
  PITTING:      "bg-rd-warning/20 text-rd-warning",
  RETIRED:      "bg-rd-error/20 text-rd-error",
  FINISHED:     "bg-rd-muted/20 text-rd-muted",
  DISQUALIFIED: "bg-rd-error/20 text-rd-error",
  CONTACT:      "bg-orange-500/20 text-orange-400",
  CRASHED:      "bg-rd-error/20 text-rd-error animate-rd-flash",
  FIGHTING:     "bg-purple-500/20 text-purple-400",
  UNKNOWN:      "bg-rd-elevated text-rd-subtle",
};

const PENALTY_LABEL: Record<string, string> = {
  DRIVE_THROUGH:    "DT",
  STOP_AND_GO:      "S&G",
  TIME_PENALTY:     "+T",
  DISQUALIFICATION: "DQ",
};

const StatusBadge = ({ status }: { status: DriverStatus }): React.ReactElement => (
  <span
    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${STATUS_STYLES[status]}`}
  >
    {status}
  </span>
);

// -- column config --
type ColumnKey = 
  | "position"
  | "class"
  | "carNumber"
  | "driver"
  | "team"
  | "lastLap"
  | "bestLap"
  | "gap"
  | "interval"
  | "lapsDown"
  | "fuel"
  | "tyres"
  | "pits"
  | "penalties"
  | "status";

interface ColumnDef {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
}

const COLUMNS: ColumnDef[] = [
  { key: "position",   label: "P",          defaultVisible: true  },
  { key: "class",      label: "Class",      defaultVisible: true  },
  { key: "carNumber",  label: "#",          defaultVisible: true  },
  { key: "driver",     label: "Driver",     defaultVisible: true  },
  { key: "team",       label: "Team",       defaultVisible: false },
  { key: "lastLap",    label: "Last Lap",   defaultVisible: true  },
  { key: "bestLap",    label: "Best Lap",   defaultVisible: true  },
  { key: "gap",        label: "Gap",        defaultVisible: true  },
  { key: "interval",   label: "Interval",   defaultVisible: true  },
  { key: "lapsDown",   label: "Laps Down",  defaultVisible: true  },
  { key: "fuel",       label: "Fuel",       defaultVisible: true  },
  { key: "tyres",      label: "Tyres",      defaultVisible: true  },
  { key: "pits",       label: "Pits",       defaultVisible: true  },
  { key: "penalties",  label: "Pen",        defaultVisible: true  },
  { key: "status",     label: "Status",     defaultVisible: true  },
];

// -- class filter --
const ALL_CLASSES: CarClass[] = [
  "HYPERCAR", "LMP2", "LMP3", "LMGT3", "GTE", "UNKNOWN"
];

// -- row --
interface RowProps {
  driver: DriverStanding;
  visibleCols: Set<ColumnKey>;
  isLapped: boolean;
}

// -- cell components --

const CellPosition = ({ v }: { v: DriverStanding }) => (
  <td className="border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 text-center font-mono text-xs font-semibold">
    {v.position}
  </td>
);

const CellClass = ({ v }: { v: DriverStanding }) => (
  <td className="border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 text-center">
    <ClassBadge cls={v.carClass} />
  </td>
);

const CellCarNumber = ({ v }: { v: DriverStanding }) => (
  <td className="border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 text-center font-mono text-xs text-rd-muted">
    #{v.carNumber}
  </td>
);

const CellDriver = ({ v }: { v: DriverStanding }) => (
  <td className="border-r border-rd-border px-2 py-1.5 last:border-r-0">
    <span className={`text-xs font-medium ${v.isPlayer ? "text-rd-gold" : "text-rd-text"}`}>
      {v.driverName}
    </span>
  </td>
);

const CellTeam = ({ v }: { v: DriverStanding }) => (
  <td className="max-w-[140px] truncate border-r border-rd-border px-2 py-1.5 text-center text-xs text-rd-muted">
    {v.teamName || "—"}
  </td>
);

const CellLastLap = ({ v }: { v: DriverStanding }) => (
  <td className="border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 font-mono text-xs text-rd-muted">
    {formatTime(v.lastLapTime)}
  </td>
);

const CellBestLap = ({ v }: { v: DriverStanding }) => (
  <td className="border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 font-mono text-xs text-rd-text">
    {formatTime(v.bestLapTime)}
  </td>
);

const CellGap = ({ v }: { v: DriverStanding }) => {
  const isLeader = v.position === 1;
  return (
    <td className={`border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 font-mono text-xs ${isLeader ? "font-semibold text-rd-success" : "text-rd-muted"}`}>
      {formatGap(v.gapToLeader, isLeader)}
    </td>
  );
};

const CellInterval = ({ v }: { v: DriverStanding }) => {
  const isLeader = v.position === 1;
  return (
    <td className="border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 font-mono text-xs text-rd-subtle">
      {isLeader ? "—" : formatGap(v.intervalToAhead, false)}
    </td>
  );
};

const CellLapsDown = ({ v }: { v: DriverStanding }) => (
  <td className={`border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 font-mono text-xs ${v.lapsDown > 0 ? "text-rd-warning" : "text-rd-subtle"}`}>
    {v.lapsDown > 0 ? `+${v.lapsDown}L` : "—"}
  </td>
);

const CellFuel = ({ v }: { v: DriverStanding }) => {
  let fuelColor = "text-rd-muted";
  if (v.fuel !== null && v.fuel < 10) fuelColor = "text-rd-error";
  else if (v.fuel !== null && v.fuel < 25) fuelColor = "text-rd-warning";
  return (
    <td className={`border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 font-mono text-xs ${fuelColor}`}>
      {formatFuel(v.fuel)}
    </td>
  );
};

const CellTyres = ({ v }: { v: DriverStanding }) => (
  <td className="border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 text-center font-mono text-xs text-rd-subtle">
    {v.tyreCompound === "UNKNOWN" ? "—" : v.tyreCompound}
  </td>
);

const CellPits = ({ v }: { v: DriverStanding }) => (
  <td className="border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 text-center font-mono text-xs text-rd-muted">
    {v.pitStopCount}
  </td>
);

const CellPenalties = ({ v }: { v: DriverStanding }) => {
  if (v.penalties.length === 0) {
    return (
      <td className="border-r border-rd-border px-2 py-1.5 text-center font-mono text-xs text-rd-subtle last:border-r-0">
        —
      </td>
    );
  }
  return (
    <td className="border-r border-rd-border px-2 py-1.5 text-center last:border-r-0">
      <div className="flex flex-wrap justify-center gap-0.5">
        {v.penalties.map((p, i) => (
          <span
            key={`${p.type}-${i}`}
            className="rounded bg-rd-error/20 px-1 font-mono text-[10px] font-semibold text-rd-error"
          >
            {PENALTY_LABEL[p.type] ?? p.type}
          </span>
        ))}
      </div>
    </td>
  );
};

const CellStatus = ({ v }: { v: DriverStanding }) => (
  <td className="border-r border-rd-border px-2 py-1.5 text-center last:border-r-0 text-center">
    <StatusBadge status={v.status} />
  </td>
);

const CELL_MAP: Record<ColumnKey, (v: DriverStanding) => React.ReactElement> = {
  position:  (v) => <CellPosition  key="position"  v={v} />,
  class:     (v) => <CellClass     key="class"     v={v} />,
  carNumber: (v) => <CellCarNumber key="carNumber" v={v} />,
  driver:    (v) => <CellDriver    key="driver"    v={v} />,
  team:      (v) => <CellTeam      key="team"      v={v} />,
  lastLap:   (v) => <CellLastLap   key="lastLap"   v={v} />,
  bestLap:   (v) => <CellBestLap   key="bestLap"   v={v} />,
  gap:       (v) => <CellGap       key="gap"       v={v} />,
  interval:  (v) => <CellInterval  key="interval"  v={v} />,
  lapsDown:  (v) => <CellLapsDown  key="lapsDown"  v={v} />,
  fuel:      (v) => <CellFuel      key="fuel"      v={v} />,
  tyres:     (v) => <CellTyres     key="tyres"     v={v} />,
  pits:      (v) => <CellPits      key="pits"      v={v} />,
  penalties: (v) => <CellPenalties key="penalties" v={v} />,
  status:    (v) => <CellStatus    key="status"    v={v} />,
};

// -- row --
interface RowProps {
  driver: DriverStanding;
  visibleCols: Set<ColumnKey>;
  isLapped: boolean;
  isEven: boolean;
}

const DriverRow = ({
  driver,
  visibleCols,
  isLapped,
  isEven,
  isFocused,
  onClick,
}: RowProps & {
  isFocused: boolean;
  onClick: (driver: DriverStanding) => void;
}): React.ReactElement => {
  const isRetiredOrDQ = driver.status === "RETIRED" || driver.status === "DISQUALIFIED";
  const baseRowBg = isEven ? "bg-rd-surface" : "bg-rd-bg";
  const rowBg = isFocused ? "bg-rd-gold/10" : baseRowBg;
  return (
    <tr
      onClick={() => onClick(driver)}
      className={`cursor-pointer border-b border-rd-border transition-colors hover:bg-rd-elevated ${rowBg} ${isLapped ? "opacity-60" : ""} ${isRetiredOrDQ ? "opacity-40" : ""}`}
    >
      {COLUMNS.filter((col) => visibleCols.has(col.key)).map((col) =>
        CELL_MAP[col.key](driver)
      )}
    </tr>
  );
};

// -- main component --
const InfoWindow = (): React.ReactElement => {
  const { connection, session, standings, setConnection, setSession, setStandings } = useRaceStore();

  useEffect(() => {
    // -- hydrate with current state on mount --
    globalThis.api.getState().then((state) => {
      setConnection(state.connection);
      setSession(state.session);
      setStandings(state.standings);
    });

    // -- subscribe to live updates --
    const unsubState = globalThis.api.onStateUpdate((state) => {
      setSession(state.session);
      setStandings(state.standings);
    });

    const unsubConn = globalThis.api.onConnectionChange((status) => {
      setConnection(status);
    });

    return () => {
      unsubState();
      unsubConn();
    };
  }, [setConnection, setSession, setStandings]);

  // camera
  const [selectedCamera] = useState<CameraTypeValue>(4);
  const [focusedSlotId, setFocusedSlotId] = useState<number | null>(null);
  const activeCameraType = React.useRef<CameraTypeValue | null>(null);

  const handleRowClick = async (driver: DriverStanding): Promise<void> => {
    if (connection !== "CONNECTED") return;
    // -- always switch focus to clicked car --
    await globalThis.api.focusVehicle(driver.slotId);
    // -- only send camera angle if differs from what's currently active --
    // -- switching drivers does NOT change camera type, no setCameraAngle needed --
    if (activeCameraType.current !== selectedCamera) {
      await globalThis.api.setCameraAngle(selectedCamera, 0, false);
      activeCameraType.current = selectedCamera;
    }
    setFocusedSlotId(driver.slotId);
  };

  // handleCameraChange grave, RIP

  // column visibility
  const [visibleCols, setVisibleCols] = useState<Set<ColumnKey>>(
    () => new Set(COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key))
  );

  // class filter
  const [activeClasses, setActiveClasses] = useState<Set<CarClass>>(
    () => new Set(ALL_CLASSES)
  );

  // show col settings panel
  const [showColMenu, setShowColMenu] = useState(false);
  const colMenuRef = React.useRef<HTMLDivElement>(null);
  const colBtnRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showColMenu) return;
    const handleClickOutside = (e: MouseEvent): void => {
      const target = e.target as Node;
      const outsideMenu = !colMenuRef.current?.contains(target);
      const outsideBtn  = !colBtnRef.current?.contains(target);
      if (outsideMenu && outsideBtn) setShowColMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColMenu]);

  const toggleCol = (key: ColumnKey): void => {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { // always show position and driver
        if (key === "position" || key === "driver") return prev;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleClass = (cls: CarClass): void => {
    setActiveClasses((prev) => {
      const next = new Set(prev);
      if (next.has(cls)) {  // prevent deselecting all
        if (next.size === 1) return prev;
        next.delete(cls);
      } else {
        next.add(cls);
      }
      return next;
    });
  };

  const filteredStandings = standings.filter((d) => activeClasses.has(d.carClass)).sort((a, b) => a.position - b.position);

  const title = session ? session.trackName : "No active session";
  const sessionType = session ? session.sessionType : null;
  const sessionCars = session
    ? `${session.numCarsOnTrack}/${session.numCars} on track`
    : null;

  let connectionDotColor = "bg-rd-subtle";
  if (connection === "CONNECTED") connectionDotColor = "bg-rd-success";
  else if (connection === "CONNECTING") connectionDotColor = "bg-rd-warning animate-rd-flash";
  else if (connection === "ERROR") connectionDotColor = "bg-rd-error animate-rd-flash";

  return (
    <div className="flex h-screen w-screen flex-col bg-rd-bg text-rd-text">

      {/* -- header -- */}
      <div 
        className="flex h-12 shrink-0 items-center justify-between border-b border-rd-border bg-rd-surface px-4"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-rd-accent">
            Info Window
          </span>
          <div className="h-4 w-px bg-rd-border" />
          <span className="font-mono text-xs text-rd-subtle">{title}</span>
          {sessionType && (
            <>
              <div className="h-4 w-px bg-rd-border" />
              <span className="font-mono text-xs text-rd-subtle">{sessionType}</span>
            </>
          )}
          {sessionCars && (
            <>
              <div className="h-4 w-px bg-rd-border" />
              <span className="font-mono text-xs text-rd-subtle">{sessionCars}</span>
            </>
          )}
        </div>
        <div
          className="flex items-center gap-3"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <span className={`h-2 w-2 rounded-full ${connectionDotColor}`} />
          <span className="font-mono text-xs text-rd-subtle">{connection}</span>
        </div>
      </div>

      {/* -- toolbar -- */}
      <div className="flex shrink-0 items-center gap-2 border-b border-rd-border bg-rd-surface px-4 py-1.5">
        {/* camera selector grave, RIP */}
        {/* -- class filters -- */}
        <div className="flex items-center gap-1.5">
          {ALL_CLASSES.filter((c) => c !== "UNKNOWN").map((cls) => (
            <button
              key={cls}
              onClick={() => toggleClass(cls)}
              className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold transition-opacity ${
                activeClasses.has(cls) ? CLASS_COLORS[cls] : "bg-rd-elevated text-rd-subtle opacity-40"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* -- standings count --*/}
          <span className="font-mono text-xs text-rd-subtle">
            {filteredStandings.length} cars
          </span>

          {/* -- column toggle button --*/}
          <button
            ref={colBtnRef}
            onClick={() => setShowColMenu((v) => !v)}
            className="rounded border border-rd-border uppercase bg-rd-elevated px-2 py-0.5 text-[10px] text-rd-muted transition-colors hover:bg-rd-surface hover:text-rd-text"
          >
            Filter
          </button>
        </div>
      </div>

      {/* -- dropdown column menu -- */}
      {showColMenu && (
        <div ref={colMenuRef} className="absolute right-4 top-[88px] z-50 flex flex-col gap-1 rounded border border-rd-border bg-rd-elevated p-3 shadow-lg">
          <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-rd-subtle">
            Toggle Columns
          </span>
          {COLUMNS.map((col) => (
            <label
              key={col.key}
              className="flex cursor-pointer items-center gap-2 text-xs text-rd-muted hover:text-rd-text"
            >
              <input
                type="checkbox"
                checked={visibleCols.has(col.key)}
                onChange={() => toggleCol(col.key)}
                className="accent-rd-accent"
              />
              {col.label}
            </label>
          ))}
        </div>
      )}

      {/* -- table -- */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredStandings.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p className="text-sm text-rd-muted">
              {standings.length === 0
                ? "No standings yet!"
                : "No cars match the filter!"}
            </p>
            <p className="font-mono text-xs text-rd-subtle">
              {standings.length === 0
                ? "Connect to LMU and load into a session!"
                : "Enable a class filter above!"}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-rd-surface">
              <tr className="border-b-2 border-rd-border">
                {COLUMNS.filter((c) => visibleCols.has(c.key)).map((col) => (
                  <th
                    key={col.key}
                    className="border-r border-rd-border px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-rd-subtle last:border-r-0"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStandings.map((driver, i) => (
                <DriverRow
                  key={`${driver.carNumber}-${driver.driverName}`}
                  driver={driver}
                  visibleCols={visibleCols}
                  isLapped={driver.lapsDown > 0}
                  isEven={i % 2 === 0}
                  isFocused={focusedSlotId === driver.slotId}
                  onClick={(driver) => void handleRowClick(driver)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InfoWindow;