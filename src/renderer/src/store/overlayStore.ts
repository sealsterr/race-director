import { create } from 'zustand'
import type {
  DriverSettings,
  GapSettings,
  OverlayConfig,
  OverlayConfigForId,
  OverlayConfigUnion,
  OverlayId,
  OverlaySpecificSettings,
  SessionSettings,
  TowerSettings
} from '../../../shared/overlay'
import {
  DEFAULT_DASHBOARD_SETTINGS,
  loadDashboardSettingsFromStorage,
  resolvePaletteColors
} from '../windows/dashboard/settings/defaults'

export type {
  DriverSettings,
  DriverOverlayConfig,
  GapSettings,
  GapOverlayConfig,
  OverlayConfig,
  OverlayConfigForId,
  OverlayConfigUnion,
  OverlayId,
  OverlaySpecificSettings,
  SessionOverlayConfig,
  SessionSettings,
  TowerOverlayConfig,
  TowerQualiMode,
  TowerRaceMode,
  TowerSettings,
  TowerViewLayout
} from '../../../shared/overlay'

function getDefaultSessionProgressBarColor(): string {
  try {
    const settings = loadDashboardSettingsFromStorage(globalThis.localStorage)
    return resolvePaletteColors(settings.general).accent
  } catch (error) {
    console.warn('Failed to resolve session overlay accent color; using default:', error)
    return resolvePaletteColors(DEFAULT_DASHBOARD_SETTINGS.general).accent
  }
}

const DEFAULT_CONFIGS: OverlayConfigUnion[] = [
  {
    id: 'OVERLAY-TOWER',
    enabled: false,
    opacity: 100,
    scale: 1,
    x: 20,
    y: 100,
    displayId: 0,
    dragMode: false,
    settings: {
      viewLayout: 'MIXED_TOP',
      specificClass: null,
      raceMode: 'GAP_AHEAD',
      qualiMode: 'QUALI_GAP',
      maxRowsPerClass: 5,
      standingsRefreshMs: 1000,
      fightEnabled: true,
      fightOnlyInIntervalMode: true,
      fightThresholdSeconds: 0.25,
      fightHoldSeconds: 3,
      fightDisabledLaps: 3,
      fightRequireSameLap: true,
      fightIgnorePitAndFinished: true,
      showCarNumber: true,
      showClassBar: true,
      animationSpeed: 'normal',
      colorHypercar: '#E4002B',
      colorLMP2: '#0057A8',
      colorLMP3: '#FFD700',
      colorLMGT3: '#00A651',
      colorGTE: '#FF6600',
      colorHard: '#FFFFFF',
      colorMedium: '#FFD700',
      colorSoft: '#E4002B',
      colorWet: '#0099FF',
      colorPitBadge: '#F59E0B',
      colorFinishBadge: '#E5E7EB'
    } satisfies TowerSettings
  },
  {
    id: 'OVERLAY-DRIVER',
    enabled: false,
    opacity: 90,
    scale: 1,
    x: 40,
    y: 880,
    displayId: 0,
    dragMode: false,
    settings: {
      showPart1: true,
      showPart2: true,
      showPart3: true,
      colorSessionBest: '#7c3aed',
      colorPersonalBest: '#22c55e',
      colorCompleted: '#f59e0b',
      colorPending: '#475569'
    } satisfies DriverSettings
  },
  {
    id: 'OVERLAY-GAP',
    enabled: false,
    opacity: 90,
    scale: 0.8,
    x: 120,
    y: 620,
    displayId: 0,
    dragMode: false,
    settings: {
      triggerThresholdSeconds: 1,
      showCarClass: true
    } satisfies GapSettings
  },
  {
    id: 'OVERLAY-SESSION',
    enabled: false,
    opacity: 90,
    scale: 1,
    x: 20,
    y: 22,
    displayId: 0,
    dragMode: false,
    settings: {
      customLabel: 'World Endurance Championship',
      showSessionType: true,
      showTimeRemaining: true,
      showLapCount: true,
      progressBarColor: getDefaultSessionProgressBarColor(),
      animateProgressPulse: true
    } satisfies SessionSettings
  }
]

function cloneConfig(config: OverlayConfigUnion): OverlayConfigUnion {
  switch (config.id) {
    case 'OVERLAY-TOWER':
      return { ...config, settings: { ...config.settings } }
    case 'OVERLAY-DRIVER':
      return { ...config, settings: { ...config.settings } }
    case 'OVERLAY-GAP':
      return { ...config, settings: { ...config.settings } }
    case 'OVERLAY-SESSION':
      return { ...config, settings: { ...config.settings } }
  }
}

function mergeOverlayConfig(
  base: OverlayConfigUnion,
  overlay: OverlayConfigUnion
): OverlayConfigUnion {
  switch (base.id) {
    case 'OVERLAY-TOWER':
      return overlay.id === 'OVERLAY-TOWER'
        ? { ...base, ...overlay, settings: { ...base.settings, ...overlay.settings } }
        : base
    case 'OVERLAY-DRIVER':
      return overlay.id === 'OVERLAY-DRIVER'
        ? { ...base, ...overlay, settings: { ...base.settings, ...overlay.settings } }
        : base
    case 'OVERLAY-GAP':
      return overlay.id === 'OVERLAY-GAP'
        ? { ...base, ...overlay, settings: { ...base.settings, ...overlay.settings } }
        : base
    case 'OVERLAY-SESSION':
      return overlay.id === 'OVERLAY-SESSION'
        ? { ...base, ...overlay, settings: { ...base.settings, ...overlay.settings } }
        : base
  }
}

function applyOverlaySettings(
  overlay: OverlayConfigUnion,
  settings: Partial<OverlaySpecificSettings>
): OverlayConfigUnion {
  switch (overlay.id) {
    case 'OVERLAY-TOWER':
      return { ...overlay, settings: { ...overlay.settings, ...settings } }
    case 'OVERLAY-DRIVER':
      return { ...overlay, settings: { ...overlay.settings, ...settings } }
    case 'OVERLAY-GAP':
      return { ...overlay, settings: { ...overlay.settings, ...settings } }
    case 'OVERLAY-SESSION':
      return { ...overlay, settings: { ...overlay.settings, ...settings } }
  }
}

type OverlayConfigPatch = Partial<
  Pick<OverlayConfig, 'enabled' | 'opacity' | 'scale' | 'x' | 'y' | 'displayId' | 'dragMode'>
>

function createDefaultConfigMap(): Map<OverlayId, OverlayConfigUnion> {
  return new Map(DEFAULT_CONFIGS.map((config) => [config.id, cloneConfig(config)]))
}

export function normalizeOverlayConfigs(overlays: OverlayConfigUnion[]): OverlayConfigUnion[] {
  const defaults = createDefaultConfigMap()

  for (const overlay of overlays) {
    const base = defaults.get(overlay.id)
    if (!base) continue

    defaults.set(overlay.id, mergeOverlayConfig(base, overlay))
  }

  return DEFAULT_CONFIGS.map((config) => {
    const normalized = defaults.get(config.id)
    return normalized ? cloneConfig(normalized) : cloneConfig(config)
  })
}

interface OverlayStore {
  overlays: OverlayConfigUnion[]
  savePath: string

  setOverlayConfig: (id: OverlayId, partial: OverlayConfigPatch) => void
  setOverlayRuntimePosition: (
    id: OverlayId,
    position: Pick<OverlayConfig, 'x' | 'y' | 'displayId'>
  ) => void
  setOverlaySettings: <Id extends OverlayId>(
    id: Id,
    settings: Partial<OverlayConfigForId<Id>['settings']>
  ) => void
  setSavePath: (path: string) => void
  getOverlay: <Id extends OverlayId>(id: Id) => OverlayConfigForId<Id> | undefined
  loadFromPreset: (overlays: OverlayConfigUnion[], savePath: string) => OverlayConfigUnion[]
}

export const useOverlayStore = create<OverlayStore>((set, get) => ({
  overlays: normalizeOverlayConfigs(DEFAULT_CONFIGS),
  savePath: '',

  setOverlayConfig: (id, partial) => {
    set((state) => ({
      overlays: state.overlays.map((o) => (o.id === id ? { ...o, ...partial } : o))
    }))
    const updated = get().overlays.find((o) => o.id === id)
    if (updated) globalThis.api?.overlay?.broadcastConfig?.(updated)
  },

  setOverlayRuntimePosition: (id, position) =>
    set((state) => ({
      overlays: state.overlays.map((o) => (o.id === id ? { ...o, ...position } : o))
    })),

  setOverlaySettings: (id, settings) => {
    set((state) => ({
      overlays: state.overlays.map((o) => (o.id === id ? applyOverlaySettings(o, settings) : o))
    }))
    const updated = get().overlays.find((o) => o.id === id)
    if (updated) globalThis.api?.overlay?.broadcastConfig?.(updated)
  },

  setSavePath: (path) => set({ savePath: path }),

  getOverlay: (id) =>
    get().overlays.find((overlay): overlay is OverlayConfigForId<typeof id> => overlay.id === id),

  loadFromPreset: (overlays, savePath) => {
    const normalized = normalizeOverlayConfigs(overlays)
    set({ overlays: normalized, savePath })
    normalized.forEach((overlay) => {
      globalThis.api?.overlay?.broadcastConfig?.(overlay)
    })
    return normalized
  }
}))
