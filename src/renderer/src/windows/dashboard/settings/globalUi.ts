import type { GlobalUiSettingsPayload } from "../../../../../shared/globalUi";
import { applyMeasurementUnits } from "../../../units/measurementUnitStore";
import { getAccentPreset } from "./defaults";
import type { DashboardSettings } from "./types";

export const toGlobalUiPayload = (
  settings: DashboardSettings
): GlobalUiSettingsPayload => {
  const accent = getAccentPreset(settings.general.accentPreset);
  return {
    darkMode: settings.general.darkMode,
    accent: accent.accent,
    logoPrimary: accent.logoPrimary,
    logoSecondary: accent.logoSecondary,
    reduceMotion: settings.advanced.reduceMotion,
    speedUnit: settings.general.speedUnit,
  };
};

export const applyGlobalUiPayload = (
  payload: GlobalUiSettingsPayload
): void => {
  const root = document.documentElement;
  root.setAttribute("data-rd-theme", payload.darkMode ? "dark" : "light");
  root.style.setProperty("--color-rd-accent", payload.accent);
  root.style.setProperty("--color-rd-logo-primary", payload.logoPrimary);
  root.style.setProperty("--color-rd-logo-secondary", payload.logoSecondary);
  root.style.setProperty("--rd-reduce-motion", payload.reduceMotion ? "1" : "0");
  root.setAttribute("data-rd-speed-unit", payload.speedUnit);
  applyMeasurementUnits({ speedUnit: payload.speedUnit });
};
