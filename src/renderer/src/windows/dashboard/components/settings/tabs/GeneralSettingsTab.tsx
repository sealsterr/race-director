import React from "react";
import { ACCENT_PRESETS } from "../../../settings/defaults";
import type { DashboardSettings } from "../../../settings/types";
import {
  SectionBlock,
  SettingsRow,
  SettingsSectionTitle,
  SettingsToggle,
} from "../SettingsPrimitives";

interface GeneralSettingsTabProps {
  settings: DashboardSettings;
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void;
}

const GeneralSettingsTab = ({
  settings,
  onChange,
}: GeneralSettingsTabProps): React.ReactElement => {
  return (
    <div className="flex flex-col gap-3">
      <SettingsSectionTitle title="General" />

      <SectionBlock title="Interface">
        <SettingsRow
          label="UI Scale"
          description="Scale dashboard content density and readability."
        >
          <div className="flex w-72 items-center gap-2">
            <input
              type="range"
              min={0.75}
              max={1.5}
              step={0.05}
              value={settings.general.uiScale}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  general: {
                    ...prev.general,
                    uiScale: Number(event.target.value),
                  },
                }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-rd-border"
            />
            <span className="w-12 text-right font-mono text-xs text-rd-muted">
              {settings.general.uiScale.toFixed(2)}x
            </span>
          </div>
        </SettingsRow>

        <SettingsRow
          label="Dark Mode"
          description="Toggle between the standard dark palette and a bright layout."
        >
          <SettingsToggle
            checked={settings.general.darkMode}
            onChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                general: { ...prev.general, darkMode: checked },
              }))
            }
            ariaLabel="Dark mode"
          />
        </SettingsRow>

        <SettingsRow
          label="Language"
          description="UI language used for labels and section headings."
        >
          <select
            value={settings.general.language}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                general: {
                  ...prev.general,
                  language: event.target.value as DashboardSettings["general"]["language"],
                },
              }))
            }
            className="w-44 rounded-md border border-rd-border bg-rd-elevated px-3 py-2 text-sm text-rd-text outline-none focus:border-rd-accent/60"
          >
            <option>English</option>
            <option>Romanian</option>
            <option>French</option>
            <option>German</option>
          </select>
        </SettingsRow>
      </SectionBlock>

      <SectionBlock title="Theme Options">
        <SettingsRow
          label="Accent Palette"
          description="Select the highlight color used across active controls and badges."
        >
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((preset) => {
              const selected = settings.general.accentPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.label}
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      general: { ...prev.general, accentPreset: preset.id },
                    }))
                  }
                  className={`h-7 w-7 rounded-md border transition-transform hover:scale-105 ${
                    selected ? "border-white/80" : "border-rd-border"
                  }`}
                  style={{ backgroundColor: preset.accent }}
                />
              );
            })}
          </div>
        </SettingsRow>

        <SettingsRow
          label="Activity Log Limit"
          description="Maximum event entries retained in the dashboard feed."
        >
          <div className="flex w-72 items-center gap-2">
            <input
              type="range"
              min={100}
              max={2000}
              step={100}
              value={settings.general.activityLogLimit}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  general: {
                    ...prev.general,
                    activityLogLimit: Number(event.target.value),
                  },
                }))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-rd-border"
            />
            <span className="w-14 text-right font-mono text-xs text-rd-muted">
              {settings.general.activityLogLimit}
            </span>
          </div>
        </SettingsRow>
      </SectionBlock>
    </div>
  );
};

export default GeneralSettingsTab;
