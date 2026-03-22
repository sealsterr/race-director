import { useCallback, useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-rd-modal-open",
      isSettingsOpen ? "true" : "false"
    );
    void globalThis.api.windows.setModalBackdropActive(isSettingsOpen);

    return () => {
      document.documentElement.setAttribute("data-rd-modal-open", "false");
      void globalThis.api.windows.setModalBackdropActive(false);
    };
  }, [isSettingsOpen]);

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
