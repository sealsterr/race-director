import type { DriverStanding } from "../../../types/lmu";
import type { TowerSettings } from "../../../store/overlayStore";

export const TOWER_SECTION_CHROME_HEIGHT = 55;
export const TOWER_ROW_HEIGHT = 36;
export const TOWER_VERTICAL_PADDING = 16;
export const TOWER_FIGHT_BADGE_HEIGHT = 20;

function getActiveStandings(standings: DriverStanding[]): DriverStanding[] {
    return standings.filter(
        (standing) =>
            standing.status !== "RETIRED" && standing.status !== "DISQUALIFIED"
    );
}

function getVisibleClassRows(
    standings: DriverStanding[],
    settings: TowerSettings
): number[] {
    const rowsByClass = new Map<string, number>();

    getActiveStandings(standings).forEach((standing) => {
        rowsByClass.set(
            standing.carClass,
            (rowsByClass.get(standing.carClass) ?? 0) + 1
        );
    });

    if (settings.viewLayout === "CLASS_ONLY" && settings.specificClass) {
        return [(rowsByClass.get(settings.specificClass) ?? 0)];
    }

    return Array.from(rowsByClass.values()).map((rowCount) =>
        Math.min(rowCount, settings.maxRowsPerClass)
    );
}

export function getTowerBaseHeight(
    standings: DriverStanding[],
    settings: TowerSettings
): number {
    const visibleClassRows = getVisibleClassRows(standings, settings).filter(
        (rowCount) => rowCount > 0
    );

    const contentHeight = visibleClassRows.reduce((total, rowCount) => {
        const fightBadgeReserve = settings.fightEnabled ? TOWER_FIGHT_BADGE_HEIGHT : 0;
        return (
            total +
            TOWER_SECTION_CHROME_HEIGHT +
            fightBadgeReserve +
            rowCount * TOWER_ROW_HEIGHT
        );
    }, 0);

    return TOWER_VERTICAL_PADDING + contentHeight;
}
