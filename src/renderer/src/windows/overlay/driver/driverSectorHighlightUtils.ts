import type { DriverSettings } from "../../../store/overlayStore";
import type { SectorTime } from "../../../types/lmu";
import { getSectorColor } from "./driverCardUtils";

type SectorKey = "sector1" | "sector2" | "sector3";
type SectorVisual = { value: number | null; lineColor: string; textColor: string };
export type DriverSectorVisualMap = Record<SectorKey, SectorVisual>;

const DEFAULT_TEXT_COLOR = "#b3b8c8";
const SECTOR_KEYS: SectorKey[] = ["sector1", "sector2", "sector3"];

export function buildEmptyVisuals(settings: DriverSettings): DriverSectorVisualMap {
    return {
        sector1: { value: null, lineColor: settings.colorPending, textColor: DEFAULT_TEXT_COLOR },
        sector2: { value: null, lineColor: settings.colorPending, textColor: DEFAULT_TEXT_COLOR },
        sector3: { value: null, lineColor: settings.colorPending, textColor: DEFAULT_TEXT_COLOR },
    };
}

export function buildStaticVisuals(
    currentSectors: SectorTime,
    bestSectors: SectorTime,
    sessionBestSectors: SectorTime,
    settings: DriverSettings
): DriverSectorVisualMap {
    return {
        sector1: buildStaticSector("sector1", currentSectors.sector1, bestSectors, sessionBestSectors, settings),
        sector2: buildStaticSector("sector2", currentSectors.sector2, bestSectors, sessionBestSectors, settings),
        sector3: buildStaticSector("sector3", currentSectors.sector3, bestSectors, sessionBestSectors, settings),
    };
}

export function clearTextTimers(
    timerMap: Partial<Record<SectorKey, ReturnType<typeof setTimeout>>>
): void {
    for (const key of SECTOR_KEYS) {
        const timer = timerMap[key];
        if (timer) {
            clearTimeout(timer);
            delete timerMap[key];
        }
    }
}

export function clearResetTimer(
    timerRef: { current: ReturnType<typeof setTimeout> | null }
): void {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
}

export { DEFAULT_TEXT_COLOR };

function buildStaticSector(
    key: SectorKey,
    value: number | null,
    bestSectors: SectorTime,
    sessionBestSectors: SectorTime,
    settings: DriverSettings
): SectorVisual {
    const color = getSectorColor(key, value, bestSectors, sessionBestSectors, settings);
    return {
        value,
        lineColor: color,
        textColor: value === null ? DEFAULT_TEXT_COLOR : color,
    };
}
