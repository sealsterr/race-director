import { useRef, type CSSProperties, type ReactElement } from "react";
import { DriverPracticeQualiCard } from "./DriverPracticeQualiCard";
import { DriverRaceCard } from "./DriverRaceCard";
import { useDriverCardData } from "./useDriverCardData";
import { useTowerWindowAutosize } from "../tower/useTowerWindowAutosize";

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
    const contentRef = useRef<HTMLDivElement>(null);
    const hasVisibleParts =
        overlayConfig.settings.showPart1 ||
        overlayConfig.settings.showPart2 ||
        overlayConfig.settings.showPart3;

    useTowerWindowAutosize({
        enabled: true,
        overlayId: "OVERLAY-DRIVER",
        scale,
        targetRef: contentRef,
    });

    return (
        <div
            style={{
                ...rootStyle,
                pointerEvents: dragMode ? "auto" : "none",
                WebkitAppRegion: dragMode ? "drag" : "no-drag",
            } as CSSProperties}
        >
            <div
                ref={contentRef}
                style={{
                    position: "relative",
                    opacity,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    pointerEvents: dragMode ? "auto" : "none",
                    WebkitAppRegion: dragMode ? "drag" : "no-drag",
                    cursor: dragMode ? "grab" : "default",
                    padding: 0,
                    width: "fit-content",
                } as CSSProperties}
            >
                {hasVisibleParts ? (
                    mode === "RACE" ? (
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
                    )
                ) : (
                    <div style={{ width: 1, height: 1, opacity: 0 }} />
                )}
            </div>
        </div>
    );
}
