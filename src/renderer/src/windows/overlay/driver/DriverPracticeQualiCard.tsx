import type { ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DriverSettings } from "../../../store/overlayStore";
import type { DriverStanding, SectorTime } from "../../../types/lmu";
import { DriverCardShell } from "./DriverCardShell";
import { BrandFlagTag } from "./DriverCardBits";
import { DriverLeftPanel } from "./DriverLeftPanel";
import { DriverPanelFrame } from "./DriverPanelFrame";
import { DriverRightPanel } from "./DriverRightPanel";
import { DriverSectorStrip } from "./DriverSectorStrip";
import {
    formatLapTime,
    getClassAccent,
    getClassGradient,
    getClassLabel,
    type BrandMark,
    type NationalityMark,
} from "./driverCardUtils";

interface DriverPracticeQualiCardProps {
    readonly driver: DriverStanding;
    readonly settings: DriverSettings;
    readonly currentLapTime: number | null;
    readonly sessionBestSectors: SectorTime;
    readonly nameParts: { first: string; last: string };
    readonly brandMark: BrandMark;
    readonly nationalityMark: NationalityMark;
    readonly isPreview: boolean;
    readonly disableEnterAnimation?: boolean;
}

export function DriverPracticeQualiCard({
    driver,
    settings,
    currentLapTime,
    sessionBestSectors,
    nameParts,
    brandMark,
    nationalityMark,
    isPreview,
    disableEnterAnimation = false,
}: DriverPracticeQualiCardProps): ReactElement {
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
                                padding: "10px 14px 12px",
                                borderRadius: 11,
                                border: `1px solid ${classAccent}66`,
                                background: "linear-gradient(180deg, rgba(22,24,35,0.96), rgba(17,19,28,0.92))",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                            }}
                        >
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                                    <div style={{ paddingTop: 6 }}>
                                        <BrandFlagTag brandMark={brandMark} nationalityMark={nationalityMark} />
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={timerLabelStyle}>LAP TIMER</div>
                                        <div style={timerValueStyle}>{formatLapTime(currentLapTime)}</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 6 }}>
                                    <div style={firstNameStyle}>{nameParts.first}</div>
                                    <div style={lastNameStyle}>{nameParts.last}</div>
                                </div>
                            </div>
                            <div style={{ paddingTop: 0 }}>
                                <DriverSectorStrip
                                    currentSectors={driver.currentSectors}
                                    bestSectors={driver.bestSectors}
                                    sessionBestSectors={sessionBestSectors}
                                    settings={settings}
                                />
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

const firstNameStyle = {
    fontSize: 26,
    fontWeight: 500,
    lineHeight: 0.9,
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

const timerLabelStyle = {
    fontSize: 12,
    fontWeight: 500,
    color: "#a4a7b5",
};

const timerValueStyle = {
    marginTop: 3,
    fontSize: 42,
    fontWeight: 700,
    lineHeight: 0.9,
    color: "#f8fafc",
    fontVariantNumeric: "tabular-nums",
};
