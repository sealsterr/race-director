import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TowerSettings } from "../../../store/overlayStore";
import type { SectorTime } from "../../../types/lmu";
import type { TowerRow as TowerRowData } from "./useTowerData";
import { formatLapTime } from "./useTowerData";
import {
    getClassColor,
    getTyreColor,
    normalizeTyreCompound,
    TYRE_INFO,
    ANIMATION_DURATION,
} from "./constants";
import SectorBar from "./SectorBar";

interface TowerRowProps {
    readonly row: TowerRowData;
    readonly settings: TowerSettings;
    readonly isFighting: boolean;
    readonly isOvertaking: "gained" | "lost" | null;
    readonly sessionBestSectors: SectorTime;
    readonly isQuali: boolean;
    readonly classBestLapTime: number | null;
}

function ordinal(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function TyreColumn({
    row,
    settings,
}: {
    readonly row: TowerRowData;
    readonly settings: TowerSettings;
}) {
    const compound = normalizeTyreCompound(row.standing.tyreCompound);
    const color = getTyreColor(compound, settings);
    const initial = TYRE_INFO[compound].initial;

    return (
        <span
            style={{
                fontWeight: 800,
                fontSize: 14,
                color,
                letterSpacing: "0.06em",
            }}
        >
            {initial}
        </span>
    );
}

function resolvePositionColor(isLeader: boolean, change: number | null): string {
    if (isLeader) return "#f59e0b";
    if (change !== null && change > 0) return "#4ade80";
    if (change !== null && change < 0) return "#f87171";
    return "#e2e8f0";
}

function resolveFlashBackground(overtaking: "gained" | "lost" | null): string {
    if (overtaking === "gained") return "rgba(74,222,128,0.18)";
    if (overtaking === "lost") return "rgba(248,113,113,0.18)";
    return "transparent";
}

function PitEar({
    color,
}: {
    readonly color: string;
}) {
    return (
        <div
            style={{
                position: "absolute",
                top: "50%",
                right: -34,
                transform: "translateY(-50%)",
                height: 22,
                minWidth: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 10px 0 12px",
                borderTopRightRadius: 999,
                borderBottomRightRadius: 999,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                border: `1px solid ${color}66`,
                borderLeft: "none",
                background: `${color}20`,
                color,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                boxShadow: `0 0 12px ${color}22`,
                pointerEvents: "none",
                zIndex: 3,
            }}
        >
            PIT
        </div>
    );
}

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

function ValueColumn({
    row,
    settings,
    sessionBestSectors,
    isQuali,
    animDuration,
    lapHighlightTime,
    lapHighlightColor,
}: {
    readonly row: TowerRowData;
    readonly settings: TowerSettings;
    readonly sessionBestSectors: SectorTime;
    readonly isQuali: boolean;
    readonly animDuration: number;
    readonly lapHighlightTime: number | null;
    readonly lapHighlightColor: string;
}) {
    if (isQuali) {
        const qualiDisplay =
            lapHighlightTime === null
                ? {
                    text: row.displayValue,
                    color: "#f1f5f9",
                }
                : {
                    text: formatLapTime(lapHighlightTime),
                    color: lapHighlightColor,
                };

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 3,
                }}
            >
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: qualiDisplay.color,
                        letterSpacing: "0.03em",
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    {qualiDisplay.text}
                </span>
                <SectorBar
                    currentSectors={row.standing.currentSectors}
                    bestSectors={row.standing.bestSectors}
                    sessionBestSectors={sessionBestSectors}
                    width={88}
                    animationDuration={animDuration}
                />
            </div>
        );
    }

    if (settings.raceMode === "TYRES") {
        return <TyreColumn row={row} settings={settings} />;
    }

    const isLeader = row.displayValue === "LEADER";



    const valueColor = resolvePositionColor(isLeader, row.positionsChange);

    return (
        <span
            style={{
                fontSize: isLeader ? 10 : 13,
                fontWeight: isLeader ? 800 : 500,
                color: valueColor,
                letterSpacing: isLeader ? "0.1em" : "0.03em",
                whiteSpace: "nowrap",
                fontVariantNumeric: "tabular-nums",
            }}
        >
            {row.displayValue}
        </span>
    );
}

export default function TowerRow({
    row,
    settings,
    isFighting,
    isOvertaking,
    sessionBestSectors,
    isQuali,
    classBestLapTime,
}: TowerRowProps) {
    const { standing } = row;
    const animDuration = ANIMATION_DURATION[settings.animationSpeed];
    const classColor = getClassColor(standing.carClass, settings);

    const flashBg = resolveFlashBackground(isOvertaking);
    const showPitBadge = standing.status === "PITTING";

    const surname = standing.driverName.split(" ").pop() ?? standing.driverName;

    const [lapHighlightTime, setLapHighlightTime] = useState<number | null>(null);
    const [lapHighlightColor, setLapHighlightColor] = useState("#f1f5f9");
    const prevLastLapRef = useRef<number | null>(standing.lastLapTime);
    const lapHighlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const previousLastLap = prevLastLapRef.current;
        const nextLastLap = standing.lastLapTime;

        if (
            isQuali &&
            nextLastLap !== null &&
            nextLastLap > 0 &&
            nextLastLap !== previousLastLap
        ) {
            setLapHighlightTime(nextLastLap);
            setLapHighlightColor(
                resolveLapHighlightColor(
                    nextLastLap,
                    standing.bestLapTime,
                    classBestLapTime
                )
            );

            if (lapHighlightTimerRef.current) {
                clearTimeout(lapHighlightTimerRef.current);
            }

            lapHighlightTimerRef.current = setTimeout(() => {
                setLapHighlightTime(null);
                lapHighlightTimerRef.current = null;
            }, LAP_HIGHLIGHT_MS);
        }

        prevLastLapRef.current = nextLastLap;
    }, [isQuali, standing.lastLapTime, standing.bestLapTime, classBestLapTime]);

    useEffect(() => {
        return () => {
            if (lapHighlightTimerRef.current) {
                clearTimeout(lapHighlightTimerRef.current);
            }
        };
    }, []);

    return (
        <motion.div
            layout
            layoutId={row.key}
            transition={{ duration: animDuration }}
            style={{
                display: "flex",
                alignItems: "center",
                height: 36,
                width: "100%",
                backgroundColor: flashBg,
                borderRadius: 3,
                overflow: "visible",
                position: "relative",
                marginBottom: 2,
            }}
        >
            {/* fight pulse ring */}
            <AnimatePresence>
                {isFighting && (
                    <motion.div
                        key="fight-ring"
                        animate={{ opacity: [0.7, 0.15, 0.7] }}
                        transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            border: "1px solid #f59e0b",
                            borderRadius: 3,
                            pointerEvents: "none",
                        }}
                    />
                )}
            </AnimatePresence>

            {/* class color bar */}
            {settings.showClassBar && (
                <div
                    style={{
                        width: 4,
                        alignSelf: "stretch",
                        backgroundColor: classColor,
                        flexShrink: 0,
                        borderRadius: "3px 0 0 3px",
                    }}
                />
            )}

            {/* position */}
            <div
                style={{
                    width: 38,
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#cbd5e1",
                    flexShrink: 0,
                    letterSpacing: "0.03em",
                }}
            >
                {ordinal(row.classPosition)}
            </div>

            {/* car number */}
            {settings.showCarNumber && (
                <div
                    style={{
                        width: 38,
                        textAlign: "center",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#64748b",
                        flexShrink: 0,
                    }}
                >
                    #{standing.carNumber || "—"}
                </div>
            )}

            {/* driver surname */}
            <div
                style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#f8fafc",
                    overflow: "visible",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    paddingRight: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                }}
            >
                {surname}
            </div>

            {/* value column */}
            <div
                style={{
                    minWidth: 88,
                    textAlign: "right",
                    paddingRight: 10,
                    flexShrink: 0,
                }}
            >
                <ValueColumn
                    row={row}
                    settings={settings}
                    sessionBestSectors={sessionBestSectors}
                    isQuali={isQuali}
                    animDuration={animDuration}
                    lapHighlightTime={lapHighlightTime}
                    lapHighlightColor={lapHighlightColor}
                />
            </div>
        {showPitBadge && (
                <PitEar color={settings.colorPitBadge} />
            )}
        </motion.div>
    );
}