import type { ReactElement } from "react";
import type { DriverSettings } from "../../../store/overlayStore";
import type { DriverStanding, SectorTime } from "../../../types/lmu";
import { DriverCardShell } from "./DriverCardShell";
import { FlagTag } from "./DriverCardBits";
import { DriverLeftPanel } from "./DriverLeftPanel";
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
}

export function DriverPracticeQualiCard({
    driver,
    settings,
    currentLapTime,
    sessionBestSectors,
    nameParts,
    brandMark,
    nationalityMark,
}: DriverPracticeQualiCardProps): ReactElement {
    const classAccent = getClassAccent(driver.carClass);

    return (
        <DriverCardShell>
            <DriverLeftPanel
                accent={classAccent}
                accentGradient={getClassGradient(driver.carClass)}
                position={driver.position}
                carNumber={driver.carNumber}
                carClass={getClassLabel(driver.carClass)}
                bestLap={formatLapTime(driver.bestLapTime)}
                showCarNumber={settings.showCarNumber}
                showBestLap={settings.showBestLap}
                showClass={settings.showClass}
                showPosition={settings.showPosition}
            />
            <div
                style={{
                    display: "flex",
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
                        <div>
                            {settings.showNationality && (
                                <div style={{ paddingTop: 6 }}>
                                    <FlagTag mark={nationalityMark} />
                                </div>
                            )}
                        </div>
                        {settings.showLapTimer && (
                            <div style={{ textAlign: "right" }}>
                                <div style={timerLabelStyle}>LAP TIMER</div>
                                <div style={timerValueStyle}>{formatLapTime(currentLapTime)}</div>
                            </div>
                        )}
                    </div>
                    {settings.showFullName && (
                        <div style={{ marginTop: 0 }}>
                            <div style={firstNameStyle}>{nameParts.first}</div>
                            <div style={lastNameStyle}>{nameParts.last}</div>
                        </div>
                    )}
                </div>
                <div style={{ paddingTop: 10 }}>
                    {settings.showSectorStrip && (
                        <DriverSectorStrip
                            currentSectors={driver.currentSectors}
                            bestSectors={driver.bestSectors}
                            sessionBestSectors={sessionBestSectors}
                            settings={settings}
                        />
                    )}
                </div>
            </div>
            <DriverRightPanel
                brandMark={brandMark}
                modelName={driver.carName}
                showCarLogo={settings.showCarLogo}
                showCarModel={settings.showCarModel}
            />
        </DriverCardShell>
    );
}

const firstNameStyle = {
    fontSize: 26,
    fontWeight: 500,
    lineHeight: 0.9,
    color: "#f3f4f6",
};

const lastNameStyle = {
    marginTop: 4,
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 0.88,
    letterSpacing: "-0.04em",
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
