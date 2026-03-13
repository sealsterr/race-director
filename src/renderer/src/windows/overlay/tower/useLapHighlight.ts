import { useEffect, useRef, useState } from "react";

const LAP_HIGHLIGHT_MS = 4000;

function resolveLapHighlightColor(
    lastLapTime: number | null,
    bestLapTime: number | null,
    classBestLapTime: number | null
): string {
    if (lastLapTime === null) return "#f1f5f9";

    const isClassBestLap =
        classBestLapTime === null ? false : lastLapTime <= classBestLapTime;
    if (isClassBestLap) {
        return "#9333ea";
    }

    const isPersonalBest =
        bestLapTime === null ? false : lastLapTime <= bestLapTime;
    if (isPersonalBest) {
        return "#16a34a";
    }

    return "#d97706";
}

interface UseLapHighlightOptions {
    readonly enabled: boolean;
    readonly lastLapTime: number | null;
    readonly bestLapTime: number | null;
    readonly classBestLapTime: number | null;
}

export function useLapHighlight({
    enabled,
    lastLapTime,
    bestLapTime,
    classBestLapTime,
}: UseLapHighlightOptions): {
    lapHighlightTime: number | null;
    lapHighlightColor: string;
} {
    const [lapHighlightTime, setLapHighlightTime] = useState<number | null>(null);
    const [lapHighlightColor, setLapHighlightColor] = useState("#f1f5f9");
    const prevLastLapRef = useRef<number | null>(lastLapTime);
    const lapHighlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const previousLastLap = prevLastLapRef.current;

        if (
            enabled &&
            lastLapTime !== null &&
            lastLapTime > 0 &&
            lastLapTime !== previousLastLap
        ) {
            setLapHighlightTime(lastLapTime);
            setLapHighlightColor(
                resolveLapHighlightColor(lastLapTime, bestLapTime, classBestLapTime)
            );

            if (lapHighlightTimerRef.current) {
                clearTimeout(lapHighlightTimerRef.current);
            }

            lapHighlightTimerRef.current = setTimeout(() => {
                setLapHighlightTime(null);
                lapHighlightTimerRef.current = null;
            }, LAP_HIGHLIGHT_MS);
        }

        prevLastLapRef.current = lastLapTime;
    }, [bestLapTime, classBestLapTime, enabled, lastLapTime]);

    useEffect(() => {
        return () => {
            if (lapHighlightTimerRef.current) {
                clearTimeout(lapHighlightTimerRef.current);
            }
        };
    }, []);

    return { lapHighlightTime, lapHighlightColor };
}
