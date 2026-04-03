import React from "react";
import { ACCENT_PRESETS } from "../../../settings/defaults";
import type { DashboardSettings } from "../../../settings/types";
import { getPendingSettingCopy } from "../pendingSettings";
import {
  SectionBlock,
  SettingsRow,
  SettingsSectionTitle,
  SettingsToggle,
} from "../SettingsPrimitives";
import GeneralMeasurementsSection from "./GeneralMeasurementsSection";

interface GeneralSettingsTabProps {
  settings: DashboardSettings;
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void;
}

const GeneralSettingsTab = ({
  settings,
  onChange,
}: GeneralSettingsTabProps): React.ReactElement => {
  const languageSetting = getPendingSettingCopy("general.language");

  return (
    <div className="flex flex-col gap-3">
      <SettingsSectionTitle title="General" />

      <SectionBlock title="Interface">
        <SettingsRow
          label="UI Scale"
          description="Scale dashboard content density and readability."
        >
          {({ controlId, descriptionId, labelId }) => (
            <div className="flex w-72 items-center gap-2">
              <input
                id={controlId}
                type="range"
                min={0.75}
                max={1.5}
                step={0.05}
                value={settings.general.uiScale}
                aria-describedby={descriptionId}
                aria-labelledby={labelId}
                aria-valuetext={`${settings.general.uiScale.toFixed(2)}x`}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    general: {
                      ...prev.general,
                      uiScale: Number(event.target.value),
                    },
                  }))
                }
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-rd-border accent-rd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface"
              />
              <span className="w-12 text-right font-mono text-xs text-rd-muted">
                {settings.general.uiScale.toFixed(2)}x
              </span>
            </div>
          )}
        </SettingsRow>

        <SettingsRow
          label="Dark Mode"
          description="Toggle between the standard dark palette and a bright layout."
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.general.darkMode}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  general: { ...prev.general, darkMode: checked },
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
            />
          )}
        </SettingsRow>

        <SettingsRow
          label="Language"
          description={languageSetting.description}
          badgeLabel={languageSetting.badgeLabel}
          disabled
        >
          {({ controlId, descriptionId, labelId }) => (
            <select
              id={controlId}
              value={settings.general.language}
              aria-describedby={descriptionId}
              aria-labelledby={labelId}
              disabled
              className="w-44 rounded-md border border-rd-border bg-rd-elevated px-3 py-2 text-sm text-rd-text outline-none focus:border-rd-accent/60 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option>English</option>
              <option>Romanian</option>
              <option>French</option>
              <option>German</option>
            </select>
          )}
        </SettingsRow>
      </SectionBlock>

      <SectionBlock title="Theme Options">
        <SettingsRow
          label="Accent Palette"
          description="Select the highlight color used across active controls and badges."
        >
          {({ descriptionId, labelId }) => (
            <div
              role="radiogroup"
              aria-describedby={descriptionId}
              aria-labelledby={labelId}
              className="flex gap-2"
            >
              {ACCENT_PRESETS.map((preset) => {
                const selected = settings.general.accentPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={preset.label}
                    title={preset.label}
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        general: { ...prev.general, accentPreset: preset.id },
                      }))
                    }
                    className={`h-7 w-7 rounded border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface ${
                      selected ? "border-rd-text" : "border-rd-border"
                    }`}
                    style={{ backgroundColor: preset.accent }}
                  >
                    <span className="sr-only">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </SettingsRow>

        <SettingsRow
          label="Activity Log Limit"
          description="Maximum event entries retained in the dashboard feed."
        >
          {({ controlId, descriptionId, labelId }) => (
            <div className="flex w-72 items-center gap-2">
              <input
                id={controlId}
                type="range"
                min={100}
                max={2000}
                step={100}
                value={settings.general.activityLogLimit}
                aria-describedby={descriptionId}
                aria-labelledby={labelId}
                aria-valuetext={`${settings.general.activityLogLimit} entries`}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    general: {
                      ...prev.general,
                      activityLogLimit: Number(event.target.value),
                    },
                  }))
                }
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-rd-border accent-rd-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface"
              />
              <span className="w-14 text-right font-mono text-xs text-rd-muted">
                {settings.general.activityLogLimit}
              </span>
            </div>
          )}
        </SettingsRow>
      </SectionBlock>

      <GeneralMeasurementsSection settings={settings} onChange={onChange} />
    </div>
  );
};

export default GeneralSettingsTab;
