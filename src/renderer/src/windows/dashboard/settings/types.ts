export type SettingsTabId =
  | "general"
  | "network"
  | "overlay"
  | "audio"
  | "advanced";

export type AccentPresetId =
  | "ember-red"
  | "signal-orange"
  | "pit-blue"
  | "stint-teal"
  | "royal-violet"
  | "flag-yellow";

export interface DashboardSettings {
  general: {
    uiScale: number;
    darkMode: boolean;
    language: "English" | "Romanian" | "French" | "German";
    speedUnit: "kph" | "mph";
    accentPreset: AccentPresetId;
    activityLogLimit: number;
  };
  network: {
    apiUrl: string;
    pollRateMs: number;
    autoConnectOnLaunch: boolean;
    autoReconnectOnDrop: boolean;
    reconnectDelayMs: number;
  };
  overlay: {
    startupOverlayDashboard: boolean;
    startupInfoWindow: boolean;
    closeOverlaysWhenControlCloses: boolean;
    animateOverlayHighlights: boolean;
    flashFightRows: boolean;
  };
  audio: {
    enableUiSounds: boolean;
    enableConnectionAlerts: boolean;
    enableVoiceCallouts: boolean;
    masterVolume: number;
    calloutVolume: number;
  };
  advanced: {
    reduceMotion: boolean;
    compactTelemetryRows: boolean;
    verboseLogs: boolean;
  };
}

export interface AccentPreset {
  id: AccentPresetId;
  label: string;
  accent: string;
  logoPrimary: string;
  logoSecondary: string;
}
