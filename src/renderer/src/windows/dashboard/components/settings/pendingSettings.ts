export type PendingSettingId =
  | "general.language"
  | "overlay.animateOverlayHighlights"
  | "overlay.flashFightRows"
  | "audio.enableUiSounds"
  | "audio.enableConnectionAlerts"
  | "audio.enableVoiceCallouts"
  | "audio.masterVolume"
  | "audio.calloutVolume"
  | "advanced.compactTelemetryRows"
  | "advanced.verboseLogs";

interface PendingSettingCopy {
  badgeLabel: string;
  description: string;
}

const COMING_SOON_BADGE = "Coming soon";

const PENDING_SETTINGS: Record<PendingSettingId, PendingSettingCopy> = {
  "general.language": {
    badgeLabel: COMING_SOON_BADGE,
    description: "Translations are planned, but this build still uses English throughout the dashboard.",
  },
  "overlay.animateOverlayHighlights": {
    badgeLabel: COMING_SOON_BADGE,
    description: "Overlay highlight animation controls are not wired up yet in this build.",
  },
  "overlay.flashFightRows": {
    badgeLabel: COMING_SOON_BADGE,
    description: "Fight-row flashing controls are planned, but the overlay still uses its default behavior.",
  },
  "audio.enableUiSounds": {
    badgeLabel: COMING_SOON_BADGE,
    description: "Dashboard UI sound effects are not available yet in this build.",
  },
  "audio.enableConnectionAlerts": {
    badgeLabel: COMING_SOON_BADGE,
    description: "Connection alert sounds are planned, but there is no audio output for them yet.",
  },
  "audio.enableVoiceCallouts": {
    badgeLabel: COMING_SOON_BADGE,
    description: "Race voice callouts are planned, but they are not available yet.",
  },
  "audio.masterVolume": {
    badgeLabel: COMING_SOON_BADGE,
    description: "Audio volume controls will work once dashboard sound output is implemented.",
  },
  "audio.calloutVolume": {
    badgeLabel: COMING_SOON_BADGE,
    description: "Callout volume will become available when voice announcements ship.",
  },
  "advanced.compactTelemetryRows": {
    badgeLabel: COMING_SOON_BADGE,
    description: "Compact row density is planned, but telemetry layouts do not respond to it yet.",
  },
  "advanced.verboseLogs": {
    badgeLabel: COMING_SOON_BADGE,
    description: "Expanded diagnostic logging is planned, but the activity feed does not expose it yet.",
  },
};

export const getPendingSettingCopy = (
  id: PendingSettingId
): PendingSettingCopy => PENDING_SETTINGS[id];
