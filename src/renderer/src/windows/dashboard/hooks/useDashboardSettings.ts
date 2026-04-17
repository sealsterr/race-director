import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clampSettings,
  DEFAULT_DASHBOARD_SETTINGS,
  loadDashboardSettingsFromStorage,
  persistDashboardSettingsToStorage
} from '../settings/defaults'
import { applyGlobalUiPayload, toGlobalUiPayload } from '../settings/globalUi'
import type { DashboardSettings } from '../settings/types'

interface UseDashboardSettingsResult {
  settings: DashboardSettings
  draftSettings: DashboardSettings
  hasUnsavedChanges: boolean
  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void
  updateDraft: (updater: (prev: DashboardSettings) => DashboardSettings) => void
  saveDraft: () => void
  resetDraftToDefaults: () => void
}

const applyUiPreview = (settings: DashboardSettings): void => {
  const payload = toGlobalUiPayload(settings)
  applyGlobalUiPayload(payload)
  void globalThis.api.settings.applyGlobalUi(payload)
}

const getThemePreviewKey = (settings: DashboardSettings): string =>
  JSON.stringify({
    accentPreset: settings.general.accentPreset,
    customPalette: settings.general.customPalette,
    darkMode: settings.general.darkMode
  })

type ThemePreviewFields = Pick<
  DashboardSettings['general'],
  'accentPreset' | 'customPalette' | 'darkMode'
>

const useDashboardSettings = (): UseDashboardSettingsResult => {
  const [settings, setSettings] = useState<DashboardSettings>(() =>
    loadDashboardSettingsFromStorage(globalThis.localStorage)
  )
  const [draftSettings, setDraftSettings] = useState<DashboardSettings>(settings)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(draftSettings),
    [draftSettings, settings]
  )
  const draftThemePreviewKey = useMemo(() => getThemePreviewKey(draftSettings), [draftSettings])

  const openSettings = useCallback(() => {
    setDraftSettings(settings)
    setIsSettingsOpen(true)
  }, [settings])

  const closeSettings = useCallback(() => {
    applyUiPreview(settings)
    setIsSettingsOpen(false)
  }, [settings])

  const updateDraft = useCallback((updater: (prev: DashboardSettings) => DashboardSettings) => {
    setDraftSettings((prev) => clampSettings(updater(prev)))
  }, [])

  const saveDraft = useCallback(() => {
    const next = clampSettings(draftSettings)
    setSettings(next)
    applyUiPreview(next)
    persistDashboardSettingsToStorage(globalThis.localStorage, next)
    globalThis.dispatchEvent(new Event('rd:settingsChanged'))
    setIsSettingsOpen(false)
  }, [draftSettings])

  const resetDraftToDefaults = useCallback(() => {
    setDraftSettings(DEFAULT_DASHBOARD_SETTINGS)
  }, [])

  useEffect(() => {
    if (!isSettingsOpen) return

    const previewTheme = JSON.parse(draftThemePreviewKey) as ThemePreviewFields
    const previewSettings: DashboardSettings = {
      ...settings,
      general: {
        ...settings.general,
        accentPreset: previewTheme.accentPreset,
        customPalette: previewTheme.customPalette,
        darkMode: previewTheme.darkMode
      }
    }

    applyUiPreview(previewSettings)
  }, [draftThemePreviewKey, isSettingsOpen, settings])

  return {
    settings,
    draftSettings,
    hasUnsavedChanges,
    isSettingsOpen,
    openSettings,
    closeSettings,
    updateDraft,
    saveDraft,
    resetDraftToDefaults
  }
}

export default useDashboardSettings
