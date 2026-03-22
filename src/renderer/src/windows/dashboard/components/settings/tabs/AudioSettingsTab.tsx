import React from "react";
import type { DashboardSettings } from "../../../settings/types";
import { SectionBlock, SettingsRow, SettingsToggle } from "../SettingsPrimitives";

interface AudioSettingsTabProps {
  settings: DashboardSettings;
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void;
}

const AudioSettingsTab = ({
  settings,
  onChange,
}: AudioSettingsTabProps): React.ReactElement => {
  return (
    <div className="flex flex-col gap-3">
      <SectionBlock title="Audio Routing">
        <SettingsRow
          label="Enable UI Sounds"
          description="Play click and feedback sounds inside dashboard interactions."
        >
          <SettingsToggle
            checked={settings.audio.enableUiSounds}
            onChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                audio: { ...prev.audio, enableUiSounds: checked },
              }))
            }
            ariaLabel="Enable UI sounds"
          />
        </SettingsRow>

        <SettingsRow
          label="Connection Alerts"
          description="Play a short alert when LMU connection changes state."
        >
          <SettingsToggle
            checked={settings.audio.enableConnectionAlerts}
            onChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                audio: { ...prev.audio, enableConnectionAlerts: checked },
              }))
            }
            ariaLabel="Enable connection alerts"
          />
        </SettingsRow>

        <SettingsRow
          label="Voice Callouts"
          description="Reserved for future race-event voice announcements."
        >
          <SettingsToggle
            checked={settings.audio.enableVoiceCallouts}
            onChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                audio: { ...prev.audio, enableVoiceCallouts: checked },
              }))
            }
            ariaLabel="Enable voice callouts"
          />
        </SettingsRow>
      </SectionBlock>

      <SectionBlock title="Levels">
        <SettingsRow
          label="Master Volume"
          description="Overall volume for settings-controlled dashboard audio."
        >
          <div className="flex w-72 items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={settings.audio.masterVolume}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  audio: { ...prev.audio, masterVolume: Number(event.target.value) },
                }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-rd-border"
            />
            <span className="w-12 text-right font-mono text-xs text-rd-muted">
              {settings.audio.masterVolume}%
            </span>
          </div>
        </SettingsRow>

        <SettingsRow
          label="Callout Volume"
          description="Target volume for voice prompts and race callouts."
        >
          <div className="flex w-72 items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={settings.audio.calloutVolume}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  audio: { ...prev.audio, calloutVolume: Number(event.target.value) },
                }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-rd-border"
            />
            <span className="w-12 text-right font-mono text-xs text-rd-muted">
              {settings.audio.calloutVolume}%
            </span>
          </div>
        </SettingsRow>
      </SectionBlock>
    </div>
  );
};

export default AudioSettingsTab;
