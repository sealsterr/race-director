import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Save,
    FolderOpen,
    Move,
    Eye,
    EyeOff,
    Settings2,
    X,
    ChevronRight,
    Monitor,
    Layers,
    CheckCircle2,
    AlertCircle,
    LayoutList,
    User,
    Gauge,
    Timer,
    ParkingSquare,
    SplitSquareHorizontal,
} from "lucide-react";
import { useOverlayStore } from "../../store/overlayStore";
import type {
    OverlayId,
    OverlayConfig,
    TowerSettings,
    DriverSettings,
    GapSettings,
    SessionSettings,
    PitsSettings,
    SectorSettings,
} from "../../store/overlayStore";
import { useRaceStore } from "../../store/raceStore";

// -- overlay metadata --
interface OverlayMeta {
    id: OverlayId;
    label: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    defaultSize: { w: number; h: number };
}

const OVERLAY_META: OverlayMeta[] = [
    {
        id: "OVERLAY-TOWER",
        label: "Live Tower",
        description: "Standings tower",
        icon: LayoutList,
        defaultSize: { w: 340, h: 600 },
    },
    {
        id: "OVERLAY-DRIVER",
        label: "Driver Cards",
        description: "Focused driver information",
        icon: User,
        defaultSize: { w: 540, h: 120 },
    },
    {
        id: "OVERLAY-GAP",
        label: "Battle Gap",
        description: "Head-to-head graphic for close battles",
        icon: Gauge,
        defaultSize: { w: 460, h: 100 },
    },
    {
        id: "OVERLAY-SESSION",
        label: "Session Bar",
        description: "Session information",
        icon: Timer,
        defaultSize: { w: 1920, h: 60 },
    },
    {
        id: "OVERLAY-PITS",
        label: "Pit Board",
        description: "Pitting cars",
        icon: ParkingSquare,
        defaultSize: { w: 300, h: 500 },
    },
    {
        id: "OVERLAY-SECTOR",
        label: "Sector Splits",
        description: "Detailed sector showcase",
        icon: SplitSquareHorizontal,
        defaultSize: { w: 420, h: 80 },
    },
];

// -- helpers --
const cls = (...classes: (string | false | undefined | null)[]): string =>
  classes.filter(Boolean).join(" ");

// -- toast --
interface Toast {
    id: number;
    type: "success" | "error";
    message: string;
}

let toastCounter = 0;

// -- slider --
interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (v: number) => void;
}

const Slider = ({
    label,
    value,
    min,
    max,
    step,
    unit = "",
    onChange,
}: SliderProps): React.ReactElement => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
            <span className="text-xs text-rd-muted">{label}</span>
            <span className="text-xs font-mono text-rd-text">
                {value}
                {unit}
            </span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-rd-border
                [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-rd-accent
                [&::-webkit-slider-thumb]:cursor-pointer"
        />
    </div>
);

// -- toggle --
interface ToggleProps {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
}

const Toggle = ({
    label,
    value,
    onChange,
}: ToggleProps): React.ReactElement => (
    <div className="flex items-center justify-between">
        <span className="text-xs text-rd-muted">{label}</span>
        <button
            onClick={() => onChange(!value)}
            className={cls(
                "relative h-5 w-9 rounded-full transition-colors duration-200",
                value ? "bg-rd-accent" : "bg-rd-border"
            )}>
            <span
                className={cls(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                value ? "translate-x-4" : "translate-x-0.5"
                )}
            />
        </button>
    </div>
);

// -- select --
interface SelectProps {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (v: string) => void;
}

const Select = ({
    label,
    value,
    options,
    onChange,
}: SelectProps): React.ReactElement => (
    <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-rd-muted">{label}</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded border border-rd-border bg-rd-bg px-2 py-1 text-xs
                text-rd-text focus:border-rd-accent focus:outline-none"
            >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    </div>
);

// -- overlay-specific settings panels --
const TowerSettingsPanel = ({
    cfg,
}: {
    cfg: OverlayConfig;
}): React.ReactElement => {
    const { setOverlaySettings } = useOverlayStore();
    const s = cfg.settings as TowerSettings;
    const set = (partial: Partial<TowerSettings>): void =>
        setOverlaySettings(cfg.id, partial);

    return (
        <div className="flex flex-col gap-3">
            <Select
                label="Class filter"
                value={s.classFilter}
                options={[
                    { label: "All classes", value: "ALL" },
                    { label: "Hypercar", value: "HYPERCAR" },
                    { label: "LMP2", value: "LMP2" },
                    { label: "LMP3", value: "LMP3" },
                    { label: "LMGT3", value: "LMGT3" },
                    { label: "GTE", value: "GTE" },
                ]}
                onChange={(v) => set({ classFilter: v as TowerSettings["classFilter"] })}
            />
            <Select
                label="Animation speed"
                value={s.animationSpeed}
                options={[
                    { label: "Slow", value: "slow" },
                    { label: "Normal", value: "normal" },
                    { label: "Fast", value: "fast" },
                ]}
                onChange={(v) =>
                    set({ animationSpeed: v as TowerSettings["animationSpeed"] })
                }
            />
            <Slider
                label="Max rows"
                value={s.maxRows}
                min={3}
                max={20}
                step={1}
                onChange={(v) => set({ maxRows: v })}
            />
            <Toggle
                label="Show car logos"
                value={s.showCarLogos}
                onChange={(v) => set({ showCarLogos: v })}
            />
            <Toggle
                label="Show car number"
                value={s.showCarNumber}
                onChange={(v) => set({ showCarNumber: v })}
            />
            <Toggle
                label="Show gap to leader"
                value={s.showGapToLeader}
                onChange={(v) => set({ showGapToLeader: v })}
            />
        </div>
    );
};

const DriverSettingsPanel = ({
    cfg,
}: {
    cfg: OverlayConfig;
}): React.ReactElement => {
    const { setOverlaySettings } = useOverlayStore();
    const s = cfg.settings as DriverSettings;
    const set = (partial: Partial<DriverSettings>): void =>
        setOverlaySettings(cfg.id, partial);

    return (
        <div className="flex flex-col gap-3">
            <Toggle label="Show team name" value={s.showTeam} onChange={(v) => set({ showTeam: v })} />
            <Toggle label="Show best lap" value={s.showBestLap} onChange={(v) => set({ showBestLap: v })} />
            <Toggle label="Show current lap" value={s.showCurrentLap} onChange={(v) => set({ showCurrentLap: v })} />
            <Toggle label="Show fuel" value={s.showFuel} onChange={(v) => set({ showFuel: v })} />
            <Toggle label="Show tyres" value={s.showTyres} onChange={(v) => set({ showTyres: v })} />
        </div>
    );
};

const GapSettingsPanel = ({
    cfg,
}: {
    cfg: OverlayConfig;
}): React.ReactElement => {
    const { setOverlaySettings } = useOverlayStore();
    const s = cfg.settings as GapSettings;
    const set = (partial: Partial<GapSettings>): void =>
        setOverlaySettings(cfg.id, partial);

    return (
        <div className="flex flex-col gap-3">
            <Slider
                label="Trigger threshold"
                value={s.triggerThresholdSeconds}
                min={0.1}
                max={5}
                step={0.1}
                unit="s"
                onChange={(v) => set({ triggerThresholdSeconds: v })}
            />
            <Toggle
                label="Show car class"
                value={s.showCarClass}
                onChange={(v) => set({ showCarClass: v })}
            />
        </div>
    );
};

const SessionSettingsPanel = ({
    cfg,
}: {
    cfg: OverlayConfig;
}): React.ReactElement => {
    const { setOverlaySettings } = useOverlayStore();
    const s = cfg.settings as SessionSettings;
    const set = (partial: Partial<SessionSettings>): void =>
        setOverlaySettings(cfg.id, partial);

    return (
        <div className="flex flex-col gap-3">
            <Select
                label="Color scheme"
                value={s.colorScheme}
                options={[
                    { label: "Default", value: "default" },
                    { label: "Minimal", value: "minimal" },
                    { label: "Bold", value: "bold" },
                ]}
                onChange={(v) =>
                    set({ colorScheme: v as SessionSettings["colorScheme"] })
                }
            />
            <Toggle label="Show track name" value={s.showTrackName} onChange={(v) => set({ showTrackName: v })} />
            <Toggle label="Show session type" value={s.showSessionType} onChange={(v) => set({ showSessionType: v })} />
            <Toggle label="Show time remaining" value={s.showTimeRemaining} onChange={(v) => set({ showTimeRemaining: v })} />
            <Toggle label="Show lap count" value={s.showLapCount} onChange={(v) => set({ showLapCount: v })} />
            <Toggle label="Show flag state" value={s.showFlagState} onChange={(v) => set({ showFlagState: v })} />
        </div>
    );
};

const PitsSettingsPanel = ({
    cfg,
}: {
    cfg: OverlayConfig;
}): React.ReactElement => {
    const { setOverlaySettings } = useOverlayStore();
    const s = cfg.settings as PitsSettings;
    const set = (partial: Partial<PitsSettings>): void =>
        setOverlaySettings(cfg.id, partial);

    return (
        <div className="flex flex-col gap-3">
            <Slider
                label="Max rows"
                value={s.maxRows}
                min={2}
                max={15}
                step={1}
                onChange={(v) => set({ maxRows: v })}
            />
            <Toggle label="Show stop timer" value={s.showStopTimer} onChange={(v) => set({ showStopTimer: v })} />
            <Toggle label="Show car number" value={s.showCarNumber} onChange={(v) => set({ showCarNumber: v })} />
            <Toggle label="Show car logos" value={s.showCarLogos} onChange={(v) => set({ showCarLogos: v })} />
        </div>
    );
};

const SectorSettingsPanel = ({
    cfg,
}: {
    cfg: OverlayConfig;
}): React.ReactElement => {
    const { setOverlaySettings } = useOverlayStore();
    const s = cfg.settings as SectorSettings;
    const set = (partial: Partial<SectorSettings>): void =>
        setOverlaySettings(cfg.id, partial);

    return (
        <div className="flex flex-col gap-3">
            <Toggle label="Show time to beat" value={s.showTimeToBeat} onChange={(v) => set({ showTimeToBeat: v })} />
            <Toggle label="Show all sectors" value={s.showAllSectors} onChange={(v) => set({ showAllSectors: v })} />
            <Toggle label="Flash on personal best" value={s.flashOnPersonalBest} onChange={(v) => set({ flashOnPersonalBest: v })} />
        </div>
    );
};

const SPECIFIC_PANELS: Record<
    OverlayId,
    (props: { cfg: OverlayConfig }) => React.ReactElement
> = {
    "OVERLAY-TOWER": TowerSettingsPanel,
    "OVERLAY-DRIVER": DriverSettingsPanel,
    "OVERLAY-GAP": GapSettingsPanel,
    "OVERLAY-SESSION": SessionSettingsPanel,
    "OVERLAY-PITS": PitsSettingsPanel,
    "OVERLAY-SECTOR": SectorSettingsPanel,
};

// -- settings drawer --
interface SettingsDrawerProps {
    cfg: OverlayConfig;
    meta: OverlayMeta;
    displays: DisplayInfo[];
    onClose: () => void;
}

interface DisplayInfo {
    id: number;
    label: string;
    bounds: { x: number; y: number; width: number; height: number };
    isPrimary: boolean;
}

const SettingsDrawer = ({
    cfg,
    meta,
    displays,
    onClose,
}: SettingsDrawerProps): React.ReactElement => {
    const { setOverlayConfig } = useOverlayStore();
    const SpecificPanel = SPECIFIC_PANELS[cfg.id];
    const Icon = meta.icon;

    return (
        <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-y-0 right-0 z-30 flex w-80 flex-col
                border-l border-rd-border bg-rd-surface shadow-2xl"
            >
            {/* header */}
            <div className="flex items-center gap-3 border-b border-rd-border px-5 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-rd-accent/15">
                    <Icon size={15} className="text-rd-accent" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-rd-text">{meta.label}</p>
                    <p className="text-xs text-rd-subtle">Settings</p>
                </div>
                <button
                    onClick={onClose}
                    className="rounded p-1 text-rd-subtle hover:bg-rd-elevated hover:text-rd-text
                        transition-colors"
                    >
                    <X size={14} />
                </button>
            </div>

            {/* scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
                {/* general */}
                <section>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rd-subtle">
                        General
                    </p>
                    <div className="flex flex-col gap-3">
                        <Slider
                            label="Opacity"
                            value={cfg.opacity}
                            min={10}
                            max={100}
                            step={1}
                            unit="%"
                            onChange={(v) => setOverlayConfig(cfg.id, { opacity: v })}
                        />
                        <Slider
                            label="Scale"
                            value={cfg.scale}
                            min={0.5}
                            max={2}
                            step={0.05}
                            unit="×"
                            onChange={(v) => setOverlayConfig(cfg.id, { scale: v })}
                        />
                    </div>
                </section>

                {/* position */}
                <section>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rd-subtle">
                        Position
                    </p>
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="mb-1 text-xs text-rd-muted">X (px)</p>
                                <input
                                    type="number"
                                    value={cfg.x}
                                    onChange={(e) =>
                                        setOverlayConfig(cfg.id, { x: Number(e.target.value) })
                                    }
                                    className="w-full rounded border border-rd-border bg-rd-bg px-2 py-1
                                        text-xs text-rd-text focus:border-rd-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-rd-muted">Y (px)</p>
                                <input
                                    type="number"
                                    value={cfg.y}
                                    onChange={(e) =>
                                        setOverlayConfig(cfg.id, { y: Number(e.target.value) })
                                    }
                                    className="w-full rounded border border-rd-border bg-rd-bg px-2 py-1
                                        text-xs text-rd-text focus:border-rd-accent focus:outline-none"
                                />
                            </div>
                        </div>

                        {displays.length > 1 && (
                            <Select
                                label="Display"
                                value={String(cfg.displayId)}
                                options={displays.map((d) => ({
                                    label: d.label,
                                    value: String(d.id),
                                }))}
                                onChange={(v) =>
                                    setOverlayConfig(cfg.id, { displayId: Number(v) })
                                }
                            />
                        )}
                    </div>
                </section>

                {/* overlay-specific */}
                <section>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rd-subtle">
                        Overlay Settings
                    </p>
                    <SpecificPanel cfg={cfg} />
                </section>
            </div>
        </motion.div>
    );
};

// -- overlay card --
interface OverlayCardProps {
    cfg: OverlayConfig;
    meta: OverlayMeta;
    isSettingsOpen: boolean;
    onToggleEnabled: () => void;
    onToggleDrag: () => void;
    onOpenSettings: () => void;
}

const OverlayCard = ({
    cfg,
    meta,
    isSettingsOpen,
    onToggleEnabled,
    onToggleDrag,
    onOpenSettings,
}: OverlayCardProps): React.ReactElement => {
    const Icon = meta.icon;

    return (
        <motion.div
            layout
            className={cls(
                "relative flex flex-col gap-3 rounded-lg border p-4 transition-colors duration-150",
                cfg.enabled
                    ? "border-rd-accent/30 bg-rd-elevated"
                    : "border-rd-border bg-rd-surface"
            )}
            >
            {/* live pulse */}
            {cfg.enabled && (
                <span className="absolute right-3 top-3 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rd-accent opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rd-accent" />
                </span>
            )}

            {/* header row */}
            <div className="flex items-start gap-3 pr-4">
                <div
                    className={cls(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded",
                        cfg.enabled
                            ? "bg-rd-accent/20 text-rd-accent"
                            : "bg-rd-border/40 text-rd-muted"
                    )}
                    >
                    <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-rd-text">{meta.label}</p>
                    <p className="text-xs leading-snug text-rd-subtle">
                        {meta.description}
                    </p>
                </div>
            </div>

            {/* opacity bar preview */}
            {cfg.enabled && (
                <div className="h-0.5 rounded-full bg-rd-border overflow-hidden">
                    <div
                        className="h-full rounded-full bg-rd-accent/50 transition-all"
                        style={{ width: `${cfg.opacity}%` }}
                    />
                </div>
            )}

            {/* action row */}
            <div className="flex items-center gap-2">
                {/* on / off */}
                <button
                    onClick={onToggleEnabled}
                    className={cls(
                        "flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5",
                        "text-xs font-semibold transition-colors duration-150",
                        cfg.enabled
                            ? "bg-rd-accent/20 text-rd-accent hover:bg-rd-accent/30"
                            : "bg-rd-border/40 text-rd-muted hover:bg-rd-border hover:text-rd-text"
                    )}
                    >
                    {cfg.enabled ? (
                        <>
                            <Eye size={11} /> LIVE
                        </>
                    ) : (
                        <>
                            <EyeOff size={11} /> OFF
                        </>
                    )}
                </button>

                {/* drag mode */}
                <button
                    onClick={onToggleDrag}
                    title={cfg.dragMode ? "Drag mode ON: Click to lock" : "Enable drag mode"}
                    className={cls(
                        "flex items-center justify-center rounded px-2.5 py-1.5 transition-colors",
                        cfg.dragMode
                            ? "bg-rd-gold/20 text-rd-gold hover:bg-rd-gold/30"
                            : "bg-rd-border/40 text-rd-muted hover:bg-rd-border hover:text-rd-text"
                    )}
                    >
                    <Move size={13} />
                </button>

                {/* settings */}
                <button
                    onClick={onOpenSettings}
                    className={cls(
                        "flex items-center justify-center rounded px-2.5 py-1.5 transition-colors",
                        isSettingsOpen
                            ? "bg-rd-accent/20 text-rd-accent"
                            : "bg-rd-border/40 text-rd-muted hover:bg-rd-border hover:text-rd-text"
                    )}
                    >
                    <Settings2 size={13} />
                </button>
            </div>
        </motion.div>
    );
};

// -- main component --
const OverlayControl = (): React.ReactElement => {
    const { overlays, savePath, setOverlayConfig, setSavePath, loadFromPreset } =
        useOverlayStore();
    const session = useRaceStore((s) => s.session);
    const connection = useRaceStore((s) => s.connection);

    const [displays, setDisplays] = useState<DisplayInfo[]>([]);
    const [openSettings, setOpenSettings] = useState<OverlayId | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // -- hydrate --
    useEffect(() => {
        globalThis.api.getState().then((s) => {
            useRaceStore.getState().setSession(s.session);
            useRaceStore.getState().setStandings(s.standings);
            useRaceStore.getState().setConnection(s.connection);
        });

        const unsub1 = globalThis.api.onStateUpdate((s) => {
            useRaceStore.getState().setSession(s.session);
            useRaceStore.getState().setStandings(s.standings);
        });
        const unsub2 = globalThis.api.onConnectionChange((c) => {
            useRaceStore.getState().setConnection(c);
        });

        return () => {
            unsub1();
            unsub2();
        };
    }, []);

    // -- load displays + default save path --
    useEffect(() => {
        (async () => {
            const d = await globalThis.api.overlay.getDisplays();
            setDisplays(d);

            if (!savePath) {
                const def = await globalThis.api.overlay.getDefaultSavePath();
                setSavePath(def);
            }
        })();
    }, []);

    // -- auto-save on overlay change --
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!savePath) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);

        const runAutoSave = async (): Promise<void> => {
            const r = await globalThis.api.overlay.savePreset(overlays, savePath);
            if (!r.ok) pushToast("error", `Auto-save failed: ${r.error}`);
        };

        saveTimer.current = setTimeout(() => {
            void runAutoSave();
        }, 1500);

        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
        };
    }, [overlays, savePath]);

    // -- toast helpers --
    const pushToast = (type: Toast["type"], message: string): void => {
        const id = ++toastCounter;
        setToasts((prev) => [...prev, { id, type, message }]);
        const removeToast = (): void =>
            setToasts((prev) => prev.filter((x) => x.id !== id));
        setTimeout(removeToast, 3500);
    };

    // -- save / load --
    const handleSave = async (): Promise<void> => {
        setIsSaving(true);
        const r = await globalThis.api.overlay.savePreset(overlays, savePath);
        setIsSaving(false);
        if (r.ok) pushToast("success", "Preset saved!");
        else pushToast("error", `Save failed: ${r.error}`);
    };

    const handleSaveAs = async (): Promise<void> => {
        const pick = await globalThis.api.overlay.pickSavePath();
        if (!pick.ok || !pick.path) return;
        setSavePath(pick.path);
        const r = await globalThis.api.overlay.savePreset(overlays, pick.path);
        if (r.ok) pushToast("success", "Preset saved to new location!");
        else pushToast("error", `Save failed: ${r.error}`);
    };

    const handleLoad = async (): Promise<void> => {
        const pick = await globalThis.api.overlay.pickLoadPath();
        if (!pick.ok || !pick.path) return;
        const r = await globalThis.api.overlay.loadPreset(pick.path);
        if (r.ok && r.data) {
            loadFromPreset(r.data.overlays, pick.path);
            pushToast("success", "Preset loaded!");
        } else {
            pushToast("error", `Load failed: ${r.error}`);
        }
    };

    // -- overlay actions --
    const handleToggleEnabled = async (id: OverlayId): Promise<void> => {
        const cfg = overlays.find((o) => o.id === id);
        if (!cfg) return;
        const next = !cfg.enabled;
        setOverlayConfig(id, { enabled: next });
        if (next) {
            await globalThis.api.windows.open(id);
        } else {
            await globalThis.api.windows.close(id);
        }
    };

    const handleToggleDrag = async (id: OverlayId): Promise<void> => {
        const cfg = overlays.find((o) => o.id === id);
        if (!cfg) return;
        const next = !cfg.dragMode;
        setOverlayConfig(id, { dragMode: next });
        await globalThis.api.overlay.setDragMode(id, next);
    };

    const openSettingsMeta = openSettings
        ? OVERLAY_META.find((m) => m.id === openSettings)
        : null;
    const openSettingsCfg = openSettings
        ? overlays.find((o) => o.id === openSettings)
        : null;

    return (
        <div
            className="flex h-screen flex-col bg-rd-bg text-rd-text overflow-hidden"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
            {/* title bar */}
            <div
                className="flex h-14 shrink-0 items-center gap-4 border-b border-rd-border
                bg-rd-surface px-6"
                style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
            >
                {/* logo mark */}
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-rd-accent">
                        <Layers size={14} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-rd-text">
                            Overlay Control
                        </p>
                        <p className="text-[10px] text-rd-subtle leading-none">
                            RaceDirector
                        </p>
                    </div>
                </div>

                {/* session pill */}
                {session && (
                <div className="hidden sm:flex items-center gap-2 rounded border border-rd-border
                    bg-rd-elevated px-3 py-1">
                    <Monitor size={11} className="text-rd-muted" />
                    <span className="text-xs text-rd-muted">{session.trackName}</span>
                    <ChevronRight size={10} className="text-rd-subtle" />
                    <span className="text-xs text-rd-text">{session.sessionType}</span>
                </div>
                )}

                <div className="flex-1" style={{ WebkitAppRegion: "drag" } as React.CSSProperties} />

                {/* action buttons */}
                <div
                    className="flex items-center gap-2"
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                    >
                    <button
                        onClick={handleLoad}
                        title="Load preset"
                        className="flex items-center gap-1.5 rounded border border-rd-border
                        bg-rd-elevated px-3 py-1.5 text-xs text-rd-muted hover:border-rd-muted
                        hover:text-rd-text transition-colors"
                    >
                        <FolderOpen size={12} />
                        Load
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        title="Save preset"
                        className="flex items-center gap-1.5 rounded border border-rd-accent/40
                        bg-rd-accent/10 px-3 py-1.5 text-xs text-rd-accent hover:bg-rd-accent/20
                        transition-colors disabled:opacity-50"
                    >
                        <Save size={12} />
                        {isSaving ? "Saving…" : "Save"}
                    </button>
                </div>
            </div>

            {/* body */}
            <div className="relative flex flex-1 overflow-hidden">

                {/* scrollable card grid */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* save path bar */}
                    <div className="mb-5 flex items-center gap-2 rounded border border-rd-border
                        bg-rd-surface px-4 py-2.5"
                    >
                        <Save size={11} className="shrink-0 text-rd-subtle" />
                        <p className="flex-1 truncate text-xs text-rd-subtle font-mono">
                            {savePath || "No save path set"}
                        </p>
                        <button
                            onClick={handleSaveAs}
                            className="shrink-0 text-xs text-rd-muted hover:text-rd-text transition-colors"
                            >
                            Change
                        </button>
                    </div>

                    {/* connection warning */}
                    {connection !== "CONNECTED" && (
                        <div className="mb-5 flex items-center gap-2 rounded border border-rd-warning/30
                        bg-rd-warning/10 px-4 py-2.5">
                            <AlertCircle size={13} className="text-rd-warning shrink-0" />
                            <p className="text-xs text-rd-warning">
                                Not connected to LMU. Overlay data will be unavailable until connected!
                            </p>
                        </div>
                    )}

                    {/* overlay cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {OVERLAY_META.map((meta) => {
                            const cfg = overlays.find((o) => o.id === meta.id);
                            if (!cfg) return null;
                            return (
                                <OverlayCard
                                key={meta.id}
                                cfg={cfg}
                                meta={meta}
                                isSettingsOpen={openSettings === meta.id}
                                onToggleEnabled={() => void handleToggleEnabled(meta.id)}
                                onToggleDrag={() => void handleToggleDrag(meta.id)}
                                onOpenSettings={() =>
                                    setOpenSettings((prev) =>
                                    prev === meta.id ? null : meta.id
                                    )
                                }
                                />
                            );
                        })}
                    </div>
                </div>

                {/* settings drawer */}
                <AnimatePresence>
                    {openSettings && openSettingsMeta && openSettingsCfg && (
                        <SettingsDrawer
                            cfg={openSettingsCfg}
                            meta={openSettingsMeta}
                            displays={displays}
                            onClose={() => setOpenSettings(null)}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* toast stack */}
            <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            className={cls(
                                "flex items-center gap-2 rounded-lg border px-4 py-2.5 shadow-xl",
                                "text-xs font-medium",
                                t.type === "success"
                                    ? "border-rd-success/30 bg-rd-surface text-rd-success"
                                    : "border-rd-error/30 bg-rd-surface text-rd-error"
                            )}
                            >
                            {t.type === "success" ? (
                                <CheckCircle2 size={13} />
                            ) : (
                                <AlertCircle size={13} />
                            )}
                            {t.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OverlayControl;

// productivity final boss