import { create } from "zustand";

// -- types --
export type OverlayId = 
    | "OVERLAY-TOWER"
    | "OVERLAY-DRIVER"
    | "OVERLAY-GAP"
    | "OVERLAY-SESSION"
    | "OVERLAY-PITS"
    | "OVERLAY-SECTOR";

// -- specific settings --
export type TowerRaceMode =
    | "GAP_AHEAD"
    | "GAP_LEADER"
    | "PITS"
    | "FUEL"
    | "TYRES"
    | "POSITIONS";

export type TowerQualiMode = "QUALI_GAP" | "QUALI_TIMES";

export type TowerViewLayout = "PER_CLASS" | "MIXED_TOP";

export interface TowerSettings {
    viewLayout: TowerViewLayout;
    raceMode: TowerRaceMode;
    qualiMode: TowerQualiMode;
    maxRowsPerClass: number;
    fightThresholdSeconds: number;
    showCarNumber: boolean;
    showClassBar: boolean;
    animationSpeed: "slow" | "normal" | "fast";

    // class colors
    colorHypercar: string;
    colorLMP2: string;
    colorLMP3: string;
    colorLMGT3: string;
    colorGTE: string;

    // tyre colors
    colorHard: string;
    colorMedium: string;
    colorSoft: string;
    colorWet: string;
    
    colorPitBadge: string;
}

export interface DriverSettings {
    showFuel: boolean;
    showTyres: boolean;
    showBestLap: boolean;
    showCurrentLap: boolean;
    showTeam: boolean;
}

export interface GapSettings {
    triggerThresholdSeconds: number;
    showCarClass: boolean;
}

export interface SessionSettings {
    showTrackName: boolean;
    showSessionType: boolean;
    showTimeRemaining: boolean;
    showLapCount: boolean;
    showFlagState: boolean;
    colorScheme: "default" | "minimal" | "bold";
}

export interface PitsSettings {
    maxRows: number;
    showStopTimer: boolean;
    showCarNumber: boolean;
    showCarLogos: boolean;
}

export interface SectorSettings {
    showTimeToBeat: boolean;
    showAllSectors: boolean;
    flashOnPersonalBest: boolean;
}

export type OverlaySpecificSettings =
    | TowerSettings
    | DriverSettings
    | GapSettings
    | SessionSettings
    | PitsSettings
    | SectorSettings;

// -- base config --
export interface OverlayConfig<T extends OverlaySpecificSettings = OverlaySpecificSettings> {
    id: OverlayId;
    enabled: boolean;
    opacity: number;       // 0 – 100
    scale: number;         // 0.5 – 2.0
    x: number;             // px from left of target display
    y: number;             // px from top of target display
    displayId: number;     // electron display id
    dragMode: boolean;     // true = draggable, false = click-through
    settings: T;
}

// -- default configs --
const DEFAULT_CONFIGS: OverlayConfig[] = [
    {
        id: "OVERLAY-TOWER",
        enabled: false,
        opacity: 100,
        scale: 1,
        x: 20,
        y: 100,
        displayId: 0,
        dragMode: false,
        settings: {
            viewLayout: "PER_CLASS",
            raceMode: "GAP_AHEAD",
            qualiMode: "QUALI_GAP",
            maxRowsPerClass: 5,
            fightThresholdSeconds: 1,
            showCarNumber: true,
            showClassBar: true,
            animationSpeed: "normal",
            colorHypercar: "#E4002B",
            colorLMP2: "#0057A8",
            colorLMP3: "#FFD700",
            colorLMGT3: "#00A651",
            colorGTE: "#FF6600",
            colorHard: "#FFFFFF",
            colorMedium: "#FFD700",
            colorSoft: "#E4002B",
            colorWet: "#0099FF",
            colorPitBadge: "#F59E0B",
        } satisfies TowerSettings,
    },
    {
        id: "OVERLAY-DRIVER",
        enabled: false,
        opacity: 90,
        scale: 1,
        x: 40,
        y: 880,
        displayId: 0,
        dragMode: false,
        settings: {
            showFuel: true,
            showTyres: true,
            showBestLap: true,
            showCurrentLap: true,
            showTeam: true,
        } satisfies DriverSettings,
    },
    {
        id: "OVERLAY-GAP",
        enabled: false,
        opacity: 90,
        scale: 1,
        x: 760,
        y: 880,
        displayId: 0,
        dragMode: false,
        settings: {
            triggerThresholdSeconds: 1,
            showCarClass: true,
        } satisfies GapSettings,
    },
    {
        id: "OVERLAY-SESSION",
        enabled: false,
        opacity: 90,
        scale: 1,
        x: 0,
        y: 0,
        displayId: 0,
        dragMode: false,
        settings: {
            showTrackName: true,
            showSessionType: true,
            showTimeRemaining: true,
            showLapCount: true,
            showFlagState: true,
            colorScheme: "default",
        } satisfies SessionSettings,
    },
    {
        id: "OVERLAY-PITS",
        enabled: false,
        opacity: 90,
        scale: 1,
        x: 1820,
        y: 160,
        displayId: 0,
        dragMode: false,
        settings: {
            maxRows: 8,
            showStopTimer: true,
            showCarNumber: true,
            showCarLogos: true,
        } satisfies PitsSettings,
    },
    {
        id: "OVERLAY-SECTOR",
        enabled: false,
        opacity: 90,
        scale: 1,
        x: 760,
        y: 20,
        displayId: 0,
        dragMode: false,
        settings: {
            showTimeToBeat: true,
            showAllSectors: true,
            flashOnPersonalBest: true,
        } satisfies SectorSettings,
    },
];

// -- store shape
interface OverlayStore {
    overlays: OverlayConfig[];
    savePath: string;

    // actions
    setOverlayConfig: (id: OverlayId, partial: Partial<OverlayConfig>) => void;
    setOverlaySettings: (id: OverlayId, settings: Partial<OverlaySpecificSettings>) => void;
    setSavePath: (path: string) => void;
    getOverlay: (id: OverlayId) => OverlayConfig | undefined;
    loadFromPreset: (overlays: OverlayConfig[], savePath: string) => void;
}

export const useOverlayStore = create<OverlayStore>((set, get) => ({
    overlays: DEFAULT_CONFIGS,
    savePath: "",

    setOverlayConfig: (id, partial) => {
        set((state) => ({
            overlays: state.overlays.map((o) =>
                o.id === id ? { ...o, ...partial } : o
            ),
        }));
        const updated = get().overlays.find((o) => o.id === id);
        if (updated) globalThis.api?.overlay?.broadcastConfig?.(updated);
    },

    setOverlaySettings: (id, settings) => {
        set((state) => ({
            overlays: state.overlays.map((o) =>
                o.id === id
                    ? { ...o, settings: { ...o.settings, ...settings } }
                    : o
            ),
        }));
        const updated = get().overlays.find((o) => o.id === id);
        if (updated) globalThis.api?.overlay?.broadcastConfig?.(updated);
    },

    setSavePath: (path) => set({ savePath: path }),

    getOverlay: (id) => get().overlays.find((o) => o.id === id),

    loadFromPreset: (overlays, savePath) => set({ overlays, savePath }),
}));