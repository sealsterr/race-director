import type { TowerSettings } from "../../../store/overlayStore";
import type { CarClass, TyreCompound } from "../../../types/lmu";

// -- class colors --
export const DEFAULT_CLASS_COLORS: Record<CarClass, string> = {
    HYPERCAR: "#E4002B",
    LMP2: "#0057A8",
    LMP3: "#FFD700",
    LMGT3: "#00A651",
    GTE: "#FF6600",
    UNKNOWN: "#475569",
};

export function getClassColor(
    carClass: CarClass,
    settings: TowerSettings
): string {
    switch (carClass) {
        case "HYPERCAR":
            return settings.colorHypercar;
        case "LMP2":
            return settings.colorLMP2;
        case "LMP3":
            return settings.colorLMP3;
        case "LMGT3":
            return settings.colorLMGT3;
        case "GTE":
            return settings.colorGTE;
        default:
            return DEFAULT_CLASS_COLORS.UNKNOWN;
    }
}

// -- tyre compounds --
export type TyreCompoundKey = "HARD" | "MEDIUM" | "SOFT" | "WET" | "UNKNOWN";

export interface TyreInfo {
    initial: string;
    defaultColor: string;
    settingsKey: keyof Pick<
        TowerSettings,
        "colorHard" | "colorMedium" | "colorSoft" | "colorWet"
    > | null;
}

export const TYRE_INFO: Record<TyreCompoundKey, TyreInfo> = {
    HARD: {
        initial: "H",
        defaultColor: "#FFFFFF",
        settingsKey: "colorHard",
    },
    MEDIUM: {
        initial: "M",
        defaultColor: "#FFD700",
        settingsKey: "colorMedium",
    },
    SOFT: {
        initial: "S",
        defaultColor: "#E4002B",
        settingsKey: "colorSoft",
    },
    WET: {
        initial: "W",
        defaultColor: "#0099FF",
        settingsKey: "colorWet",
    },
    UNKNOWN: {
        initial: "?",
        defaultColor: "#475569",
        settingsKey: null,
    },
};

export function getTyreColor(
    compound: TyreCompoundKey,
    settings: TowerSettings
): string {
    const info = TYRE_INFO[compound];
    if (info.settingsKey) {
        return settings[info.settingsKey];
    }
    return info.defaultColor;
}

export function normalizeTyreCompound(raw: TyreCompound): TyreCompoundKey {
    if (!raw) return "UNKNOWN";
    const upper = String(raw).toUpperCase();
    if (upper.includes("HARD") || upper === "H") return "HARD";
    if (upper.includes("MEDIUM") || upper === "M") return "MEDIUM";
    if (upper.includes("SOFT") || upper === "S") return "SOFT";
    if (
        upper.includes("WET") ||
        upper.includes("INTER") ||
        upper === "W"
    )
        return "WET";
    return "UNKNOWN";
}

// -- class order for consistent rendering --
export const CLASS_ORDER: CarClass[] = [
    "HYPERCAR",
    "LMP2",
    "LMP3",
    "LMGT3",
    "GTE",
];

export const CLASS_LABELS: Record<CarClass, string> = {
    HYPERCAR: "HYPERCAR",
    LMP2: "LMP2",
    LMP3: "LMP3",
    LMGT3: "LMGT3",
    GTE: "GTE",
    UNKNOWN: "UNKNOWN",
};

// -- fight special labels --
export type FightLabel =
    | "FIGHT FOR POLE"
    | "FIGHT FOR PODIUM"
    | "FIGHT FOR POINTS"
    | `FIGHT FOR P${number}`;

export function getFightLabel(
    classPosition: number
): FightLabel {
    if (classPosition === 1) return "FIGHT FOR POLE";
    if (classPosition === 3) return "FIGHT FOR PODIUM";
    if (classPosition === 10) return "FIGHT FOR POINTS";
    return `FIGHT FOR P${classPosition}`;
}

// -- animation durations --
export const ANIMATION_DURATION: Record<
    TowerSettings["animationSpeed"],
    number
> = {
    slow: 0.6,
    normal: 0.35,
    fast: 0.18,
};

// -- fight timeout --

/* ms before a fight highlight auto-expires */
export const FIGHT_TIMEOUT_MS = 60_000;

/* consecutive polls interval must exceed threshold before fight clears */
export const FIGHT_CLEAR_POLLS = 5;

// -- overlay window size --

/*
    default overlay dimensions
    width 360 fits: pos(30) + car#(40) + name(160) + value(90) + bar(3) + padding
    height 700 fits ~20 rows comfortably
*/

export const TOWER_DEFAULT_WIDTH = 400;
export const TOWER_DEFAULT_HEIGHT = 700;