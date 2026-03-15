import type { ReactElement } from "react";
import type { DriverSettings } from "../../../store/overlayStore";
import type { SectorTime } from "../../../types/lmu";
import { getSectorColor } from "./driverCardUtils";

const SECTORS: Array<keyof SectorTime> = ["sector1", "sector2", "sector3"];

export function DriverSectorStrip({
    currentSectors,
    bestSectors,
    sessionBestSectors,
    settings,
}: {
    readonly currentSectors: SectorTime;
    readonly bestSectors: SectorTime;
    readonly sessionBestSectors: SectorTime;
    readonly settings: DriverSettings;
}): ReactElement {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 18, alignItems: "end" }}>
            {SECTORS.map((sectorKey) => {
                const currentValue = currentSectors[sectorKey];
                const color = getSectorColor(
                    sectorKey,
                    currentValue,
                    bestSectors,
                    sessionBestSectors,
                    settings
                );

                const label =
                    currentValue === null
                        ? sectorKey.toUpperCase().replace("SECTOR", "S")
                        : currentValue.toFixed(3);

                return (
                    <div key={sectorKey} style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                        <div style={headStyle}>
                            {label}
                        </div>
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                height: 6,
                                borderRadius: 999,
                                background: "rgba(89,94,109,0.68)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    width: currentValue === null ? "0%" : "88%",
                                    borderRadius: 999,
                                    background: color,
                                    boxShadow: `0 0 14px ${color}66`,
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const headStyle = {
    fontSize: 20,
    fontWeight: 600,
    color: "#b3b8c8",
    textAlign: "center" as const,
    lineHeight: 1,
};
