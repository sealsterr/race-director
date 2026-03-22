import React from "react";
import type { DashboardSettings } from "../../../settings/types";
import { getPendingSettingCopy } from "../pendingSettings";
import { SectionBlock, SettingsRow, SettingsToggle } from "../SettingsPrimitives";

interface AudioSettingsTabProps {
  settings: DashboardSettings;
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void;
}

const AudioSettingsTab = ({
  settings,
  onChange,
}: AudioSettingsTabProps): React.ReactElement => {
  const uiSoundsSetting = getPendingSettingCopy("audio.enableUiSounds");
  const connectionAlertsSetting = getPendingSettingCopy(
    "audio.enableConnectionAlerts"
  );
  const voiceCalloutsSetting = getPendingSettingCopy("audio.enableVoiceCallouts");
  const masterVolumeSetting = getPendingSettingCopy("audio.masterVolume");
  const calloutVolumeSetting = getPendingSettingCopy("audio.calloutVolume");

  return (
    <div className="flex flex-col gap-3">
      <SectionBlock title="Audio Routing">
        <SettingsRow
          label="Enable UI Sounds"
          description={uiSoundsSetting.description}
          badgeLabel={uiSoundsSetting.badgeLabel}
          disabled
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.audio.enableUiSounds}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  audio: { ...prev.audio, enableUiSounds: checked },
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
              disabled
            />
          )}
        </SettingsRow>

        <SettingsRow
          label="Connection Alerts"
          description={connectionAlertsSetting.description}
          badgeLabel={connectionAlertsSetting.badgeLabel}
          disabled
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.audio.enableConnectionAlerts}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  audio: { ...prev.audio, enableConnectionAlerts: checked },
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
              disabled
            />
          )}
        </SettingsRow>

        <SettingsRow
          label="Voice Callouts"
          description={voiceCalloutsSetting.description}
          badgeLabel={voiceCalloutsSetting.badgeLabel}
          disabled
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.audio.enableVoiceCallouts}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  audio: { ...prev.audio, enableVoiceCallouts: checked },
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
              disabled
            />
          )}
        </SettingsRow>
      </SectionBlock>

      <SectionBlock title="Levels">
        <SettingsRow
          label="Master Volume"
          description={masterVolumeSetting.description}
          badgeLabel={masterVolumeSetting.badgeLabel}
          disabled
        >
          {({ controlId, descriptionId, labelId }) => (
            <div className="flex w-72 items-center gap-2">
              <input
                id={controlId}
                type="range"
                min={0}
                max={100}
                step={1}
                value={settings.audio.masterVolume}
                aria-describedby={descriptionId}
                aria-labelledby={labelId}
                aria-valuetext={`${settings.audio.masterVolume}%`}
                disabled
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-rd-border accent-rd-accent disabled:cursor-not-allowed disabled:opacity-70"
              />
              <span className="w-12 text-right font-mono text-xs text-rd-muted">
                {settings.audio.masterVolume}%
              </span>
            </div>
          )}
        </SettingsRow>

        <SettingsRow
          label="Callout Volume"
          description={calloutVolumeSetting.description}
          badgeLabel={calloutVolumeSetting.badgeLabel}
          disabled
        >
          {({ controlId, descriptionId, labelId }) => (
            <div className="flex w-72 items-center gap-2">
              <input
                id={controlId}
                type="range"
                min={0}
                max={100}
                step={1}
                value={settings.audio.calloutVolume}
                aria-describedby={descriptionId}
                aria-labelledby={labelId}
                aria-valuetext={`${settings.audio.calloutVolume}%`}
                disabled
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-rd-border accent-rd-accent disabled:cursor-not-allowed disabled:opacity-70"
              />
              <span className="w-12 text-right font-mono text-xs text-rd-muted">
                {settings.audio.calloutVolume}%
              </span>
            </div>
          )}
        </SettingsRow>
      </SectionBlock>
    </div>
  );
};

export default AudioSettingsTab;
