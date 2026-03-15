import type { CarClass, DriverStanding, SectorTime } from "../../../types/lmu";
import type {
    DriverCardMode,
    DriverSettings,
} from "../../../store/overlayStore";

export type DriverVisualMode = "PRACTICE_QUALI" | "RACE";
type SectorKey = "sector1" | "sector2" | "sector3";

export interface NationalityMark {
    readonly code: string;
    readonly colors: readonly [string, string, string];
}

const NATIONALITY_MARKS: Record<string, NationalityMark> = {
    "RYAN REYNOLDS": { code: "CAN", colors: ["#ef4444", "#ffffff", "#ef4444"] },
    "FERNANDO ALONSO": { code: "ESP", colors: ["#c81e1e", "#facc15", "#c81e1e"] },
    "MAX VERSTAPPEN": { code: "NLD", colors: ["#ef4444", "#ffffff", "#2563eb"] },
};

const CLASS_ACCENTS: Record<CarClass, string> = {
    HYPERCAR: "#ef4444",
    LMP2: "#3b82f6",
    LMP3: "#facc15",
    LMGT3: "#22c55e",
    GTE: "#f97316",
    UNKNOWN: "#94a3b8",
};

export const DRIVER_DEFAULT_SETTINGS: DriverSettings = {
    mode: "AUTO",
    showPart1: true,
    showPart2: true,
    showPart3: true,
    colorSessionBest: "#7c3aed",
    colorPersonalBest: "#22c55e",
    colorCompleted: "#f59e0b",
    colorPending: "#475569",
};

export function resolveDriverMode(
    requestedMode: DriverCardMode,
    sessionType: string | undefined
): DriverVisualMode {
    if (requestedMode === "PRACTICE_QUALI" || requestedMode === "RACE") {
        return requestedMode;
    }

    return sessionType === "RACE" ? "RACE" : "PRACTICE_QUALI";
}

export function getDriverNameParts(driverName: string): { first: string; last: string } {
    const parts = driverName.trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) {
        return { first: parts[0] ?? "Spectated", last: (parts[0] ?? "Driver").toUpperCase() };
    }

    return {
        first: parts.slice(0, -1).join(" "),
        last: parts[parts.length - 1].toUpperCase(),
    };
}

export function getNationalityMark(driverName: string): NationalityMark {
    return NATIONALITY_MARKS[driverName.toUpperCase()] ?? {
        code: "INT",
        colors: ["#334155", "#cbd5e1", "#334155"],
    };
}

export function getSessionBestSectors(standings: DriverStanding[]): SectorTime {
    const best: SectorTime = { sector1: null, sector2: null, sector3: null };

    for (const standing of standings) {
        for (const key of ["sector1", "sector2", "sector3"] as SectorKey[]) {
            const value = standing.bestSectors[key];
            if (value !== null && (best[key] === null || value < (best[key] as number))) {
                best[key] = value;
            }
        }
    }

    return best;
}

export function formatLapTime(seconds: number | null): string {
    if (seconds === null || seconds <= 0) {
        return "--:--.---";
    }

    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder.toFixed(3).padStart(6, "0")}`;
}

export function getSectorColor(
    key: SectorKey,
    currentValue: number | null,
    bestSectors: SectorTime,
    sessionBestSectors: SectorTime,
    settings: DriverSettings
): string {
    if (currentValue === null) {
        return settings.colorPending;
    }

    if (sessionBestSectors[key] !== null && currentValue <= (sessionBestSectors[key] as number)) {
        return settings.colorSessionBest;
    }

    if (bestSectors[key] !== null && currentValue <= (bestSectors[key] as number)) {
        return settings.colorPersonalBest;
    }

    return settings.colorCompleted;
}

export function getClassLabel(carClass: CarClass): string {
    return carClass === "UNKNOWN" ? "OPEN" : carClass;
}

export function getClassAccent(carClass: CarClass): string {
    return CLASS_ACCENTS[carClass] ?? CLASS_ACCENTS.UNKNOWN;
}

export function getClassGradient(carClass: CarClass): string {
    const accent = getClassAccent(carClass);
    return `linear-gradient(115deg, ${accent}cc, rgba(43,22,29,0.66) 56%, rgba(17,19,29,0.98) 56%)`;
}
