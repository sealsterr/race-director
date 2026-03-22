import React from "react";
import type { DashboardSettings } from "../../../settings/types";
import { getPendingSettingCopy } from "../pendingSettings";
import { SectionBlock, SettingsRow, SettingsToggle } from "../SettingsPrimitives";

interface OverlaySettingsTabProps {
  settings: DashboardSettings;
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void;
}

const OverlaySettingsTab = ({
  settings,
  onChange,
}: OverlaySettingsTabProps): React.ReactElement => {
  const animateHighlightsSetting = getPendingSettingCopy(
    "overlay.animateOverlayHighlights"
  );
  const flashFightRowsSetting = getPendingSettingCopy("overlay.flashFightRows");

  return (
    <div className="flex flex-col gap-3">
      <SectionBlock title="Startup Windows">
        <SettingsRow
          label="Launch Overlay Dashboard"
          description="Open the Overlay Dashboard window when RaceDirector starts."
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.overlay.startupOverlayDashboard}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  overlay: { ...prev.overlay, startupOverlayDashboard: checked },
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
            />
          )}
        </SettingsRow>

        <SettingsRow
          label="Launch Info Window"
          description="Open the Info Window automatically on startup."
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.overlay.startupInfoWindow}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  overlay: { ...prev.overlay, startupInfoWindow: checked },
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
            />
          )}
        </SettingsRow>

        <SettingsRow
          label="Close Overlays With Control Window"
          description="When Overlay Dashboard closes, close spawned overlay windows too."
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.overlay.closeOverlaysWhenControlCloses}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  overlay: {
                    ...prev.overlay,
                    closeOverlaysWhenControlCloses: checked,
                  },
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
            />
          )}
        </SettingsRow>
      </SectionBlock>

      <SectionBlock title="Visual Behavior">
        <SettingsRow
          label="Animate Overlay Highlights"
          description={animateHighlightsSetting.description}
          badgeLabel={animateHighlightsSetting.badgeLabel}
          disabled
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.overlay.animateOverlayHighlights}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  overlay: {
                    ...prev.overlay,
                    animateOverlayHighlights: checked,
                  },
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
              disabled
            />
          )}
        </SettingsRow>

        <SettingsRow
          label="Flash Fight Rows"
          description={flashFightRowsSetting.description}
          badgeLabel={flashFightRowsSetting.badgeLabel}
          disabled
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.overlay.flashFightRows}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  overlay: { ...prev.overlay, flashFightRows: checked },
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
              disabled
            />
          )}
        </SettingsRow>
      </SectionBlock>
    </div>
  );
};

export default OverlaySettingsTab;
