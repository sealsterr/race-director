import React from "react";
import CustomSelect from "../../../../../components/ui/CustomSelect";
import type { DashboardSettings } from "../../../settings/types";
import { getPendingSettingCopy } from "../pendingSettings";
import {
  SettingsToggle,
  SectionBlock,
  SettingsRow,
} from "../SettingsPrimitives";
import GeneralMeasurementsSection from "./GeneralMeasurementsSection";
import GeneralThemeSection from "./GeneralThemeSection";

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
      <SectionBlock title="Interface">
        <SettingsRow
          label="UI Scale"
          description="Scale dashboard content density."
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
          description="Toggle dark mode."
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
            <CustomSelect
              id={controlId}
              value={settings.general.language}
              options={[
                { label: "English", value: "English" },
                { label: "Romanian", value: "Romanian" },
                { label: "French", value: "French" },
                { label: "German", value: "German" },
                { label: "Hungarian", value: "Hungarian" },
              ]}
              ariaDescribedBy={descriptionId}
              ariaLabelledBy={labelId}
              disabled
              onChange={() => undefined}
              buttonClassName="w-44"
            />
          )}
        </SettingsRow>
      </SectionBlock>

      <GeneralThemeSection settings={settings} onChange={onChange} />

      <GeneralMeasurementsSection settings={settings} onChange={onChange} />
    </div>
  );
};

export default GeneralSettingsTab;
