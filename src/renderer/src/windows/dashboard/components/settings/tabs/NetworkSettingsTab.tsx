import React from "react";
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
          label="LMU API Endpoint"
          description="Default endpoint used for manual and automatic connections."
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
          description="How often telemetry snapshots are requested from the API."
        >
          {({ controlId, descriptionId, labelId }) => (
            <div className="flex items-center gap-2">
              <input
                id={controlId}
                type="number"
                min={50}
                max={2000}
                step={50}
                value={settings.network.pollRateMs}
                aria-describedby={descriptionId}
                aria-labelledby={labelId}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    network: {
                      ...prev.network,
                      pollRateMs: Number(event.target.value),
                    },
                  }))
                }
                className="w-24 rounded-md border border-rd-border bg-rd-elevated px-2 py-1.5 text-right font-mono text-xs text-rd-text outline-none focus:border-rd-accent/60"
              />
              <span className="text-xs text-rd-muted">ms</span>
            </div>
          )}
        </SettingsRow>
      </SectionBlock>

      <SectionBlock title="Startup & Recovery">
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
          description="Retry after a disconnect triggered by API or game state."
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
          description="Delay before the reconnect attempt is fired."
        >
          {({ controlId, descriptionId, labelId }) => (
            <div className="flex items-center gap-2">
              <input
                id={controlId}
                type="number"
                min={300}
                max={10000}
                step={100}
                value={settings.network.reconnectDelayMs}
                aria-describedby={descriptionId}
                aria-labelledby={labelId}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    network: {
                      ...prev.network,
                      reconnectDelayMs: Number(event.target.value),
                    },
                  }))
                }
                className="w-24 rounded-md border border-rd-border bg-rd-elevated px-2 py-1.5 text-right font-mono text-xs text-rd-text outline-none focus:border-rd-accent/60"
              />
              <span className="text-xs text-rd-muted">ms</span>
            </div>
          )}
        </SettingsRow>
      </SectionBlock>
    </div>
  );
};

export default NetworkSettingsTab;
