import { AnimatePresence, motion } from "framer-motion";
import type { TowerSettings } from "../../../store/overlayStore";
import type { SectorTime } from "../../../types/lmu";
import type { FightGroup } from "./useFightDetection";
import type { TowerRow as TowerRowData } from "./useTowerData";
import FightBadge from "./FightBadge";
import TowerRow from "./TowerRow";

interface FightGroupBlockProps {
    readonly group: FightGroup;
    readonly rows: TowerRowData[];
    readonly settings: TowerSettings;
    readonly overtakingSlots: Map<number, "gained" | "lost">;
    readonly sessionBestSectors: SectorTime;
    readonly isQuali: boolean;
    readonly classBestLapTime: number | null;
}

export default function FightGroupBlock({
    group,
    rows,
    settings,
    overtakingSlots,
    sessionBestSectors,
    isQuali,
    classBestLapTime,
}: FightGroupBlockProps) {
    return (
        <div style={{ marginBottom: 2 }}>
            <div style={{ position: "relative", borderRadius: 4, overflow: "visible" }}>
                <div
                    style={{
                        position: "absolute",
                        top: -10,
                        left: 8,
                        zIndex: 3,
                        pointerEvents: "none",
                    }}
                >
                    <FightBadge label={group.label} />
                </div>
                <AnimatePresence>
                    <motion.div
                        key={group.id}
                        animate={{ opacity: [0.8, 0.2, 0.8] }}
                        transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            position: "absolute",
                            inset: -1,
                            zIndex: 2,
                            border: "2px solid #facc15",
                            borderRadius: 4,
                            pointerEvents: "none",
                            boxShadow: "0 0 16px rgba(250,204,21,0.18)",
                        }}
                    />
                </AnimatePresence>
                {rows.map((row) => (
                    <TowerRow
                        key={row.key}
                        row={row}
                        settings={settings}
                        isOvertaking={overtakingSlots.get(row.standing.slotId) ?? null}
                        sessionBestSectors={sessionBestSectors}
                        isQuali={isQuali}
                        classBestLapTime={classBestLapTime}
                    />
                ))}
            </div>
        </div>
    );
}
