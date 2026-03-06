import { useMemo } from "react";
import type { DriverStanding, SessionInfo, CarClass } from "../../../types/lmu";
import type { TowerSettings } from "../../../store/overlayStore";
import { CLASS_ORDER } from "./constants";

// -- types 
export interface TowerRow {
    /* unique key for framer-motion layout animations */
    key: string;
    standing: DriverStanding;
    /* position within own class */
    classPosition: number;
    /* gap value to display */
    displayValue: string;
    /* numeric gap in s, null if leader */
    intervalSeconds: number | null;
    /* positions gained or lost since race start */
    positionsChange: number | null;
}

export interface TowerSection {
    carClass: CarClass;
    rows: TowerRow[];
}

// -- helpers --
function formatGap(seconds: number | null, isLeader: boolean): string {
    if (isLeader) return "LEADER";
    if (seconds === null) return "—";
    if (seconds >= 60) {
        const m = Math.floor(seconds / 60);
        const s = (seconds % 60).toFixed(3).padStart(6, "0");
        return `+${m}:${s}`;
    }
    return `+${seconds.toFixed(3)}`;
}

function formatPositionChange(change: number): string {
  if (change > 0) return `▲${change}`;
  if (change < 0) return `▼${Math.abs(change)}`;
  return "—";
}

function formatFuel(fuel: number | null): string {
    if (fuel === null) return "—";
    return `${Math.round(fuel)}%`;
}

function getFirstValidBestLapTime(
    standings: DriverStanding[]
): number | null {
    for (const standing of standings) {
        if (standing.bestLapTime !== null) {
            return standing.bestLapTime;
        }
    }
    return null;
}

// -- main hook --
interface UseTowerDataOptions {
    standings: DriverStanding[];
    session: SessionInfo | null;
    settings: TowerSettings;
    /* map of slotId -> grid start position */
    startPositions: Map<number, number>;
}

interface UseTowerDataResult {
    sections: TowerSection[];
    isQuali: boolean;
    isRace: boolean;
    activeClasses: CarClass[];
}

export function useTowerData({
    standings,
    session,
    settings,
    startPositions,
}: UseTowerDataOptions): UseTowerDataResult {
    const isQuali = useMemo(() => {
        if (!session) return false;
        return (
            session.sessionType === "QUALIFYING" ||
            session.sessionType === "PRACTICE"
        );
    }, [session]);

    const isRace = useMemo(() => {
        if (!session) return false;
        return session.sessionType === "RACE";
    }, [session]);

    // filter out retired/dq cars; sort by overall position
    const activeStandings = useMemo(() => {
        return standings
        .filter(
            (s) =>
                s.status !== "RETIRED" && s.status !== "DISQUALIFIED"
        )
        .sort((a, b) => a.position - b.position);
    }, [standings]);

    // determine which classes are actually present
    const activeClasses = useMemo<CarClass[]>(() => {
        const present = new Set<CarClass>(
        activeStandings.map((s) => s.carClass)
        );
        return CLASS_ORDER.filter((c) => present.has(c));
    }, [activeStandings]);

    // group standings by class
    const byClass = useMemo(() => {
        const map = new Map<CarClass, DriverStanding[]>();
        for (const s of activeStandings) {
            if (!map.has(s.carClass)) map.set(s.carClass, []);
            map.get(s.carClass)?.push(s);
        }
        return map;
    }, [activeStandings]);

    // build TowerRow for a single standing within class
    function buildRow(
        standing: DriverStanding,
        classPosition: number,
        leaderBestLapTime: number | null
    ): TowerRow {
        const base: Omit<TowerRow, never> = {
            key: `row-${standing.slotId}`,
            standing,
            classPosition,
            intervalSeconds: null,
            positionsChange: null,
            displayValue: "—",
        };

        if (isQuali) {
            if (settings.qualiMode === "QUALI_TIMES") {
                return {
                    ...base,
                    displayValue:
                        standing.bestLapTime === null
                            ? "NO TIME"
                            : formatLapTime(standing.bestLapTime),
                };
            }

            if (classPosition === 1) {
                return {
                    ...base,
                    displayValue:
                        leaderBestLapTime === null
                            ? "NO TIME"
                            : formatLapTime(leaderBestLapTime),
                };
            }

            if (
                standing.bestLapTime === null ||
                leaderBestLapTime === null
            ) {
                return {
                    ...base,
                    displayValue: "NO TIME",
                };
            }

            return {
                ...base,
                displayValue: formatGap(
                    Math.max(0, standing.bestLapTime - leaderBestLapTime),
                    false
                ),
            };
        }
        
        return buildRaceRow(base, standing, classPosition);
    }

    function buildRaceRow(
        base: Omit<TowerRow, "displayValue">,
        standing: DriverStanding,
        classPosition: number
    ): TowerRow {
        const mode = settings.raceMode;

        if (mode === "GAP_AHEAD") {
            return {
                ...base,
                displayValue: formatGap(standing.intervalToAhead, classPosition === 1),
                intervalSeconds: standing.intervalToAhead,
            };
        }

        if (mode === "GAP_LEADER") {
            return {
                ...base,
                displayValue: formatGap(
                    classPosition === 1 ? null : standing.gapToLeader,
                    classPosition === 1
                ),
            };
        }

        if (mode === "PITS") {
            return { ...base, displayValue: String(standing.pitStopCount) };
        }

        if (mode === "FUEL") {
            return { ...base, displayValue: formatFuel(standing.fuel) };
        }

        if (mode === "TYRES") {
            return {
                ...base,
                displayValue: standing.tyreCompound
                    ? String(standing.tyreCompound)
                    : "UNKNOWN",
            };
        }

        if (mode === "POSITIONS") {
            const startPos = startPositions.get(standing.slotId);
            if (startPos !== undefined) {
                const change = startPos - standing.position;
                const displayValue = formatPositionChange(change);
                return { ...base, displayValue, positionsChange: change };
            }
            return { ...base, displayValue: "—" };
        }

        return { ...base, displayValue: "—" };
    }

    const sections = useMemo<TowerSection[]>(() => {
        if (settings.viewLayout === "PER_CLASS") {
            return activeClasses.map((carClass) => {
                const classStandings = byClass.get(carClass) ?? [];
                const leaderBestLapTime =
                    getFirstValidBestLapTime(classStandings);
                const rows = classStandings.map((s, i) =>
                    buildRow(s, i + 1, leaderBestLapTime)
                );
                return { carClass, rows };
            });
        }

        // MIXED_TOP: top N per class, all shown together under class headers
        return activeClasses.map((carClass) => {
            const classStandings = byClass.get(carClass) ?? [];
            const sliced = classStandings.slice(0, settings.maxRowsPerClass);
            const leaderBestLapTime =
                getFirstValidBestLapTime(classStandings);
            const rows = sliced.map((s, i) =>
                buildRow(s, i + 1, leaderBestLapTime)
            );
            return { carClass, rows };
        });
    }, [
        activeClasses,
        byClass,
        settings.viewLayout,
        settings.raceMode,
        settings.qualiMode,
        settings.maxRowsPerClass,
        isQuali,
        startPositions,
    ]);

    return { sections, isQuali, isRace, activeClasses };
}

// -- lap time formatter --
export function formatLapTime(seconds: number): string {
    if (seconds <= 0) return "NO TIME";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const sStr = s.toFixed(3).padStart(6, "0");
    return m > 0 ? `${m}:${sStr}` : `0:${sStr}`;
}