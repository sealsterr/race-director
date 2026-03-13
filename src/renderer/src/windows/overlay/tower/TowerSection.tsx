import { AnimatePresence, motion } from "framer-motion";
import type { TowerSettings } from "../../../store/overlayStore";
import type { TowerSection as TowerSectionData } from "./useTowerData";
import type { FightGroup } from "./useFightDetection";
import type { SectorTime } from "../../../types/lmu";
import { getClassColor, CLASS_LABELS, ANIMATION_DURATION } from "./constants";
import TowerRow from "./TowerRow";
import FightBadge from "./FightBadge";
import { STATUS_EAR_GUTTER } from "./StatusEar";

interface TowerSectionProps {
    readonly section: TowerSectionData;
    readonly settings: TowerSettings;
    readonly fightGroups: FightGroup[];
    readonly overtakingSlots: Map<number, "gained" | "lost">;
    readonly sessionBestSectors: SectorTime;
    readonly isQuali: boolean;
}

export default function TowerSection({
    section,
    settings,
    fightGroups,
    overtakingSlots,
    sessionBestSectors,
    isQuali,
}: TowerSectionProps) {
    const classColor = getClassColor(section.carClass, settings);
    const animDuration = ANIMATION_DURATION[settings.animationSpeed];

    // build set of fighting slotIds for lookup
    const fightingSlotIds = new Set<number>(
        fightGroups.flatMap((g) => g.slotIds)
    );

    // find which fight group starts at first row of a group so we can render badge above
    const badgeBySlotId = new Map<number, FightGroup>();
    for (const group of fightGroups) {
        const firstSlot = group.slotIds[0];
        if (firstSlot !== undefined) {
            badgeBySlotId.set(firstSlot, group);
        }
    }

    const classBestLapTime = section.rows.reduce<number | null>((best, row) => {
        const lap = row.standing.bestLapTime;
        if (lap === null) return best;
        if (best === null || lap < best) return lap;
        return best;
    }, null);

    return (
        <div
            style={{
                marginBottom: 12,
                paddingRight: STATUS_EAR_GUTTER,
                overflow: "visible",
            }}
        >
            <div
                style={{
                    borderRadius: 6,
                    overflow: "visible",
                    backgroundColor: "rgba(8, 9, 14, 0.75)",
                    backdropFilter: "blur(18px) saturate(1.4) brightness(0.7)",
                    WebkitBackdropFilter: "saturate(1.4) brightness(0.7)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "6px 0 4px 0",
                    boxShadow:
                        "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 28,
                        marginBottom: 3,
                        position: "relative",
                        background: `linear-gradient(90deg, transparent 0%, ${classColor}22 40%, ${classColor}22 60%, transparent 100%)`,
                        borderTop: `2px solid ${classColor}`,
                        borderBottom: `2px solid ${classColor}44`,
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 118,
                            height: 3,
                            background: `linear-gradient(90deg, transparent, ${classColor})`,
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            right: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 120,
                            height: 3,
                            background: `linear-gradient(270deg, transparent, ${classColor})`,
                        }}
                    />
                    <span
                        style={{
                            fontSize: 15,
                            fontWeight: 900,
                            color: classColor,
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            textShadow: `0 0 16px ${classColor}88, 0 0 4px ${classColor}44`,
                        }}
                    >
                        {CLASS_LABELS[section.carClass]}
                    </span>
                </div>

                <AnimatePresence initial={false}>
                    {section.rows.map((row) => {
                        const badgeGroup = badgeBySlotId.get(row.standing.slotId);
                        const isFighting = fightingSlotIds.has(row.standing.slotId);
                        const overtaking =
                            overtakingSlots.get(row.standing.slotId) ?? null;

                        return (
                            <motion.div
                                key={row.key}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 8 }}
                                transition={{ duration: animDuration }}
                            >
                                {badgeGroup && (
                                    <FightBadge
                                        label={badgeGroup.label}
                                        visible={isFighting}
                                    />
                                )}
                                <TowerRow
                                    row={row}
                                    settings={settings}
                                    isFighting={isFighting}
                                    isOvertaking={overtaking}
                                    sessionBestSectors={sessionBestSectors}
                                    isQuali={isQuali}
                                    classBestLapTime={classBestLapTime}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
