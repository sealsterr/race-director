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
    OverlaySpecificSettings,
    TowerSettings,
    TowerRaceMode,
    TowerQualiMode,
    TowerViewLayout,
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
        label: "Live Standings",
        description: "",
        icon: LayoutList,
        defaultSize: { w: 340, h: 600 },
    },
    {
        id: "OVERLAY-DRIVER",
        label: "Driver Card",
        description: "Driver information",
        icon: User,
        defaultSize: { w: 540, h: 120 },
    },
    {
        id: "OVERLAY-GAP",
        label: "Gap",
        description: "Close battle graphic",
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
        label: "Pits",
        description: "Number of pits",
        icon: ParkingSquare,
        defaultSize: { w: 300, h: 500 },
    },
    {
        id: "OVERLAY-SECTOR",
        label: "Sectors",
        description: "Sector information",
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

function pushToast(
    setToasts: React.Dispatch<React.SetStateAction<Toast[]>>,
    type: Toast["type"],
    message: string,
): void {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3500);
}

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
    <div className="flex items-center justify-between gap-3 min-h-[32px]">
        <span className="text-xs text-rd-muted">{label}</span>
        <button
            onClick={() => onChange(!value)}
            className={cls(
                "relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none",
                value ? "bg-rd-accent" : "bg-rd-border"
            )}
            style={{ minWidth: "44px" }}  // click-safe
            type="button"
            aria-pressed={value}
        >
            {/* track */}
            {/* thumb */}
            <span
                className={cls(
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
                    value ? "translate-x-5" : "translate-x-1"
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

// -- color picker --
interface ColorPickerProps {
    readonly label: string;
    readonly value: string;
    readonly onChange: (v: string) => void;
}

const ColorPicker = ({ label, value, onChange }: ColorPickerProps): React.ReactElement => (
    <div className="flex items-center justify-between gap-3 min-h-[32px]">
        <span className="text-xs text-rd-muted">{label}</span>
        <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-rd-subtle">{value.toUpperCase()}</span>
            <label className="relative h-6 w-6 cursor-pointer overflow-hidden rounded border border-rd-border">
                <span className="sr-only">{label}</span>
                <span
                    className="absolute inset-0 rounded"
                    style={{ background: value }}
                />
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
            </label>
        </div>
    </div>
);

// -- section heading inside a settings panel --
const PanelSection = ({ title }: { readonly title: string }): React.ReactElement => (
    <p className="pt-1 text-[10px] font-bold uppercase tracking-widest text-rd-subtle border-t border-rd-border/60">
        {title}
    </p>
);

const TowerSettingsPanel = ({
    cfg,
}: {
    readonly cfg: OverlayConfig;
}): React.ReactElement => {
    const { setOverlaySettings } = useOverlayStore();
    const s = cfg.settings as TowerSettings;
    const set = (partial: Partial<TowerSettings>): void =>
        setOverlaySettings(cfg.id, partial);

    return (
        <div className="flex flex-col gap-3">
            {/* layout */}
            <PanelSection title="Layout" />
            <Select
                label="View layout"
                value={s.viewLayout}
                options={[
                    { label: "Per class",  value: "PER_CLASS"  },
                    { label: "Mixed top",  value: "MIXED_TOP"  },
                ]}
                onChange={(v) => set({ viewLayout: v as TowerViewLayout })}
            />
            <Slider
                label="Max rows per class"
                value={s.maxRowsPerClass}
                min={3}
                max={20}
                step={1}
                onChange={(v) => set({ maxRowsPerClass: v })}
            />
            <Toggle
                label="Show car number"
                value={s.showCarNumber}
                onChange={(v) => set({ showCarNumber: v })}
            />
            <Toggle
                label="Show class bar"
                value={s.showClassBar}
                onChange={(v) => set({ showClassBar: v })}
            />
            <Select
                label="Animation speed"
                value={s.animationSpeed}
                options={[
                    { label: "Slow",   value: "slow"   },
                    { label: "Normal", value: "normal" },
                    { label: "Fast",   value: "fast"   },
                ]}
                onChange={(v) =>
                    set({ animationSpeed: v as TowerSettings["animationSpeed"] })
                }
            />

            {/* fight detection */}
            <PanelSection title="Fight detection" />
            <Slider
                label="Fight threshold"
                value={s.fightThresholdSeconds}
                min={0.2}
                max={5}
                step={0.1}
                unit="s"
                onChange={(v) => set({ fightThresholdSeconds: v })}
            />

            {/* class colors */}
            <PanelSection title="Class colors" />
            <ColorPicker label="Hypercar" value={s.colorHypercar} onChange={(v) => set({ colorHypercar: v })} />
            <ColorPicker label="LMP2"     value={s.colorLMP2}     onChange={(v) => set({ colorLMP2: v })}     />
            <ColorPicker label="LMP3"     value={s.colorLMP3}     onChange={(v) => set({ colorLMP3: v })}     />
            <ColorPicker label="LMGT3"    value={s.colorLMGT3}    onChange={(v) => set({ colorLMGT3: v })}    />
            <ColorPicker label="GTE"      value={s.colorGTE}      onChange={(v) => set({ colorGTE: v })}      />

            {/* tyre colors */}
            <PanelSection title="Tyre colors" />
            <ColorPicker label="Hard"   value={s.colorHard}   onChange={(v) => set({ colorHard: v })}   />
            <ColorPicker label="Medium" value={s.colorMedium} onChange={(v) => set({ colorMedium: v })} />
            <ColorPicker label="Soft"   value={s.colorSoft}   onChange={(v) => set({ colorSoft: v })}   />
            <ColorPicker label="Wet"    value={s.colorWet}    onChange={(v) => set({ colorWet: v })}    />

            {/* status colors */}
            <PanelSection title="Status colors" />
            <ColorPicker
                label="Pit badge"
                value={s.colorPitBadge}
                onChange={(v) => set({ colorPitBadge: v })}
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
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onClick(e: MouseEvent) {
            const target = e.target;
            if (
                target instanceof Element &&
                target.closest("[data-overlay-settings-toggle='true']")
            ) {
                return;
            }

            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [onClose]);

    return (
        <motion.div
            ref={drawerRef}
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
                <div className="flex h-8 w-8 items-center justify-center rounded bg-rd-border/40 text-rd-muted">
                    <Icon size={15} className="text-rd-muted" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-rd-text">{meta.label}</p>
                    <p className="text-xs text-rd-subtle">Settings</p>
                </div>
                <button
                    onClick={onClose}
                    className="ml-auto rounded-full p-2 hover:bg-rd-error/10 transition-colors"
                    title="Close settings"
                >
                    <X size={22} className="text-rd-error" />
                </button>
            </div>

            {/* scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">
                {/* general */}
                <section>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rd-text">
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
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rd-text">
                        Position
                    </p>
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-rd-muted">X</span>
                                <div className="relative flex items-center flex-1">
                                    <input
                                        type="number"
                                        value={cfg.x}
                                        onChange={(e) =>
                                            setOverlayConfig(cfg.id, { x: Number(e.target.value) })
                                        }
                                        
                                        className="no-spin w-full rounded border border-rd-border bg-rd-bg px-2 py-1 text-xs text-rd-text 
                                        focus:border-rd-accent focus:outline-none pr-7 remove-number-spin"
                                    />
                                    {typeof cfg.x === "number" && !Number.isNaN(cfg.x) && (
                                        <span className="absolute right-2 text-xs text-rd-muted select-none pointer-events-none">
                                            px
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-rd-muted">Y</span>
                                <div className="relative flex items-center flex-1">
                                    <input
                                        type="number"
                                        value={cfg.y}
                                        onChange={(e) =>
                                            setOverlayConfig(cfg.id, { y: Number(e.target.value) })
                                        }
                                        className="no-spin w-full rounded border border-rd-border bg-rd-bg px-2 py-1 text-xs text-rd-text 
                                        focus:border-rd-accent focus:outline-none pr-7 remove-number-spin"
                                    />
                                    {typeof cfg.y === "number" && !Number.isNaN(cfg.y) && (
                                        <span className="absolute right-2 text-xs text-rd-muted select-none pointer-events-none">
                                            px
                                        </span>
                                    )}
                                </div>
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
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-rd-text">
                        Custom
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
    onSettingsChange: (id: OverlayId, settings: Partial<OverlaySpecificSettings>) => void;
}

const OverlayCard = ({
    cfg,
    meta,
    isSettingsOpen,
    onToggleEnabled,
    onToggleDrag,
    onOpenSettings,
    onSettingsChange,
}: OverlayCardProps): React.ReactElement => {
    const Icon = meta.icon;
    const session = useRaceStore((s) => s.session);
    const isQualiSession =
        session?.sessionType === "PRACTICE" ||
        session?.sessionType === "QUALIFYING";

    return (
        <motion.div
            layout
            className={cls(
                "relative flex flex-col rounded-lg border transition-colors duration-150 overflow-hidden",
                cfg.enabled
                    ? "border-rd-accent/40 bg-rd-elevated"
                    : "border-rd-border bg-rd-surface"
            )}
        >
            {/* live pulse dot */}
            {cfg.enabled && (
                <span className="absolute right-3 top-3 flex h-2 w-2 z-10">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rd-accent opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rd-accent" />
                </span>
            )}

            {/* top section: icon + name */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 pr-8">
                <div className={cls(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    cfg.enabled ? "bg-rd-accent/20 text-rd-accent" : "bg-rd-border/40 text-rd-muted"
                )}>
                    <Icon size={17} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-rd-text leading-tight">{meta.label}</p>
                    <p className="text-[11px] text-rd-subtle leading-tight">{meta.description}</p>
                </div>
            </div>

            {/* opacity bar only when live */}
            {cfg.enabled && (
                <div className="mx-4 mb-3 h-0.5 rounded-full bg-rd-border overflow-hidden">
                    <div
                        className="h-full rounded-full bg-rd-accent/60 transition-all duration-300"
                        style={{ width: `${cfg.opacity}%` }}
                    />
                </div>
            )}

            {/* divider */}
            <div className="mx-4 h-px bg-rd-border" />

            {/* action row */}
            <div className="flex items-stretch bg-rd-surface/40">
                {meta.id === "OVERLAY-TOWER" && (() => {
                    const towerCfg = cfg.settings as TowerSettings;
                    const value = isQualiSession
                        ? towerCfg.qualiMode
                        : towerCfg.raceMode;

                    return (
                        <div className="flex items-center px-3 py-2 bg-rd-surface/50">
                            <select
                                value={value}
                                onChange={(e) => {
                                    const nextValue = e.target.value;

                                    if (isQualiSession) {
                                        onSettingsChange("OVERLAY-TOWER", {
                                            qualiMode: nextValue as TowerQualiMode,
                                        });
                                    } else {
                                        onSettingsChange("OVERLAY-TOWER", {
                                            raceMode: nextValue as TowerRaceMode,
                                        });
                                    }

                                    e.currentTarget.blur();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 min-w-[138px] rounded-md border border-rd-border bg-rd-elevated px-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-rd-text outline-none transition-colors hover:border-rd-muted hover:bg-rd-surface focus:border-rd-accent cursor-pointer"
                                title="Data mode"
                            >
                                {isQualiSession ? (
                                    <>
                                        <option value="QUALI_GAP">Q GAP</option>
                                        <option value="QUALI_TIMES">Q TIME</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="GAP_AHEAD">INT</option>
                                        <option value="GAP_LEADER">LEAD</option>
                                        <option value="PITS">PITS</option>
                                        <option value="FUEL">FUEL</option>
                                        <option value="TYRES">TYRES</option>
                                        <option value="POSITIONS">GAIN</option>
                                    </>
                                )}
                            </select>
                        </div>
                    );
                })()}

                {/* on/off */}
                <button
                    onClick={onToggleEnabled}
                    className={cls(
                        "flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold",
                        "uppercase tracking-wider transition-colors duration-150",
                        cfg.enabled
                            ? "bg-rd-accent/10 text-rd-accent hover:bg-rd-accent/20"
                            : "text-rd-subtle hover:bg-rd-elevated hover:text-rd-text"
                    )}
                >
                    {cfg.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                    {cfg.enabled ? "Live" : "Off"}
                </button>

                {/* separator */}
                <div className="w-px bg-rd-border/80" />

                {/* drag */}
                <button
                    onClick={onToggleDrag}
                    title={cfg.dragMode ? "Drag mode ON" : "Enable dragging"}
                    className={cls(
                        "flex items-center justify-center gap-1.5 px-4 py-3 text-[11px] font-medium",
                        "transition-colors duration-150",
                        cfg.dragMode
                            ? "bg-rd-gold/15 text-rd-gold hover:bg-rd-gold/25"
                            : "text-rd-subtle hover:bg-rd-elevated hover:text-rd-text"
                    )}
                >
                    <Move size={13} />
                    <span className="hidden sm:inline">Drag</span>
                </button>

                {/* separator */}
                <div className="w-px bg-rd-border/80" />

                {/* settings */}
                <button
                    onClick={onOpenSettings}
                    data-overlay-settings-toggle="true"
                    title="Overlay settings"
                    className={cls(
                        "flex items-center justify-center gap-1.5 px-4 py-3 text-[11px] font-medium",
                        "transition-colors duration-150",
                        isSettingsOpen
                            ? "bg-rd-accent/15 text-rd-accent"
                            : "text-rd-subtle hover:bg-rd-elevated hover:text-rd-text"
                    )}
                >
                    <Settings2 size={13} />
                    <span className="hidden sm:inline">Edit</span>
                </button>
            </div>
        </motion.div>
    );
};

// -- main component --
const OverlayControl = (): React.ReactElement => {
    const { overlays, savePath, setOverlayConfig, setOverlaySettings, setSavePath, loadFromPreset } =
        useOverlayStore();
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
            if (!r.ok) pushToast(setToasts, "error", `Auto-save failed: ${r.error}`);
        };

        saveTimer.current = setTimeout(() => {
            void runAutoSave();
        }, 1500);

        return () => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
        };
    }, [overlays, savePath]);

    

    // -- save / load --
    const handleSave = async (): Promise<void> => {
        setIsSaving(true);
        const r = await globalThis.api.overlay.savePreset(overlays, savePath);
        setIsSaving(false);
        if (r.ok) pushToast(setToasts, "success", "Preset saved!");
        else pushToast(setToasts, "error", `Save failed: ${r.error}`);
    };

    const handleSaveAs = async (): Promise<void> => {
        const pick = await globalThis.api.overlay.pickSavePath();
        if (!pick.ok || !pick.path) return;
        setSavePath(pick.path);
        const r = await globalThis.api.overlay.savePreset(overlays, pick.path);
        if (r.ok) pushToast(setToasts, "success", "Preset saved to new location!");
        else pushToast(setToasts, "error", `Save failed: ${r.error}`);
    };

    const handleLoad = async (): Promise<void> => {
        const pick = await globalThis.api.overlay.pickLoadPath();
        if (!pick.ok || !pick.path) return;
        const r = await globalThis.api.overlay.loadPreset(pick.path);
        if (r.ok && r.data) {
            loadFromPreset(r.data.overlays, pick.path);
            pushToast(setToasts, "success", "Preset loaded!");
        } else {
            pushToast(setToasts, "error", `Load failed: ${r.error}`);
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
                className="flex h-12 shrink-0 items-center gap-4 border-b border-rd-border bg-rd-surface px-4"
                style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
            >
                <div className="flex items-center gap-2 shrink-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-rd-accent">
                        Overlay Control
                    </p>
                </div>

                <div className="h-4 w-px bg-rd-border shrink-0" />

                {/* mode switcher */}
                <div
                    className="flex items-center gap-1 rounded-lg border border-rd-border bg-rd-bg p-1"
                    style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
                >
                    <button className="rounded px-3 py-1 text-xs font-semibold bg-rd-elevated text-rd-text transition-colors">
                        Manual
                    </button>
                    <div className="relative">
                        <button
                            disabled
                            className="rounded px-3 py-1 text-xs font-semibold text-rd-subtle opacity-50 cursor-not-allowed"
                        >
                            Automatic
                        </button>
                        <span className="absolute -top-2 -right-1 rounded px-1 text-[8px] font-bold uppercase tracking-wide bg-rd-logo-primary/20 text-rd-logo-primary leading-4">
                            Coming Soon
                        </span>
                    </div>
                </div>
            </div>

            {/* connection warning always at top of body when not connected */}
            {connection !== "CONNECTED" && (
                <div className="flex shrink-0 items-center gap-2 border-b border-rd-warning/20 bg-rd-warning/10 px-4 py-2">
                    <AlertCircle size={25} className="text-rd-warning shrink-0" />
                    <p className="text-s text-rd-warning">
                        Not connected to Le Mans Ultimate
                    </p>
                </div>
            )}

            {/* body */}
            <div className="relative flex flex-1 overflow-hidden">

                {/* scrollable content */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

                    {/* preset manager */}
                    <div className="rounded-lg border border-rd-border bg-rd-surface p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xl font-semibold uppercase tracking-widest text-rd-accent">
                                Preset
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLoad}
                                    className="flex items-center gap-1.5 rounded border border-rd-border bg-rd-elevated
                                        px-3 py-1.5 text-xs text-rd-muted hover:border-rd-muted hover:text-rd-text transition-colors"
                                >
                                    <FolderOpen size={15} />
                                    Load
                                </button>
                                <button
                                    onClick={handleSaveAs}
                                    className="flex items-center gap-1.5 rounded border border-rd-border bg-rd-elevated
                                        px-3 py-1.5 text-xs text-rd-muted hover:border-rd-muted hover:text-rd-text transition-colors"
                                >
                                    <Save size={15} />
                                    Save As
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-1.5 rounded border border-rd-accent/40
                                        bg-rd-accent/10 px-3 py-1.5 text-xs text-rd-accent hover:bg-rd-accent/20
                                        transition-colors disabled:opacity-50"
                                >
                                    <Save size={15} />
                                    {isSaving ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </div>
                        {/* file path */}
                        <div className="flex items-center gap-2 rounded border border-rd-border/60 bg-rd-bg px-3 py-2">
                            <Save size={15} className="shrink-0 text-rd-subtle" />
                            <p className="flex-1 truncate font-mono text-[14px] text-rd-subtle">
                                {savePath || "No save path set"}
                            </p>
                        </div>
                    </div>

                    {/* overlay cards */}
                    <div className="grid grid-cols-2 gap-3">
                        {OVERLAY_META.map((meta) => {
                            const cfg = overlays.find((o) => o.id === meta.id);
                            if (!cfg) return null;
                            return (
                                <OverlayCard
                                    key={meta.id}
                                    cfg={cfg}
                                    meta={meta}
                                    onSettingsChange={(id, settings) => setOverlaySettings(id, settings)}
                                    isSettingsOpen={openSettings === meta.id}
                                    onToggleEnabled={() => void handleToggleEnabled(meta.id)}
                                    onToggleDrag={() => void handleToggleDrag(meta.id)}
                                    onOpenSettings={() =>
                                        setOpenSettings((prev) => prev === meta.id ? null : meta.id)
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
