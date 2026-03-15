import type { ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DriverSettings } from "../../../store/overlayStore";
import type { DriverStanding } from "../../../types/lmu";
import { DriverCardShell } from "./DriverCardShell";
import { BrandFlagTag, MetricBadge } from "./DriverCardBits";
import { DriverLeftPanel } from "./DriverLeftPanel";
import { DriverPanelFrame } from "./DriverPanelFrame";
import { DriverRightPanel } from "./DriverRightPanel";
import {
    formatLapTime,
    getClassAccent,
    getClassGradient,
    getClassLabel,
    type BrandMark,
    type NationalityMark,
} from "./driverCardUtils";

interface DriverRaceCardProps {
    readonly driver: DriverStanding;
    readonly settings: DriverSettings;
    readonly nameParts: { first: string; last: string };
    readonly brandMark: BrandMark;
    readonly nationalityMark: NationalityMark;
    readonly isPreview: boolean;
    readonly disableEnterAnimation?: boolean;
}

export function DriverRaceCard({
    driver,
    settings,
    nameParts,
    brandMark,
    nationalityMark,
    isPreview,
    disableEnterAnimation = false,
}: DriverRaceCardProps): ReactElement {
    const classAccent = getClassAccent(driver.carClass);
    const hasVisibleParts =
        settings.showPart1 || settings.showPart2 || settings.showPart3;

    if (!hasVisibleParts) {
        return <></>;
    }

    return (
        <DriverCardShell>
            <AnimatePresence initial={false} mode="popLayout">
                {settings.showPart1 && (
                    <DriverPanelFrame key="part1" width={208} disableEnterAnimation={disableEnterAnimation}>
                        <DriverLeftPanel
                            accent={classAccent}
                            accentGradient={getClassGradient(driver.carClass)}
                            position={driver.position}
                            carNumber={driver.carNumber}
                            carClass={getClassLabel(driver.carClass)}
                            bestLap={formatLapTime(driver.bestLapTime)}
                            showCarNumber={true}
                            showBestLap={true}
                            showClass={true}
                            showPosition={true}
                        />
                    </DriverPanelFrame>
                )}
                {settings.showPart2 && (
                    <DriverPanelFrame key="part2" width={458} disableEnterAnimation={disableEnterAnimation}>
                        <motion.div
                            layout
                            style={{
                                display: "flex",
                                width: "100%",
                                height: "100%",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                padding: "12px 14px 11px",
                                borderRadius: 11,
                                border: `1px solid ${classAccent}66`,
                                background: "linear-gradient(180deg, rgba(22,24,35,0.96), rgba(17,19,28,0.92))",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                            }}
                        >
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                                    <div style={{ paddingTop: 2 }}>
                                        <BrandFlagTag brandMark={brandMark} nationalityMark={nationalityMark} />
                                    </div>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        <MetricBadge label="LAST LAP" value={formatLapTime(driver.lastLapTime)} width={114} />
                                        <MetricBadge label="BEST LAP" value={formatLapTime(driver.bestLapTime)} width={114} />
                                    </div>
                                </div>
                                <div style={{ marginTop: 16 }}>
                                    <div style={firstNameStyle}>{nameParts.first}</div>
                                    <div style={lastNameStyle}>{nameParts.last}</div>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 18 }}>
                                <RaceLine label="LAST LAP" value={formatLapTime(driver.lastLapTime)} />
                                <RaceLine label="BEST LAP" value={formatLapTime(driver.bestLapTime)} accent />
                            </div>
                        </motion.div>
                    </DriverPanelFrame>
                )}
                {settings.showPart3 && (
                    <DriverPanelFrame key="part3" width={182} disableEnterAnimation={disableEnterAnimation}>
                        <DriverRightPanel driver={driver} isPreview={isPreview} />
                    </DriverPanelFrame>
                )}
            </AnimatePresence>
        </DriverCardShell>
    );
}

function RaceLine({
    label,
    value,
    accent = false,
}: {
    readonly label: string;
    readonly value: string;
    readonly accent?: boolean;
}): ReactElement {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#9aa0b4" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: accent ? "#ef4444" : "#f2a93c" }}>SET</span>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: "rgba(68,74,93,0.38)", overflow: "hidden" }}>
                <div
                    style={{
                        width: "92%",
                        height: "100%",
                        borderRadius: 999,
                        background: accent ? "#ef4444" : "#f2a93c",
                        boxShadow: `0 0 14px ${accent ? "#ef4444" : "#f2a93c"}66`,
                    }}
                />
            </div>
            <span style={{ fontSize: 18, fontWeight: 600, color: "#f8fafc", fontVariantNumeric: "tabular-nums" }}>
                {value}
            </span>
        </div>
    );
}

const firstNameStyle = {
    fontSize: 26,
    fontWeight: 500,
    lineHeight: 0.95,
    letterSpacing: "0.04em",
    color: "#f3f4f6",
};

const lastNameStyle = {
    marginTop: 4,
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 0.88,
    letterSpacing: "0.01em",
    color: "#ffffff",
};
