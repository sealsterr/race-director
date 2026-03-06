import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SectorTime } from "../../../types/lmu";

interface SectorBarProps {
    readonly currentSectors: SectorTime;
    readonly bestSectors: SectorTime;
    readonly sessionBestSectors: SectorTime;
    readonly width: number;
    readonly animationDuration: number;
}

type SectorKey = "sector1" | "sector2" | "sector3";
const SECTOR_KEYS: SectorKey[] = ["sector1", "sector2", "sector3"];

const HOLD_MS = 4000;
const GREY = "#475569";

function isAllNull(sectors: SectorTime): boolean {
    return (
        sectors.sector1 === null &&
        sectors.sector2 === null &&
        sectors.sector3 === null
    );
}

function hasAtLeastTwoSectors(sectors: SectorTime): boolean {
    return sectors.sector1 !== null && sectors.sector2 !== null;
}

function buildHeldLapSectors(
    previous: SectorTime,
    bestSectors: SectorTime
): SectorTime {
    return {
        sector1: previous.sector1,
        sector2: previous.sector2,
        sector3: previous.sector3 ?? bestSectors.sector3 ?? Number.MAX_SAFE_INTEGER,
    };
}

export default function SectorBar({
    currentSectors,
    bestSectors,
    sessionBestSectors,
    width,
    animationDuration,
}: SectorBarProps) {
    const segW = Math.floor(width / 3);

    // displaySectors drives what's actually rendered
    // null = grey, number = colored
    const [displaySectors, setDisplaySectors] = useState<SectorTime>({
        sector1: null,
        sector2: null,
        sector3: null,
    });

    const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isHoldingRef = useRef(false);
    const previousLiveRef = useRef<SectorTime>({
        sector1: null,
        sector2: null,
        sector3: null,
    });

    useEffect(() => {
        const previousLive = previousLiveRef.current;
        const allNull = isAllNull(currentSectors);

        const allComplete =
            currentSectors.sector1 !== null &&
            currentSectors.sector2 !== null &&
            currentSectors.sector3 !== null;

        if (allComplete) {
            setDisplaySectors({ ...currentSectors });

            if (holdTimerRef.current) {
                clearTimeout(holdTimerRef.current);
            }

            isHoldingRef.current = true;
            holdTimerRef.current = setTimeout(() => {
                isHoldingRef.current = false;
                setDisplaySectors({
                    sector1: null,
                    sector2: null,
                    sector3: null,
                });
                holdTimerRef.current = null;
            }, HOLD_MS);

            previousLiveRef.current = currentSectors;
            return;
        }

        if (allNull) {
            if (isHoldingRef.current) {
                return;
            }

            if (hasAtLeastTwoSectors(previousLive)) {
                setDisplaySectors(buildHeldLapSectors(previousLive, bestSectors));

                if (holdTimerRef.current) {
                    clearTimeout(holdTimerRef.current);
                }

                isHoldingRef.current = true;
                holdTimerRef.current = setTimeout(() => {
                    isHoldingRef.current = false;
                    setDisplaySectors({
                        sector1: null,
                        sector2: null,
                        sector3: null,
                    });
                    holdTimerRef.current = null;
                }, HOLD_MS);

                previousLiveRef.current = currentSectors;
                return;
            }

            setDisplaySectors({
                sector1: null,
                sector2: null,
                sector3: null,
            });
            previousLiveRef.current = currentSectors;
            return;
        }

        setDisplaySectors({ ...currentSectors });
        previousLiveRef.current = currentSectors;
    }, [currentSectors, bestSectors]);

    useEffect(() => {
        return () => {
            if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
            isHoldingRef.current = false;
        };
    }, []);

    return (
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {SECTOR_KEYS.map((key) => {
                const val = displaySectors[key];
                const best = sessionBestSectors[key];
                const personalBest = bestSectors[key];

                let color = GREY;
                if (val !== null) {
                    if (best !== null && val <= best) {
                        color = "#9333ea";
                    } else if (personalBest !== null && val <= personalBest) {
                        color = "#16a34a";
                    } else {
                        color = "#d97706";
                    }
                }

                return (
                    <AnimatePresence key={key} mode="wait">
                        <motion.div
                            key={`${key}-${val ?? "null"}`}
                            initial={{ opacity: 0, scaleX: 0.6 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: animationDuration }}
                            style={{
                                width: segW,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: color,
                                transformOrigin: "left",
                            }}
                        />
                    </AnimatePresence>
                );
            })}
        </div>
    );
}