import React from "react";
import type { DashboardSettings } from "../../../settings/types";
import { SectionBlock, SettingsRow, SettingsToggle } from "../SettingsPrimitives";

interface AdvancedSettingsTabProps {
  settings: DashboardSettings;
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void;
  onResetQuitConfirm: () => Promise<void>;
}

const AdvancedSettingsTab = ({
  settings,
  onChange,
  onResetQuitConfirm,
}: AdvancedSettingsTabProps): React.ReactElement => {
  return (
    <div className="flex flex-col gap-3">
      <SectionBlock title="Behavior">
        <SettingsRow
          label="Reduce Motion"
          description="Limit decorative animations to improve focus and readability."
        >
          <SettingsToggle
            checked={settings.advanced.reduceMotion}
            onChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                advanced: { ...prev.advanced, reduceMotion: checked },
              }))
            }
            ariaLabel="Reduce motion"
          />
        </SettingsRow>

        <SettingsRow
          label="Compact Telemetry Rows"
          description="Use tighter spacing in lists and control panels."
        >
          <SettingsToggle
            checked={settings.advanced.compactTelemetryRows}
            onChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                advanced: { ...prev.advanced, compactTelemetryRows: checked },
              }))
            }
            ariaLabel="Compact telemetry rows"
          />
        </SettingsRow>

        <SettingsRow
          label="Verbose Logs"
          description="Include additional diagnostics in the activity feed."
        >
          <SettingsToggle
            checked={settings.advanced.verboseLogs}
            onChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                advanced: { ...prev.advanced, verboseLogs: checked },
              }))
            }
            ariaLabel="Verbose logs"
          />
        </SettingsRow>
      </SectionBlock>

      <SectionBlock title="Tools">
        <SettingsRow
          label="Reset Quit Confirmation Flag"
          description="Force the quit dialog preference to ask again for testing."
        >
          <button
            type="button"
            onClick={() => void onResetQuitConfirm()}
            className="rounded-md border border-rd-warning/40 bg-rd-warning/10 px-3 py-1.5 text-xs font-semibold text-rd-warning transition-colors hover:bg-rd-warning/20"
          >
            Reset Flag
          </button>
        </SettingsRow>
      </SectionBlock>
    </div>
  );
};

export default AdvancedSettingsTab;
