import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from "react";
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
        nationalityMark,
        isConfigReady,
        isPreview,
    } = useDriverCardData();
    const contentRef = useRef<HTMLDivElement>(null);
    const [disableEnterAnimation, setDisableEnterAnimation] = useState(true);
    const hasVisibleParts =
        overlayConfig.settings.showPart1 ||
        overlayConfig.settings.showPart2 ||
        overlayConfig.settings.showPart3;

    useEffect(() => {
        const frameId = requestAnimationFrame(() => {
            setDisableEnterAnimation(false);
        });

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, []);

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
                    opacity: isConfigReady ? opacity : 0,
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
                            nationalityMark={nationalityMark}
                            isPreview={isPreview}
                            disableEnterAnimation={disableEnterAnimation}
                        />
                    ) : (
                        <DriverPracticeQualiCard
                            driver={driver}
                            settings={overlayConfig.settings}
                            currentLapTime={currentLapTime}
                            sessionBestSectors={sessionBestSectors}
                            nameParts={nameParts}
                            nationalityMark={nationalityMark}
                            isPreview={isPreview}
                            disableEnterAnimation={disableEnterAnimation}
                        />
                    )
                ) : (
                    <div style={{ width: 1, height: 1, opacity: 0 }} />
                )}
            </div>
        </div>
    );
}
