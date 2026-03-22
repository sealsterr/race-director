import React from "react";
import type { DashboardSettings } from "../../../settings/types";
import { SectionBlock, SettingsRow, SettingsToggle } from "../SettingsPrimitives";

interface OverlaySettingsTabProps {
  settings: DashboardSettings;
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void;
}

const OverlaySettingsTab = ({
  settings,
  onChange,
}: OverlaySettingsTabProps): React.ReactElement => {
  return (
    <div className="flex flex-col gap-3">
      <SectionBlock title="Startup Windows">
        <SettingsRow
          label="Launch Overlay Dashboard"
          description="Open the Overlay Dashboard window when RaceDirector starts."
        >
          <SettingsToggle
            checked={settings.overlay.startupOverlayDashboard}
            onChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                overlay: { ...prev.overlay, startupOverlayDashboard: checked },
              }))
            }
            ariaLabel="Launch overlay dashboard at startup"
          />
        </SettingsRow>

        <SettingsRow
          label="Launch Info Window"
          description="Open the Info Window automatically on startup."
        >
          <SettingsToggle
            checked={settings.overlay.startupInfoWindow}
            onChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                overlay: { ...prev.overlay, startupInfoWindow: checked },
              }))
            }
            ariaLabel="Launch info window at startup"
          />
        </SettingsRow>

        <SettingsRow
          label="Close Overlays With Control Window"
          description="When Overlay Dashboard closes, close spawned overlay windows too."
        >
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
            ariaLabel="Close overlays when control closes"
          />
        </SettingsRow>
      </SectionBlock>

      <SectionBlock title="Visual Behavior">
        <SettingsRow
          label="Animate Overlay Highlights"
          description="Keep animated transitions for lap and sector highlights."
        >
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
            ariaLabel="Animate overlay highlights"
          />
        </SettingsRow>

        <SettingsRow
          label="Flash Fight Rows"
          description="Pulse tower rows when cars are in close fight range."
        >
          <SettingsToggle
            checked={settings.overlay.flashFightRows}
            onChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                overlay: { ...prev.overlay, flashFightRows: checked },
              }))
            }
            ariaLabel="Flash fight rows"
          />
        </SettingsRow>
      </SectionBlock>
    </div>
  );
};

export default OverlaySettingsTab;
