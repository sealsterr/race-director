import type { CSSProperties, ReactElement } from "react";
import { DriverPracticeQualiCard } from "./DriverPracticeQualiCard";
import { DriverRaceCard } from "./DriverRaceCard";
import { useDriverCardData } from "./useDriverCardData";

const rootStyle: CSSProperties = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    overflow: "hidden",
    background: "none",
};

export default function DriverOverlay(): ReactElement {
    const {
        driver,
        overlayConfig,
        currentLapTime,
        sessionBestSectors,
        mode,
        dragMode,
        opacity,
        scale,
        nameParts,
        brandMark,
        nationalityMark,
    } = useDriverCardData();

    return (
        <div
            style={{
                ...rootStyle,
                pointerEvents: dragMode ? "auto" : "none",
                WebkitAppRegion: dragMode ? "drag" : "no-drag",
            } as CSSProperties}
        >
            <div
                style={{
                    position: "relative",
                    opacity,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    pointerEvents: dragMode ? "auto" : "none",
                    WebkitAppRegion: dragMode ? "drag" : "no-drag",
                    cursor: dragMode ? "grab" : "default",
                    padding: 0,
                    width: 872,
                } as CSSProperties}
            >
                {mode === "RACE" ? (
                    <DriverRaceCard
                        driver={driver}
                        settings={overlayConfig.settings}
                        nameParts={nameParts}
                        brandMark={brandMark}
                        nationalityMark={nationalityMark}
                    />
                ) : (
                    <DriverPracticeQualiCard
                        driver={driver}
                        settings={overlayConfig.settings}
                        currentLapTime={currentLapTime}
                        sessionBestSectors={sessionBestSectors}
                        nameParts={nameParts}
                        brandMark={brandMark}
                        nationalityMark={nationalityMark}
                    />
                )}
            </div>
        </div>
    );
}
