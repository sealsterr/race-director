import { useEffect, useRef, useState } from "react";
import type { DriverStanding } from "../../../types/lmu";
import { useOverlayStore } from "../../../store/overlayStore";
import type { DriverSettings, OverlayConfig } from "../../../store/overlayStore";
import { useBufferedAppState } from "../tower/useBufferedAppState";
import {
    DRIVER_DEFAULT_SETTINGS,
    getBrandMark,
    getDriverNameParts,
    getNationalityMark,
    getSessionBestSectors,
    resolveDriverMode,
} from "./driverCardUtils";
import {
    MOCK_DRIVER,
    MOCK_SESSION_BEST_SECTORS,
} from "./driverMockData";

interface DriverCardData {
    readonly overlayConfig: OverlayConfig<DriverSettings>;
    readonly driver: DriverStanding;
    readonly currentLapTime: number | null;
    readonly sessionBestSectors: ReturnType<typeof getSessionBestSectors>;
    readonly mode: ReturnType<typeof resolveDriverMode>;
    readonly isPreview: boolean;
    readonly dragMode: boolean;
    readonly opacity: number;
    readonly scale: number;
    readonly nameParts: { first: string; last: string };
    readonly brandMark: ReturnType<typeof getBrandMark>;
    readonly nationalityMark: ReturnType<typeof getNationalityMark>;
}

function findSpectatedDriver(standings: DriverStanding[]): DriverStanding | null {
    return standings.find((standing) => standing.isPlayer) ?? standings[0] ?? null;
}

export function useDriverCardData(): DriverCardData {
    const storeConfig = useOverlayStore((state) =>
        state.getOverlay("OVERLAY-DRIVER") as OverlayConfig<DriverSettings> | undefined
    );
    const [overlayConfig, setOverlayConfig] = useState<OverlayConfig<DriverSettings>>(
        storeConfig ?? {
            id: "OVERLAY-DRIVER",
            enabled: false,
            opacity: 90,
            scale: 1,
            x: 40,
            y: 880,
            displayId: 0,
            dragMode: false,
            settings: DRIVER_DEFAULT_SETTINGS,
        }
    );
    const appState = useBufferedAppState(100);
    const lapTrackerRef = useRef<{
        slotId: number | null;
        lapsCompleted: number;
        lapStartTime: number | null;
    }>({
        slotId: null,
        lapsCompleted: 0,
        lapStartTime: null,
    });

    useEffect(() => {
        if (storeConfig) {
            setOverlayConfig(storeConfig);
        }
    }, [storeConfig]);

    useEffect(() => {
        let cancelled = false;

        void globalThis.api?.overlay
            ?.getConfig?.("OVERLAY-DRIVER")
            .then((raw: unknown) => {
                if (cancelled || !raw) return;

                const incoming = raw as OverlayConfig<DriverSettings>;
                if (incoming?.id !== "OVERLAY-DRIVER") return;

                setOverlayConfig({
                    ...incoming,
                    settings: { ...DRIVER_DEFAULT_SETTINGS, ...incoming.settings },
                });
            });

        const unsubscribe = globalThis.api?.overlay?.onConfigUpdate?.((raw: unknown) => {
            const incoming = raw as OverlayConfig<DriverSettings>;
            if (incoming?.id === "OVERLAY-DRIVER") {
                setOverlayConfig({
                    ...incoming,
                    settings: { ...DRIVER_DEFAULT_SETTINGS, ...incoming.settings },
                });
            }
        });

        return () => {
            cancelled = true;
            unsubscribe?.();
        };
    }, []);

    const settings = { ...DRIVER_DEFAULT_SETTINGS, ...overlayConfig.settings };
    const liveDriver = findSpectatedDriver(appState.standings);
    const driver = liveDriver ?? MOCK_DRIVER;
    const isPreview = appState.connection !== "CONNECTED" || liveDriver === null;
    const sessionTime = appState.session?.sessionTime ?? null;

    useEffect(() => {
        if (isPreview) {
            lapTrackerRef.current = {
                slotId: MOCK_DRIVER.slotId,
                lapsCompleted: MOCK_DRIVER.lapsCompleted,
                lapStartTime: 3124.615,
            };
            return;
        }

        if (sessionTime === null) {
            lapTrackerRef.current = { slotId: null, lapsCompleted: 0, lapStartTime: null };
            return;
        }

        const tracker = lapTrackerRef.current;
        const isNewDriver = tracker.slotId !== driver.slotId;

        if (isNewDriver) {
            lapTrackerRef.current = {
                slotId: driver.slotId,
                lapsCompleted: driver.lapsCompleted,
                lapStartTime:
                    driver.lastLapTime !== null
                        ? Math.max(0, sessionTime - driver.lastLapTime)
                        : sessionTime,
            };
            return;
        }

        if (driver.lapsCompleted > tracker.lapsCompleted) {
            lapTrackerRef.current = {
                slotId: driver.slotId,
                lapsCompleted: driver.lapsCompleted,
                lapStartTime: sessionTime,
            };
            return;
        }

        lapTrackerRef.current = {
            ...tracker,
            slotId: driver.slotId,
            lapsCompleted: driver.lapsCompleted,
        };
    }, [driver, isPreview, sessionTime]);

    const currentLapTime = isPreview
        ? 75.042
        : sessionTime !== null && lapTrackerRef.current.lapStartTime !== null
            ? Math.max(0, sessionTime - lapTrackerRef.current.lapStartTime)
            : null;
    const mode = resolveDriverMode(settings.mode, appState.session?.sessionType);

    return {
        overlayConfig: {
            ...overlayConfig,
            settings,
        },
        driver,
        currentLapTime,
        sessionBestSectors: isPreview
            ? MOCK_SESSION_BEST_SECTORS
            : getSessionBestSectors(appState.standings),
        mode,
        isPreview,
        dragMode: overlayConfig.dragMode,
        opacity: overlayConfig.opacity / 100,
        scale: overlayConfig.scale,
        nameParts: getDriverNameParts(driver.driverName),
        brandMark: getBrandMark(driver.carName),
        nationalityMark: getNationalityMark(driver.driverName),
    };
}
