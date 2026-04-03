import { useEffect, useRef, useState } from "react";
import type { SectorTime, DriverStanding } from "../../../types/lmu";
import { useOverlayStore } from "../../../store/overlayStore";
import type { OverlayConfig, TowerSettings } from "../../../store/overlayStore";
import { useTowerData } from "./useTowerData";
import { useFightDetection } from "./useFightDetection";

import TowerSection from "./TowerSection";
import { useTowerWindowAutosize } from "./useTowerWindowAutosize";
import { useBufferedAppState } from "./useBufferedAppState";
import { STATUS_EAR_GUTTER } from "./StatusEar";
import {
    TOWER_PREVIEW_SESSION,
    TOWER_PREVIEW_STANDINGS,
    TOWER_PREVIEW_START_POSITIONS,
} from "./towerPreviewData";

// * -- empty sector time sentinel --
const EMPTY_SECTORS: SectorTime = {
    sector1: null,
    sector2: null,
    sector3: null,
};

// * -- derive session-best sectors from all standings --
function deriveSessionBestSectors(
    standings: DriverStanding[]
): SectorTime {
    let s1: number | null = null;
    let s2: number | null = null;
    let s3: number | null = null;

    for (const d of standings) {
        const b = d.bestSectors;
        if (b.sector1 !== null && (s1 === null || b.sector1 < s1)) s1 = b.sector1;
        if (b.sector2 !== null && (s2 === null || b.sector2 < s2)) s2 = b.sector2;
        if (b.sector3 !== null && (s3 === null || b.sector3 < s3)) s3 = b.sector3;
    }

    return { sector1: s1, sector2: s2, sector3: s3 };
}

function getStatusEarGutter(sections: ReturnType<typeof useTowerData>["sections"]): number {
    const hasVisibleStatusEar = sections.some((section) =>
        section.rows.some(
            (row) =>
                row.standing.status === "PITTING" || row.standing.status === "FINISHED"
        )
    );

    return hasVisibleStatusEar ? STATUS_EAR_GUTTER : 0;
}

// * -- overtake detection --
// returns a map of slotId: "gained" or "lost" clears after flash duration
const OVERTAKE_FLASH_MS = 600;

function applyOvertakeFlash(
    gained: number[],
    lost: number[],
    setOvertakingSlots: React.Dispatch<
        React.SetStateAction<Map<number, "gained" | "lost">>
    >,
    overtakeTimersRef: React.RefObject<
        Map<number, ReturnType<typeof setTimeout>>
    >
): void {
    setOvertakingSlots((current) => {
        const next = new Map(current);
        for (const id of gained) next.set(id, "gained");
        for (const id of lost) next.set(id, "lost");
        return next;
    });

    const clearIds = [...gained, ...lost];
    for (const id of clearIds) {
        const existing = overtakeTimersRef.current.get(id);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
            setOvertakingSlots((current) => {
                const next = new Map(current);
                next.delete(id);
                return next;
            });
            overtakeTimersRef.current.delete(id);
        }, OVERTAKE_FLASH_MS);

        overtakeTimersRef.current.set(id, timer);
    }
}

export default function TowerOverlay() {
    const storeConfig = useOverlayStore((s) =>
        s.getOverlay("OVERLAY-TOWER") as OverlayConfig<TowerSettings> | undefined
    );
    const [overlayConfig, setOverlayConfig] = useState<
        OverlayConfig<TowerSettings> | undefined
    >(storeConfig);

    useEffect(() => {
        setOverlayConfig(storeConfig);
    }, [storeConfig]);

    const settings = overlayConfig?.settings;
    const towerSettings = settings ?? {
        viewLayout: "MIXED_TOP" as const,
        specificClass: null,
        raceMode: "GAP_AHEAD" as const,
        qualiMode: "QUALI_GAP" as const,
        maxRowsPerClass: 5,
        standingsRefreshMs: 1000,
        fightEnabled: true,
        fightOnlyInIntervalMode: true,
        fightThresholdSeconds: 0.25,
        fightHoldSeconds: 3,
        fightDisabledLaps: 3,
        fightRequireSameLap: true,
        fightIgnorePitAndFinished: true,
        showCarNumber: true,
        showClassBar: true,
        animationSpeed: "normal" as const,
        colorHypercar: "#E4002B",
        colorLMP2: "#0057A8",
        colorLMP3: "#FFD700",
        colorLMGT3: "#00A651",
        colorGTE: "#FF6600",
        colorHard: "#FFFFFF",
        colorMedium: "#FFD700",
        colorSoft: "#E4002B",
        colorWet: "#0099FF",
        colorPitBadge: "#F59E0B",
        colorFinishBadge: "#E5E7EB",
    };
    const appState = useBufferedAppState(towerSettings.standingsRefreshMs);

    // * -- start positions: captured once at race start, never reset mid-race --
    const startPositionsRef = useRef<Map<number, number>>(new Map());
    const raceStartedRef = useRef(false);

    // * -- previous positions for overtake detection --
    const prevPositionsRef = useRef<Map<number, number>>(new Map());

    // * -- overtaking flash state --
    const [overtakingSlots, setOvertakingSlots] = useState<
        Map<number, "gained" | "lost">
    >(new Map());
    const overtakeTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
        new Map()
    );
    const contentRef = useRef<HTMLDivElement>(null);
    const isPreview = appState.connection !== "CONNECTED";
    const effectiveSession = isPreview ? TOWER_PREVIEW_SESSION : appState.session;
    const effectiveStandings = isPreview ? TOWER_PREVIEW_STANDINGS : appState.standings;
    const effectiveStartPositions = isPreview
        ? TOWER_PREVIEW_START_POSITIONS
        : startPositionsRef.current;

    // * -- self-hydrate on mount --
    useEffect(() => {
        const unsubConfig = globalThis.api?.overlay?.onConfigUpdate?.((raw: unknown) => {
            const incoming = raw as OverlayConfig<TowerSettings>;
            if (incoming?.id === "OVERLAY-TOWER") {
                setOverlayConfig(incoming);
            }
        });

        return () => {
            unsubConfig?.();
        };
    }, []);

    // * -- capture start positions when race begins --
    useEffect(() => {
        const { session, standings } = appState;
        if (session?.sessionType !== "RACE") {
            raceStartedRef.current = false;
            return;
        }
        if (raceStartedRef.current) return;
        if (standings.length === 0) return;

        const map = new Map<number, number>();
        for (const d of standings) {
            map.set(d.slotId, d.position);
        }
        startPositionsRef.current = map;
        raceStartedRef.current = true;
    }, [appState]);

    // * -- overtake detection --
    useEffect(() => {
        const { standings } = appState;
        const prev = prevPositionsRef.current;
        if (prev.size === 0) {
            // first frame — just record, no flash
            for (const d of standings) {
                prev.set(d.slotId, d.position);
            }
            return;
        }

        const gained: number[] = [];
        const lost: number[] = [];

        for (const d of standings) {
            const prevPos = prev.get(d.slotId);
            if (prevPos === undefined) continue;
            if (d.position < prevPos) gained.push(d.slotId);
            if (d.position > prevPos) lost.push(d.slotId);
        }

        if (gained.length > 0 || lost.length > 0) {
            applyOvertakeFlash(
                gained,
                lost,
                setOvertakingSlots,
                overtakeTimersRef
            );
        }

        // update prev positions
        for (const d of standings) {
            prev.set(d.slotId, d.position);
        }
    }, [appState.standings]);

    // * -- cleanup timers on unmount --
    useEffect(() => {
        return () => {
            for (const t of overtakeTimersRef.current.values()) {
                clearTimeout(t);
            }
        };
    }, []);

    const { sections, isQuali, isRace } = useTowerData({
        standings: effectiveStandings,
        session: effectiveSession,
        settings: towerSettings,
        startPositions: effectiveStartPositions,
    });

    const fightEnabled =
        isRace &&
        towerSettings.fightEnabled &&
        (!towerSettings.fightOnlyInIntervalMode ||
            towerSettings.raceMode === "GAP_AHEAD") &&
        (appState.session?.currentLap ?? 0) > towerSettings.fightDisabledLaps;

    const fightGroups = useFightDetection({
        sections,
        thresholdSeconds: towerSettings.fightThresholdSeconds,
        holdSeconds: towerSettings.fightHoldSeconds,
        requireSameLap: towerSettings.fightRequireSameLap,
        ignorePitAndFinished: towerSettings.fightIgnorePitAndFinished,
        enabled: fightEnabled,
    });

    const sessionBestSectors = isQuali
        ? deriveSessionBestSectors(effectiveStandings)
        : EMPTY_SECTORS;
    const statusEarGutter = getStatusEarGutter(sections);

    const opacity = (overlayConfig?.opacity ?? 100) / 100;
    const scale = overlayConfig?.scale ?? 1;
    const dragMode = overlayConfig?.dragMode ?? false;

    useTowerWindowAutosize({
        enabled: true,
        overlayId: "OVERLAY-TOWER",
        scale,
        targetRef: contentRef,
    });

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "none",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                padding: 0,
                overflow: "hidden",
                pointerEvents: dragMode ? "auto" : "none",
                WebkitAppRegion: dragMode ? "drag" : "no-drag",
            } as React.CSSProperties}
        >
            <div
                ref={contentRef}
                style={{
                    opacity,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    fontFamily:
                        "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
                    padding: "8px 0 0 0",
                    minWidth: 320,
                    pointerEvents: dragMode ? "auto" : "none",
                    WebkitAppRegion: dragMode ? "drag" : "no-drag",
                    cursor: dragMode ? "grab" : "default",
                } as React.CSSProperties}
            >
                {sections.map((section, index) => (
                    <TowerSection
                        key={section.carClass}
                        section={section}
                        settings={towerSettings}
                        statusEarGutter={statusEarGutter}
                        isLast={index === sections.length - 1}
                        fightGroups={fightGroups.filter((g) =>
                            section.rows.some((r) =>
                                g.slotIds.includes(r.standing.slotId)
                            )
                        )}
                        overtakingSlots={overtakingSlots}
                        sessionBestSectors={sessionBestSectors}
                        isQuali={isQuali}
                    />
                ))}
            </div>
        </div>
    );
}
