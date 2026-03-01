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
export interface TowerSettings {
    maxRows: number;
    classFilter: "ALL" | "HYPERCAR" | "LMP2" | "LMP3" | "LMGT3" | "GTE";
    showCarLogos: boolean;
    showCarNumber: boolean;
    showGapToLeader: boolean;
    animationSpeed: "slow" | "normal" | "fast";
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
        opacity: 90,
        scale: 1,
        x: 40,
        y: 160,
        displayId: 0,
        dragMode: false,
        settings: {
            maxRows: 10,
            classFilter: "ALL",
            showCarLogos: true,
            showCarNumber: true,
            showGapToLeader: true,
            animationSpeed: "normal",
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

    setOverlayConfig: (id, partial) =>
        set((state) => ({
            overlays: state.overlays.map((o) =>
                o.id === id ? { ...o, ...partial } : o
            ),
        })),

    setOverlaySettings: (id, settings) =>
        set((state) => ({
            overlays: state.overlays.map((o) =>
                o.id === id
                    ? { ...o, settings: { ...o.settings, ...settings } }
                    : o
            ),
        })),

    setSavePath: (path) => set({ savePath: path }),

    getOverlay: (id) => get().overlays.find((o) => o.id === id),

    loadFromPreset: (overlays, savePath) => set({ overlays, savePath }),
}));