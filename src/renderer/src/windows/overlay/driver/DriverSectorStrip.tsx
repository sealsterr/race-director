import type { ReactElement } from "react";
import { motion } from "framer-motion";
import type { SectorTime } from "../../../types/lmu";
import type { DriverSectorVisualMap } from "./driverSectorHighlightUtils";

const SECTORS: Array<keyof SectorTime> = ["sector1", "sector2", "sector3"];

export function DriverSectorStrip({
    sectorVisuals,
}: {
    readonly sectorVisuals: DriverSectorVisualMap;
}): ReactElement {
    return (
        <div style={stripStyle}>
            {SECTORS.map((sectorKey) => {
                const visual = sectorVisuals[sectorKey];
                const label =
                    visual.value === null
                        ? sectorKey.toUpperCase().replace("SECTOR", "S")
                        : visual.value.toFixed(3);

                return (
                    <div key={sectorKey} style={sectorStyle}>
                        <div style={{ ...headStyle, color: visual.textColor }}>
                            {label}
                        </div>
                        <div style={trackStyle}>
                            <motion.div
                                style={{
                                    ...fillStyle,
                                    background: visual.lineColor,
                                    boxShadow: `0 0 14px ${visual.lineColor}66`,
                                }}
                                initial={false}
                                animate={{
                                    width: visual.value === null ? "0%" : "100%",
                                    opacity: visual.value === null ? 0.8 : 1,
                                }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const stripStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: 18,
    alignItems: "end",
} as const;

const sectorStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
} as const;

const headStyle = {
    fontSize: 20,
    fontWeight: 600,
    textAlign: "center" as const,
    lineHeight: 1,
    transition: "color 120ms linear",
} as const;

const trackStyle = {
    position: "relative",
    width: "100%",
    height: 6,
    borderRadius: 999,
    background: "rgba(89,94,109,0.68)",
    overflow: "hidden",
} as const;

const fillStyle = {
    position: "absolute",
    inset: 0,
    borderRadius: 999,
} as const;
