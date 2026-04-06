import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CustomSelect, { type CustomSelectOption } from '../../components/ui/CustomSelect'
import CustomNumberField from '../../components/ui/CustomNumberField'
import CustomColorPicker, {
  COLOR_PICKER_PORTAL_SELECTOR
} from '../../components/ui/CustomColorPicker'
import { getOverlayWindowScale } from '../../../../shared/overlayWindowSizing'
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
  Timer
} from 'lucide-react'
import { useOverlayStore } from '../../store/overlayStore'
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
  SessionSettings
} from '../../store/overlayStore'
import { useRaceStore } from '../../store/raceStore'
import type { CarClass, DriverStanding } from '../../types/lmu'
import { TOWER_DEFAULT_WIDTH, TOWER_DEFAULT_HEIGHT } from '../overlay/tower/constants'
import { getTowerBaseHeight } from '../overlay/tower/windowLayout'

// * -- overlay metadata --
interface OverlayMeta {
  id: OverlayId
  label: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  defaultSize: { w: number; h: number }
}

const OVERLAY_META: OverlayMeta[] = [
  {
    id: 'OVERLAY-TOWER',
    label: 'Live Standings',
    description: '',
    icon: LayoutList,
    defaultSize: { w: TOWER_DEFAULT_WIDTH, h: TOWER_DEFAULT_HEIGHT }
  },
  {
    id: 'OVERLAY-DRIVER',
    label: 'Driver Card',
    description: '',
    icon: User,
    defaultSize: { w: 896, h: 286 }
  },
  {
    id: 'OVERLAY-GAP',
    label: 'Gap',
    description: '',
    icon: Gauge,
    defaultSize: { w: 1904, h: 316 }
  },
  {
    id: 'OVERLAY-SESSION',
    label: 'Session Info',
    description: '',
    icon: Timer,
    defaultSize: { w: 1120, h: 430 }
  }
]

type TowerSelectableClass = Exclude<CarClass, 'UNKNOWN'>

const TOWER_CLASS_ORDER: TowerSelectableClass[] = ['HYPERCAR', 'LMP2', 'LMP3', 'LMGT3', 'GTE']

const TOWER_CLASS_LABELS: Record<TowerSelectableClass, string> = {
  HYPERCAR: 'Hypercar',
  LMP2: 'LMP2',
  LMP3: 'LMP3',
  LMGT3: 'LMGT3',
  GTE: 'GTE'
}

function getAvailableTowerClasses(classes: CarClass[]): TowerSelectableClass[] {
  const present = new Set(
    classes.filter((carClass): carClass is TowerSelectableClass => carClass !== 'UNKNOWN')
  )
  return TOWER_CLASS_ORDER.filter((carClass) => present.has(carClass))
}

function isTowerSelectableClass(value: CarClass | null | undefined): value is TowerSelectableClass {
  return value !== undefined && value !== null && value !== 'UNKNOWN'
}

function getTargetDisplay(cfg: OverlayConfig, displays: DisplayInfo[]): DisplayInfo | null {
  if (displays.length === 0) return null
  return (
    displays.find((display) => display.id === cfg.displayId) ??
    displays.find((display) => display.isPrimary) ??
    displays[0] ??
    null
  )
}

function getOverlayWindowBounds(
  cfg: OverlayConfig,
  meta: OverlayMeta,
  displays: DisplayInfo[],
  standings: DriverStanding[] = []
): { x: number; y: number; width: number; height: number } | null {
  const display = getTargetDisplay(cfg, displays)
  if (!display) return null

  const defaultHeight =
    cfg.id === 'OVERLAY-TOWER'
      ? Math.max(meta.defaultSize.h, getTowerBaseHeight(standings, cfg.settings as TowerSettings))
      : meta.defaultSize.h
  const overlayWindowScale = getOverlayWindowScale(cfg.id)

  const width = Math.max(1, Math.round(meta.defaultSize.w * cfg.scale * overlayWindowScale))
  const height = Math.max(1, Math.round(defaultHeight * cfg.scale * overlayWindowScale))

  return {
    x: Math.round(display.bounds.x + cfg.x),
    y: Math.round(display.bounds.y + cfg.y),
    width,
    height
  }
}

async function applyOverlayWindowState(
  cfg: OverlayConfig,
  meta: OverlayMeta,
  displays: DisplayInfo[],
  standings: DriverStanding[]
): Promise<void> {
  if (!cfg.enabled) {
    await globalThis.api.windows.close(cfg.id)
    return
  }

  await globalThis.api.windows.open(cfg.id)

  const bounds = getOverlayWindowBounds(cfg, meta, displays, standings)
  if (bounds) {
    const resolvedBounds = await globalThis.api.overlay.updateBounds(
      cfg.id,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height
    )
    syncRuntimePositionFromBounds(cfg.id, resolvedBounds, displays)
  }

  await globalThis.api.overlay.setDragMode(cfg.id, cfg.dragMode)
  await globalThis.api.overlay.broadcastConfig(cfg)
}

async function syncOverlayWindowBounds(
  cfg: OverlayConfig,
  meta: OverlayMeta,
  displays: DisplayInfo[],
  standings: DriverStanding[]
): Promise<void> {
  const bounds = getOverlayWindowBounds(cfg, meta, displays, standings)
  if (!bounds) return
  const currentBounds = await globalThis.api.overlay.getBounds(cfg.id)

  if (cfg.id === 'OVERLAY-TOWER' && cfg.dragMode) {
    return
  }

  if (cfg.dragMode) {
    if (!currentBounds) return
    if (currentBounds.width === bounds.width && currentBounds.height === bounds.height) {
      return
    }

    const resolvedBounds = await globalThis.api.overlay.updateBounds(
      cfg.id,
      currentBounds.x,
      currentBounds.y,
      bounds.width,
      bounds.height
    )
    syncRuntimePositionFromBounds(cfg.id, resolvedBounds, displays)
    return
  }

  if (
    currentBounds &&
    currentBounds.x === bounds.x &&
    currentBounds.y === bounds.y &&
    currentBounds.width === bounds.width &&
    currentBounds.height === bounds.height
  ) {
    return
  }

  const resolvedBounds = await globalThis.api.overlay.updateBounds(
    cfg.id,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height
  )
  syncRuntimePositionFromBounds(cfg.id, resolvedBounds, displays)
}

function getOverlayPositionFromBounds(
  bounds: { x: number; y: number; width: number; height: number },
  displays: DisplayInfo[]
): Pick<OverlayConfig, 'x' | 'y' | 'displayId'> | null {
  if (displays.length === 0) return null

  const centerX = bounds.x + bounds.width / 2
  const centerY = bounds.y + bounds.height / 2

  const targetDisplay =
    displays.find(
      (display) =>
        centerX >= display.bounds.x &&
        centerX <= display.bounds.x + display.bounds.width &&
        centerY >= display.bounds.y &&
        centerY <= display.bounds.y + display.bounds.height
    ) ??
    displays.reduce((closest, display) => {
      const displayCenterX = display.bounds.x + display.bounds.width / 2
      const displayCenterY = display.bounds.y + display.bounds.height / 2
      const closestCenterX = closest.bounds.x + closest.bounds.width / 2
      const closestCenterY = closest.bounds.y + closest.bounds.height / 2
      const currentDistance = (centerX - displayCenterX) ** 2 + (centerY - displayCenterY) ** 2
      const closestDistance = (centerX - closestCenterX) ** 2 + (centerY - closestCenterY) ** 2
      return currentDistance < closestDistance ? display : closest
    }, displays[0])

  return {
    x: Math.round(bounds.x - targetDisplay.bounds.x),
    y: Math.round(bounds.y - targetDisplay.bounds.y),
    displayId: targetDisplay.id
  }
}

function syncRuntimePositionFromBounds(
  id: OverlayId,
  bounds: { x: number; y: number; width: number; height: number } | null,
  displays: DisplayInfo[]
): void {
  if (!bounds) return

  const nextPosition = getOverlayPositionFromBounds(bounds, displays)
  if (!nextPosition) return

  const current = useOverlayStore.getState().getOverlay(id)
  if (
    current &&
    current.x === nextPosition.x &&
    current.y === nextPosition.y &&
    current.displayId === nextPosition.displayId
  ) {
    return
  }

  useOverlayStore.getState().setOverlayRuntimePosition(id, nextPosition)
}

// * -- helpers --
const cls = (...classes: (string | false | undefined | null)[]): string =>
  classes.filter(Boolean).join(' ')

// * -- toast --
interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

let toastCounter = 0

function pushToast(
  setToasts: React.Dispatch<React.SetStateAction<Toast[]>>,
  type: Toast['type'],
  message: string
): void {
  const id = ++toastCounter
  setToasts((prev) => [...prev, { id, type, message }])
  setTimeout(() => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }, 3500)
}

// * -- slider --
interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}

const Slider = ({
  label,
  value,
  min,
  max,
  step,
  unit = '',
  onChange
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
)

// * -- toggle --
interface ToggleProps {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}

const Toggle = ({ label, value, onChange }: ToggleProps): React.ReactElement => (
  <div className="flex items-center justify-between gap-3 min-h-[32px]">
    <span className="text-xs text-rd-muted">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={cls(
        'relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none',
        value ? 'bg-rd-accent' : 'bg-rd-border'
      )}
      style={{ minWidth: '44px' }} // click-safe
      type="button"
      aria-pressed={value}
    >
      {/* track */}
      {/* thumb */}
      <span
        className={cls(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
          value ? 'translate-x-5' : 'translate-x-1'
        )}
      />
    </button>
  </div>
)

// * -- select --
interface SelectProps {
  label: string
  value: string
  options: CustomSelectOption[]
  onChange: (v: string) => void
}

const Select = ({ label, value, options, onChange }: SelectProps): React.ReactElement => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-xs text-rd-muted">{label}</span>
    <CustomSelect
      value={value}
      options={options}
      onChange={onChange}
      buttonClassName="h-8 rounded border border-rd-border bg-rd-bg px-2 py-1 text-xs text-rd-text focus:border-rd-accent"
      optionClassName="text-xs"
    />
  </div>
)

// * -- color picker --
interface ColorPickerProps {
  readonly label: string
  readonly value: string
  readonly onChange: (v: string) => void
}

const ColorPicker = ({ label, value, onChange }: ColorPickerProps): React.ReactElement => (
  <div className="flex min-h-[32px] items-center justify-between gap-3">
    <span className="text-xs text-rd-muted">{label}</span>
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs text-rd-subtle">{value.toUpperCase()}</span>
      <CustomColorPicker
        ariaLabel={label}
        title={label}
        value={value}
        onChange={onChange}
        stopPropagation
      />
    </div>
  </div>
)

// * -- section heading inside a settings panel --
const PanelSection = ({ title }: { readonly title: string }): React.ReactElement => (
  <p className="pt-1 text-[10px] font-bold uppercase tracking-widest text-rd-subtle border-t border-rd-border/60">
    {title}
  </p>
)

const TowerSettingsPanel = ({ cfg }: { readonly cfg: OverlayConfig }): React.ReactElement => {
  const { setOverlaySettings } = useOverlayStore()
  const s = cfg.settings as TowerSettings
  const set = (partial: Partial<TowerSettings>): void => setOverlaySettings(cfg.id, partial)

  return (
    <div className="flex flex-col gap-3">
      {/* layout */}
      <PanelSection title="Layout" />
      <Slider
        label="Standings refresh"
        value={s.standingsRefreshMs}
        min={250}
        max={5000}
        step={50}
        unit="ms"
        onChange={(v) => set({ standingsRefreshMs: v })}
      />
      {s.viewLayout === 'MIXED_TOP' && (
        <Slider
          label="Top rows per class"
          value={s.maxRowsPerClass}
          min={3}
          max={20}
          step={1}
          onChange={(v) => set({ maxRowsPerClass: v })}
        />
      )}
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
          { label: 'Slow', value: 'slow' },
          { label: 'Normal', value: 'normal' },
          { label: 'Fast', value: 'fast' }
        ]}
        onChange={(v) => set({ animationSpeed: v as TowerSettings['animationSpeed'] })}
      />

      {/* fight detection */}
      <PanelSection title="Fight detection" />
      <Toggle
        label="Enable fight detection"
        value={s.fightEnabled}
        onChange={(v) => set({ fightEnabled: v })}
      />
      <Toggle
        label="Only on INT mode"
        value={s.fightOnlyInIntervalMode}
        onChange={(v) => set({ fightOnlyInIntervalMode: v })}
      />
      <Slider
        label="Fight threshold"
        value={s.fightThresholdSeconds}
        min={0.05}
        max={1}
        step={0.01}
        unit="s"
        onChange={(v) => set({ fightThresholdSeconds: v })}
      />
      <Slider
        label="Hold time"
        value={s.fightHoldSeconds}
        min={0}
        max={10}
        step={0.5}
        unit="s"
        onChange={(v) => set({ fightHoldSeconds: v })}
      />
      <Slider
        label="Disable for opening laps"
        value={s.fightDisabledLaps}
        min={0}
        max={10}
        step={1}
        onChange={(v) => set({ fightDisabledLaps: v })}
      />
      <Toggle
        label="Same lap only"
        value={s.fightRequireSameLap}
        onChange={(v) => set({ fightRequireSameLap: v })}
      />
      <Toggle
        label="Ignore pit/finish"
        value={s.fightIgnorePitAndFinished}
        onChange={(v) => set({ fightIgnorePitAndFinished: v })}
      />

      {/* class colors */}
      <PanelSection title="Class colors" />
      <ColorPicker
        label="Hypercar"
        value={s.colorHypercar}
        onChange={(v) => set({ colorHypercar: v })}
      />
      <ColorPicker label="LMP2" value={s.colorLMP2} onChange={(v) => set({ colorLMP2: v })} />
      <ColorPicker label="LMP3" value={s.colorLMP3} onChange={(v) => set({ colorLMP3: v })} />
      <ColorPicker label="LMGT3" value={s.colorLMGT3} onChange={(v) => set({ colorLMGT3: v })} />
      <ColorPicker label="GTE" value={s.colorGTE} onChange={(v) => set({ colorGTE: v })} />

      {/* tyre colors */}
      <PanelSection title="Tyre colors" />
      <ColorPicker label="Hard" value={s.colorHard} onChange={(v) => set({ colorHard: v })} />
      <ColorPicker label="Medium" value={s.colorMedium} onChange={(v) => set({ colorMedium: v })} />
      <ColorPicker label="Soft" value={s.colorSoft} onChange={(v) => set({ colorSoft: v })} />
      <ColorPicker label="Wet" value={s.colorWet} onChange={(v) => set({ colorWet: v })} />

      {/* status colors */}
      <PanelSection title="Status colors" />
      <ColorPicker
        label="Pit badge"
        value={s.colorPitBadge}
        onChange={(v) => set({ colorPitBadge: v })}
      />
      <ColorPicker
        label="Finish badge"
        value={s.colorFinishBadge}
        onChange={(v) => set({ colorFinishBadge: v })}
      />
    </div>
  )
}

const DriverSettingsPanel = ({ cfg }: { cfg: OverlayConfig }): React.ReactElement => {
  const { setOverlaySettings } = useOverlayStore()
  const s = cfg.settings as DriverSettings
  const set = (partial: Partial<DriverSettings>): void => setOverlaySettings(cfg.id, partial)

  return (
    <div className="flex flex-col gap-3">
      <PanelSection title="Parts" />
      <Toggle
        label="Left Part"
        value={s.showPart1}
        onChange={(v) => set({ showPart1: v })}
      />
      <Toggle
        label="Center Part"
        value={s.showPart2}
        onChange={(v) => set({ showPart2: v })}
      />
      <Toggle
        label="Right Part"
        value={s.showPart3}
        onChange={(v) => set({ showPart3: v })}
      />

      <PanelSection title="Sector colors" />
      <ColorPicker
        label="Session best"
        value={s.colorSessionBest}
        onChange={(v) => set({ colorSessionBest: v })}
      />
      <ColorPicker
        label="Personal best"
        value={s.colorPersonalBest}
        onChange={(v) => set({ colorPersonalBest: v })}
      />
      <ColorPicker
        label="Slower"
        value={s.colorCompleted}
        onChange={(v) => set({ colorCompleted: v })}
      />
      <ColorPicker
        label="Pending"
        value={s.colorPending}
        onChange={(v) => set({ colorPending: v })}
      />
    </div>
  )
}

const GapSettingsPanel = ({ cfg }: { cfg: OverlayConfig }): React.ReactElement => {
  const { setOverlaySettings } = useOverlayStore()
  const s = cfg.settings as GapSettings
  const set = (partial: Partial<GapSettings>): void => setOverlaySettings(cfg.id, partial)

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
  )
}

const SessionSettingsPanel = ({ cfg }: { cfg: OverlayConfig }): React.ReactElement => {
  const { setOverlaySettings } = useOverlayStore()
  const s = cfg.settings as SessionSettings
  const set = (partial: Partial<SessionSettings>): void => setOverlaySettings(cfg.id, partial)

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Color scheme"
        value={s.colorScheme}
        options={[
          { label: 'Default', value: 'default' },
          { label: 'Minimal', value: 'minimal' },
          { label: 'Bold', value: 'bold' }
        ]}
        onChange={(v) => set({ colorScheme: v as SessionSettings['colorScheme'] })}
      />
      <Toggle
        label="Show track name"
        value={s.showTrackName}
        onChange={(v) => set({ showTrackName: v })}
      />
      <Toggle
        label="Show session type"
        value={s.showSessionType}
        onChange={(v) => set({ showSessionType: v })}
      />
      <Toggle
        label="Show time remaining"
        value={s.showTimeRemaining}
        onChange={(v) => set({ showTimeRemaining: v })}
      />
      <Toggle
        label="Show lap count"
        value={s.showLapCount}
        onChange={(v) => set({ showLapCount: v })}
      />
    </div>
  )
}

const SPECIFIC_PANELS: Record<OverlayId, (props: { cfg: OverlayConfig }) => React.ReactElement> = {
  'OVERLAY-TOWER': TowerSettingsPanel,
  'OVERLAY-DRIVER': DriverSettingsPanel,
  'OVERLAY-GAP': GapSettingsPanel,
  'OVERLAY-SESSION': SessionSettingsPanel
}

// * -- settings drawer --
interface SettingsDrawerProps {
  cfg: OverlayConfig
  meta: OverlayMeta
  displays: DisplayInfo[]
  onClose: () => void
}

interface DisplayInfo {
  id: number
  label: string
  bounds: { x: number; y: number; width: number; height: number }
  isPrimary: boolean
}

const SettingsDrawer = ({
  cfg,
  meta,
  displays,
  onClose
}: SettingsDrawerProps): React.ReactElement => {
  const { setOverlayConfig } = useOverlayStore()
  const SpecificPanel = SPECIFIC_PANELS[cfg.id]
  const Icon = meta.icon
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent): void {
      const target = e.target
      if (target instanceof Element && target.closest("[data-overlay-settings-toggle='true']")) {
        return
      }
      if (target instanceof Element && target.closest("[data-rd-select-portal='true']")) {
        return
      }
      if (target instanceof Element && target.closest(COLOR_PICKER_PORTAL_SELECTOR)) {
        return
      }

      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [onClose])

  return (
    <motion.div
      ref={drawerRef}
      key="drawer"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute inset-y-0 right-0 z-30 flex w-80 flex-col
                border-l border-rd-border bg-rd-surface shadow-2xl"
    >
      {/* header */}
      <div className="flex items-center gap-3 border-b border-rd-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-rd-border/40 text-rd-muted">
          <Icon size={15} className="text-rd-muted" />
        </div>
        <div className="flex min-w-0 flex-1 items-center">
          <p className="text-sm font-semibold text-rd-text">{meta.label}</p>
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
            <div className="flex items-center justify-evenly gap-6 px-1">
              <div className="flex flex-1 justify-center">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs text-rd-muted">X</span>
                  <CustomNumberField
                    value={cfg.x}
                    allowNegative
                    suffix="px"
                    containerClassName="shrink-0"
                    onChange={(nextValue) => {
                      const parsed = Number(nextValue)
                      if (!Number.isFinite(parsed)) return
                      setOverlayConfig(cfg.id, { x: parsed })
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-1 justify-center">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs text-rd-muted">Y</span>
                  <CustomNumberField
                    value={cfg.y}
                    allowNegative
                    suffix="px"
                    containerClassName="shrink-0"
                    onChange={(nextValue) => {
                      const parsed = Number(nextValue)
                      if (!Number.isFinite(parsed)) return
                      setOverlayConfig(cfg.id, { y: parsed })
                    }}
                  />
                </div>
              </div>
            </div>

            {displays.length > 1 && (
              <Select
                label="Display"
                value={String(cfg.displayId)}
                options={displays.map((d) => ({
                  label: d.label,
                  value: String(d.id)
                }))}
                onChange={(v) => setOverlayConfig(cfg.id, { displayId: Number(v) })}
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
  )
}

// * -- overlay card --
interface OverlayCardProps {
  cfg: OverlayConfig
  meta: OverlayMeta
  isSettingsOpen: boolean
  onToggleEnabled: () => void
  onToggleDrag: () => void
  onOpenSettings: () => void
  onSettingsChange: (id: OverlayId, settings: Partial<OverlaySpecificSettings>) => void
}

const OverlayCard = ({
  cfg,
  meta,
  isSettingsOpen,
  onToggleEnabled,
  onToggleDrag,
  onOpenSettings,
  onSettingsChange
}: OverlayCardProps): React.ReactElement => {
  const Icon = meta.icon
  const session = useRaceStore((s) => s.session)
  const standings = useRaceStore((s) => s.standings)
  const isQualiSession =
    session?.sessionType === 'PRACTICE' || session?.sessionType === 'QUALIFYING'
  const availableTowerClasses = getAvailableTowerClasses(
    standings.map((standing) => standing.carClass)
  )
  const isTowerCard = meta.id === 'OVERLAY-TOWER'
  const isDriverCard = meta.id === 'OVERLAY-DRIVER'
  const towerCfg = isTowerCard ? (cfg.settings as TowerSettings) : null
  const driverCfg = isDriverCard ? (cfg.settings as DriverSettings) : null
  const normalizedViewLayout =
    towerCfg?.viewLayout === 'PER_CLASS' || towerCfg?.viewLayout === 'EVERYONE_TOP'
      ? 'MIXED_TOP'
      : towerCfg?.viewLayout
  const towerModeValue = towerCfg ? (isQualiSession ? towerCfg.qualiMode : towerCfg.raceMode) : null
  const selectedTowerClass =
    towerCfg &&
    isTowerSelectableClass(towerCfg.specificClass) &&
    availableTowerClasses.includes(towerCfg.specificClass)
      ? towerCfg.specificClass
      : (availableTowerClasses[0] ?? null)
  const towerScopeValue =
    normalizedViewLayout === 'CLASS_ONLY' && selectedTowerClass
      ? `CLASS_ONLY:${selectedTowerClass}`
      : normalizedViewLayout === 'CLASS_ONLY'
        ? 'MIXED_TOP'
        : normalizedViewLayout

  const handleTowerModeChange = (nextValue: string): void => {
    if (!towerCfg) return

    if (isQualiSession) {
      onSettingsChange('OVERLAY-TOWER', {
        qualiMode: nextValue as TowerQualiMode
      })
      return
    }

    onSettingsChange('OVERLAY-TOWER', {
      raceMode: nextValue as TowerRaceMode
    })
  }

  const handleTowerScopeChange = (nextValue: string): void => {
    if (!towerCfg) return

    if (nextValue.startsWith('CLASS_ONLY:')) {
      const nextClass = nextValue.replace('CLASS_ONLY:', '') as CarClass
      onSettingsChange('OVERLAY-TOWER', {
        viewLayout: 'CLASS_ONLY' as TowerViewLayout,
        specificClass: nextClass
      })
      return
    }

    onSettingsChange('OVERLAY-TOWER', {
      viewLayout: nextValue as TowerViewLayout,
      specificClass: towerCfg.specificClass
    })
  }

  return (
    <motion.div
      layout
      className={cls(
        'relative flex h-[106px] flex-col rounded-lg border transition-colors duration-150 overflow-hidden',
        cfg.enabled ? 'border-rd-accent/40 bg-rd-elevated' : 'border-rd-border bg-rd-surface'
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
      <div className="flex min-h-0 flex-1 items-center gap-3 px-4 py-3 pr-8">
        <div
          className={cls(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            cfg.enabled ? 'bg-rd-accent/20 text-rd-accent' : 'bg-rd-border/40 text-rd-muted'
          )}
        >
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          {isTowerCard && towerCfg ? (
            <div className="flex min-h-9 items-center gap-3 pr-2">
              <div className="shrink-0">
                <p className="text-sm font-semibold text-rd-text leading-tight">{meta.label}</p>
              </div>
              <div className="h-5 w-px shrink-0 bg-rd-border/80" />
              <div className="flex min-w-0 items-center gap-2">
                <CustomSelect
                  value={towerModeValue ?? ''}
                  options={
                    isQualiSession
                      ? [
                          { label: 'Gap', value: 'QUALI_GAP' },
                          { label: 'Time', value: 'QUALI_TIMES' }
                        ]
                      : [
                          { label: 'Int', value: 'GAP_AHEAD' },
                          { label: 'Lead', value: 'GAP_LEADER' },
                          { label: 'Pits', value: 'PITS' },
                          { label: 'Fuel', value: 'FUEL' },
                          { label: 'Tyres', value: 'TYRES' },
                          { label: 'Gain', value: 'POSITIONS' }
                        ]
                  }
                  onChange={handleTowerModeChange}
                  stopPropagation
                  title="Data mode"
                  buttonClassName="h-8 w-[118px] min-w-[118px] rounded-md border border-rd-border bg-rd-elevated px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-rd-text hover:border-rd-muted hover:bg-rd-surface"
                  optionClassName="text-[10px] font-bold uppercase tracking-[0.12em]"
                />
                <CustomSelect
                  value={towerScopeValue ?? 'MIXED_TOP'}
                  options={[
                    ...availableTowerClasses.map((carClass) => ({
                      label: TOWER_CLASS_LABELS[carClass],
                      value: `CLASS_ONLY:${carClass}`
                    })),
                    { label: 'Mixed', value: 'MIXED_TOP' }
                  ]}
                  onChange={handleTowerScopeChange}
                  stopPropagation
                  title="Display scope"
                  buttonClassName="h-8 w-[118px] min-w-[118px] rounded-md border border-rd-border bg-rd-elevated px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-rd-text hover:border-rd-muted hover:bg-rd-surface"
                  optionClassName="text-[10px] font-bold uppercase tracking-[0.12em]"
                />
              </div>
            </div>
          ) : isDriverCard && driverCfg ? (
            <div className="flex min-h-9 items-center pr-3">
              <p className="text-sm font-semibold text-rd-text leading-tight">{meta.label}</p>
            </div>
          ) : (
            <div className="flex min-h-9 flex-col justify-center">
              <p className="text-sm font-semibold text-rd-text leading-tight">{meta.label}</p>
              {meta.description ? (
                <p className="text-[11px] text-rd-subtle leading-tight">{meta.description}</p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* divider */}
      <div className="mx-4 h-px shrink-0 bg-rd-border" />

      {/* action row */}
      <div className="mt-auto flex shrink-0 items-stretch bg-rd-surface/40">
        {/* on/off */}
        <button
          onClick={onToggleEnabled}
          className={cls(
            'flex flex-1 items-center justify-center gap-2 py-3 text-xs font-bold',
            'uppercase tracking-wider transition-colors duration-150',
            cfg.enabled
              ? 'bg-rd-accent/10 text-rd-accent hover:bg-rd-accent/20'
              : 'text-rd-subtle hover:bg-rd-elevated hover:text-rd-text'
          )}
        >
          {cfg.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
          {cfg.enabled ? 'Live' : 'Off'}
        </button>

        {/* separator */}
        <div className="w-px bg-rd-border/80" />

        {/* drag */}
        <button
          onClick={onToggleDrag}
          title={cfg.dragMode ? 'Drag mode ON' : 'Enable dragging'}
          className={cls(
            'flex items-center justify-center gap-1.5 px-4 py-3 text-[11px] font-medium',
            'transition-colors duration-150',
            cfg.dragMode
              ? 'bg-rd-gold/15 text-rd-gold hover:bg-rd-gold/25'
              : 'text-rd-subtle hover:bg-rd-elevated hover:text-rd-text'
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
            'flex items-center justify-center gap-1.5 px-4 py-3 text-[11px] font-medium',
            'transition-colors duration-150',
            isSettingsOpen
              ? 'bg-rd-accent/15 text-rd-accent'
              : 'text-rd-subtle hover:bg-rd-elevated hover:text-rd-text'
          )}
        >
          <Settings2 size={13} />
          <span className="hidden sm:inline">Edit</span>
        </button>
      </div>
    </motion.div>
  )
}

// * -- main component --
const OverlayControl = (): React.ReactElement => {
  const {
    overlays,
    savePath,
    setOverlayConfig,
    setOverlaySettings,
    setSavePath,
    loadFromPreset
  } = useOverlayStore()
  const connection = useRaceStore((s) => s.connection)
  const standings = useRaceStore((s) => s.standings)

  const [displays, setDisplays] = useState<DisplayInfo[]>([])
  const [openSettings, setOpenSettings] = useState<OverlayId | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // * -- overlay control does not need the full live push stream; pull snapshots instead --
  useEffect(() => {
    let cancelled = false

    const syncState = async (): Promise<void> => {
      try {
        const state = await globalThis.api.getState()
        if (cancelled) return
        useRaceStore.getState().setSession(state.session)
        useRaceStore.getState().setStandings(state.standings)
        useRaceStore.getState().setConnection(state.connection)
      } catch {
        if (cancelled) return
      }
    }

    void syncState()
    const timer = globalThis.setInterval(() => {
      void syncState()
    }, 1000)

    return () => {
      cancelled = true
      globalThis.clearInterval(timer)
    }
  }, [])

  // * -- load displays + default save path --
  useEffect(() => {
    ;(async () => {
      const d = await globalThis.api.overlay.getDisplays()
      setDisplays(d)

      if (!savePath) {
        const def = await globalThis.api.overlay.getDefaultSavePath()
        setSavePath(def)
      }
    })()
  }, [])

  useEffect(() => {
    const towerCfg = overlays.find((overlay) => overlay.id === 'OVERLAY-TOWER')
    if (!towerCfg) return

    const settings = towerCfg.settings as TowerSettings
    const availableClasses = getAvailableTowerClasses(
      standings.map((standing) => standing.carClass)
    )
    const normalizedViewLayout =
      settings.viewLayout === 'PER_CLASS' || settings.viewLayout === 'EVERYONE_TOP'
        ? 'MIXED_TOP'
        : settings.viewLayout

    if (normalizedViewLayout !== settings.viewLayout) {
      setOverlaySettings('OVERLAY-TOWER', {
        viewLayout: normalizedViewLayout
      })
      return
    }

    if (
      normalizedViewLayout === 'CLASS_ONLY' &&
      availableClasses.length > 0 &&
      (!isTowerSelectableClass(settings.specificClass) ||
        !availableClasses.includes(settings.specificClass))
    ) {
      setOverlaySettings('OVERLAY-TOWER', {
        specificClass: availableClasses[0]
      })
    }
  }, [overlays, setOverlaySettings, standings])

  useEffect(() => {
    if (displays.length === 0) return

    for (const cfg of overlays) {
      if (!cfg.enabled) continue

      const meta = OVERLAY_META.find((item) => item.id === cfg.id)
      if (!meta) continue

      void syncOverlayWindowBounds(cfg, meta, displays, standings)
    }
  }, [displays, overlays, standings])

  // * -- auto-save on overlay change --
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!savePath) return
    if (saveTimer.current) clearTimeout(saveTimer.current)

    const runAutoSave = async (): Promise<void> => {
      const r = await globalThis.api.overlay.savePreset(overlays, savePath)
      if (!r.ok) pushToast(setToasts, 'error', `Auto-save failed: ${r.error}`)
    }

    saveTimer.current = setTimeout(() => {
      void runAutoSave()
    }, 1500)

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [overlays, savePath])

  // * -- save / load --
  const handleSave = async (): Promise<void> => {
    setIsSaving(true)
    const r = await globalThis.api.overlay.savePreset(overlays, savePath)
    setIsSaving(false)
    if (r.ok) pushToast(setToasts, 'success', 'Preset saved!')
    else pushToast(setToasts, 'error', `Save failed: ${r.error}`)
  }

  const handleSaveAs = async (): Promise<void> => {
    const pick = await globalThis.api.overlay.pickSavePath()
    if (!pick.ok || !pick.path) return
    setSavePath(pick.path)
    const r = await globalThis.api.overlay.savePreset(overlays, pick.path)
    if (r.ok) pushToast(setToasts, 'success', 'Preset saved to new location!')
    else pushToast(setToasts, 'error', `Save failed: ${r.error}`)
  }

  const handleLoad = async (): Promise<void> => {
    const pick = await globalThis.api.overlay.pickLoadPath()
    if (!pick.ok || !pick.path) return
    const r = await globalThis.api.overlay.loadPreset(pick.path)
    if (r.ok && r.data) {
      const loadedOverlays = loadFromPreset(r.data.overlays, pick.path)
      for (const cfg of loadedOverlays) {
        const meta = OVERLAY_META.find((item) => item.id === cfg.id)
        if (!meta) continue
        await applyOverlayWindowState(cfg, meta, displays, standings)
      }
      pushToast(setToasts, 'success', 'Preset loaded!')
    } else {
      pushToast(setToasts, 'error', `Load failed: ${r.error}`)
    }
  }

  // * -- overlay actions --
  const handleToggleEnabled = async (id: OverlayId): Promise<void> => {
    const cfg = overlays.find((o) => o.id === id)
    const meta = OVERLAY_META.find((item) => item.id === id)
    if (!cfg) return
    const next = !cfg.enabled
    setOverlayConfig(id, { enabled: next })
    if (next) {
      if (!meta) return
      await applyOverlayWindowState({ ...cfg, enabled: true }, meta, displays, standings)
    } else {
      await globalThis.api.windows.close(id)
    }
  }

  const handleToggleDrag = async (id: OverlayId): Promise<void> => {
    const cfg = useOverlayStore.getState().getOverlay(id)
    if (!cfg) return
    const next = !cfg.dragMode
    if (next) {
      setOverlayConfig(id, { dragMode: true })
      await globalThis.api.overlay.setDragMode(id, true)
      return
    }

    setOverlayConfig(id, { dragMode: false })
    await globalThis.api.overlay.setDragMode(id, false)
    const bounds = await globalThis.api.overlay.getBounds(id)
    syncRuntimePositionFromBounds(id, bounds, displays)
  }

  const openSettingsMeta = openSettings ? OVERLAY_META.find((m) => m.id === openSettings) : null
  const openSettingsCfg = openSettings ? overlays.find((o) => o.id === openSettings) : null

  return (
    <div
      className="flex h-screen flex-col bg-rd-bg text-rd-text overflow-hidden"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* title bar */}
      <div
        className="flex h-12 shrink-0 items-center gap-4 border-b border-rd-border bg-rd-surface px-4"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
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
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
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
      {connection !== 'CONNECTED' && (
        <div className="flex shrink-0 items-center gap-2 border-b border-rd-warning/20 bg-rd-warning/10 px-4 py-2">
          <AlertCircle size={25} className="text-rd-warning shrink-0" />
          <p className="text-s text-rd-warning">Not connected to Le Mans Ultimate</p>
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
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
            {/* file path */}
            <div className="flex items-center gap-2 rounded border border-rd-border/60 bg-rd-bg px-3 py-2">
              <Save size={15} className="shrink-0 text-rd-subtle" />
              <p className="flex-1 truncate font-mono text-[14px] text-rd-subtle">
                {savePath || 'No save path set'}
              </p>
            </div>
          </div>

          {/* overlay cards */}
          <div className="grid grid-cols-2 gap-3">
            {OVERLAY_META.map((meta) => {
              const cfg = overlays.find((o) => o.id === meta.id)
              if (!cfg) return null
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
                    setOpenSettings((prev) => (prev === meta.id ? null : meta.id))
                  }
                />
              )
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
                'flex items-center gap-2 rounded-lg border px-4 py-2.5 shadow-xl',
                'text-xs font-medium',
                t.type === 'success'
                  ? 'border-rd-success/30 bg-rd-surface text-rd-success'
                  : 'border-rd-error/30 bg-rd-surface text-rd-error'
              )}
            >
              {t.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default OverlayControl

// productivity final boss
