import { useCallback, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  clampSettings,
  DEFAULT_DASHBOARD_SETTINGS,
  loadDashboardSettingsFromStorage,
  persistDashboardSettingsToStorage,
} from "../settings/defaults";
import type { DashboardSettings } from "../settings/types";

interface UseDashboardSettingsResult {
  settings: DashboardSettings;
  draftSettings: DashboardSettings;
  hasUnsavedChanges: boolean;
  isSettingsOpen: boolean;
  scaledContainerStyle: CSSProperties;
  openSettings: () => void;
  closeSettings: () => void;
  updateDraft: (updater: (prev: DashboardSettings) => DashboardSettings) => void;
  saveDraft: () => void;
  resetDraftToDefaults: () => void;
}

const useDashboardSettings = (): UseDashboardSettingsResult => {
  const [settings, setSettings] = useState<DashboardSettings>(() =>
    loadDashboardSettingsFromStorage(globalThis.localStorage)
  );
  const [draftSettings, setDraftSettings] = useState<DashboardSettings>(settings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(draftSettings),
    [draftSettings, settings]
  );

  const scaledContainerStyle = useMemo(
    () => ({ zoom: settings.general.uiScale }),
    [settings.general.uiScale]
  );

  const openSettings = useCallback(() => {
    setDraftSettings(settings);
    setIsSettingsOpen(true);
  }, [settings]);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const updateDraft = useCallback(
    (updater: (prev: DashboardSettings) => DashboardSettings) => {
      setDraftSettings((prev) => clampSettings(updater(prev)));
    },
    []
  );

  const saveDraft = useCallback(() => {
    const next = clampSettings(draftSettings);
    setSettings(next);
    persistDashboardSettingsToStorage(globalThis.localStorage, next);
    globalThis.dispatchEvent(new Event("rd:settingsChanged"));
    setIsSettingsOpen(false);
  }, [draftSettings]);

  const resetDraftToDefaults = useCallback(() => {
    setDraftSettings(DEFAULT_DASHBOARD_SETTINGS);
  }, []);

  return {
    settings,
    draftSettings,
    hasUnsavedChanges,
    isSettingsOpen,
    scaledContainerStyle,
    openSettings,
    closeSettings,
    updateDraft,
    saveDraft,
    resetDraftToDefaults,
  };
};

export default useDashboardSettings;
