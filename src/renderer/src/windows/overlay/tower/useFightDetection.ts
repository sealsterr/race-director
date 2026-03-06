import { useEffect, useRef, useState } from "react";
import type { TowerSection } from "./useTowerData";
import { FIGHT_CLEAR_POLLS, FIGHT_TIMEOUT_MS, getFightLabel, } from "./constants";
import type { FightLabel } from "./constants";

// -- types --
export interface FightGroup {
    /* unique identifier: slotIds joined "12-7-99" */
    id: string;
    /* slotIds of all cars involved */
    slotIds: number[];
    /* class positions involved */
    classPositions: number[];
    /* display label */
    label: FightLabel;
    /* timestamp when fight was first detected (ms) */
    startedAt: number;
    /* how many consecutive polls interval was above threshold */
    clearPollCount: number;
}

// -- hook --
interface UseFightDetectionOptions {
    sections: TowerSection[];
    thresholdSeconds: number;
    enabled: boolean;
}

// -- pure helpers --

function getFightingIndices(
    rows: TowerSection["rows"],
    thresholdSeconds: number
): number[] {
    const set = new Set<number>();
    for (let i = 1; i < rows.length; i++) {
        const interval = rows[i].intervalSeconds;
        if (interval !== null && interval <= thresholdSeconds) {
            set.add(i - 1);
            set.add(i);
        }
    }
    return Array.from(set).sort((a, b) => a - b);
}

function mergeIntoGroups(indices: number[]): number[][] {
    if (indices.length === 0) return [];
    const groups: number[][] = [];
    let current: number[] = [indices[0]];
    for (let k = 1; k < indices.length; k++) {
        if (indices[k] === indices[k - 1] + 1) {
            current.push(indices[k]);
        } else {
            groups.push(current);
            current = [indices[k]];
        }
    }
    groups.push(current);
    return groups;
}

function detectSectionFights(
    rows: TowerSection["rows"],
    thresholdSeconds: number,
    now: number,
    existing: Map<string, FightGroup>,
    out: Map<string, FightGroup>
): void {
    if (rows.length < 2) return;

    const indices = getFightingIndices(rows, thresholdSeconds);
    const groups = mergeIntoGroups(indices);

    for (const group of groups) {
        const involvedRows = group.map((i) => rows[i]);
        const slotIds = involvedRows.map((r) => r.standing.slotId);
        const classPositions = involvedRows.map((r) => r.classPosition);
        const id = slotIds.join("-");
        const prev = existing.get(id);

        if (prev && now - prev.startedAt >= FIGHT_TIMEOUT_MS) continue;

        out.set(id, {
            id,
            slotIds,
            classPositions,
            label: getFightLabel(classPositions[0]),
            startedAt: prev?.startedAt ?? now,
            clearPollCount: 0,
        });
    }
}

function expireOldFights(
    existing: Map<string, FightGroup>,
    out: Map<string, FightGroup>
): void {
    for (const [id, fight] of existing.entries()) {
        if (out.has(id)) continue;
        const updated = { ...fight, clearPollCount: fight.clearPollCount + 1 };
        if (updated.clearPollCount < FIGHT_CLEAR_POLLS) {
            out.set(id, updated);
        }
    }
}

export function useFightDetection({
    sections,
    thresholdSeconds,
    enabled,
}: UseFightDetectionOptions): FightGroup[] {
    const [fights, setFights] = useState<FightGroup[]>([]);
    // track existing fights by id for timeout/cooldown logic
    const fightsRef = useRef<Map<string, FightGroup>>(new Map());

    useEffect(() => {
        if (!enabled) {
            setFights([]);
            fightsRef.current.clear();
            return;
        }

        const now = Date.now();
        const newFightMap = new Map<string, FightGroup>();

        for (const section of sections) {
            detectSectionFights(
                section.rows,
                thresholdSeconds,
                now,
                fightsRef.current,
                newFightMap
            );
        }

        expireOldFights(fightsRef.current, newFightMap);

        fightsRef.current = newFightMap;
        setFights(Array.from(newFightMap.values()));
    }, [sections, thresholdSeconds, enabled]);

    return fights;
}