import React from "react";
import CustomNumberField from "../../../../../components/ui/CustomNumberField";
import type { DashboardSettings } from "../../../settings/types";
import { SectionBlock, SettingsRow, SettingsToggle } from "../SettingsPrimitives";

interface NetworkSettingsTabProps {
  settings: DashboardSettings;
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void;
}

const NetworkSettingsTab = ({
  settings,
  onChange,
}: NetworkSettingsTabProps): React.ReactElement => {
  return (
    <div className="flex flex-col gap-3">
      <SectionBlock title="Connection">
        <SettingsRow
          label="API Endpoint"
          description="Endpoint used for connections."
        >
          {({ controlId, descriptionId, labelId }) => (
            <input
              id={controlId}
              type="text"
              value={settings.network.apiUrl}
              maxLength={300}
              inputMode="url"
              spellCheck={false}
              aria-describedby={descriptionId}
              aria-labelledby={labelId}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  network: { ...prev.network, apiUrl: event.target.value.trim() },
                }))
              }
              className="w-72 rounded-md border border-rd-border bg-rd-elevated px-3 py-2 font-mono text-xs text-rd-text outline-none focus:border-rd-accent/60"
            />
          )}
        </SettingsRow>

        <SettingsRow
          label="Poll Rate"
          description="How often telemetry is requested by the app."
        >
          {({ controlId, descriptionId, labelId }) => (
            <CustomNumberField
                id={controlId}
                value={settings.network.pollRateMs}
                min={50}
                max={2000}
                step={50}
                suffix="ms"
                ariaDescribedBy={descriptionId}
                ariaLabelledBy={labelId}
                onChange={(nextValue) => {
                  const parsed = Number(nextValue);
                  if (!Number.isFinite(parsed)) return;
                  onChange((prev) => ({
                    ...prev,
                    network: {
                      ...prev.network,
                      pollRateMs: parsed,
                    },
                  }));
                }}
              />
          )}
        </SettingsRow>
      </SectionBlock>

      <SectionBlock title="Recovery">
        <SettingsRow
          label="Auto Connect on Launch"
          description="Attempt connection as soon as the dashboard starts."
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.network.autoConnectOnLaunch}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  network: { ...prev.network, autoConnectOnLaunch: checked },
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
            />
          )}
        </SettingsRow>

        <SettingsRow
          label="Auto Reconnect on Drop"
          description="Retry after a disconnect is triggered."
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.network.autoReconnectOnDrop}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  network: { ...prev.network, autoReconnectOnDrop: checked },
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
            />
          )}
        </SettingsRow>

        <SettingsRow
          label="Reconnect Delay"
          description="Delay before each reconnect attempt."
        >
          {({ controlId, descriptionId, labelId }) => (
            <CustomNumberField
                id={controlId}
                value={settings.network.reconnectDelayMs}
                min={300}
                max={10000}
                step={100}
                suffix="ms"
                ariaDescribedBy={descriptionId}
                ariaLabelledBy={labelId}
                onChange={(nextValue) => {
                  const parsed = Number(nextValue);
                  if (!Number.isFinite(parsed)) return;
                  onChange((prev) => ({
                    ...prev,
                    network: {
                      ...prev.network,
                      reconnectDelayMs: parsed,
                    },
                  }));
                }}
              />
          )}
        </SettingsRow>
      </SectionBlock>
    </div>
  );
};

export default NetworkSettingsTab;
