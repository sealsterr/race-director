import React from 'react'
import type { DashboardSettings } from '../../../settings/types'
import { getPendingSettingCopy } from '../pendingSettings'
import { SectionBlock, SettingsRow, SettingsToggle } from '../SettingsPrimitives'
import UpdateCheckerRow from './UpdateCheckerRow'

interface AdvancedSettingsTabProps {
  settings: DashboardSettings
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void
  onResetPanelLayouts: () => Promise<void>
  onResetWindowSizes: () => Promise<void>
  onResetQuitConfirm: () => Promise<void>
}

const AdvancedSettingsTab = ({
  settings,
  onChange,
  onResetPanelLayouts,
  onResetWindowSizes,
  onResetQuitConfirm
}: AdvancedSettingsTabProps): React.ReactElement => {
  const compactRowsSetting = getPendingSettingCopy('advanced.compactTelemetryRows')
  const verboseLogsSetting = getPendingSettingCopy('advanced.verboseLogs')

  return (
    <div className="flex flex-col gap-3">
      <SectionBlock title="Behavior">
        <SettingsRow label="Reduce Motion" description="Limit decorative animations.">
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.advanced.reduceMotion}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  advanced: { ...prev.advanced, reduceMotion: checked }
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
            />
          )}
        </SettingsRow>

        <SettingsRow
          label="Compact Telemetry Rows"
          description={compactRowsSetting.description}
          badgeLabel={compactRowsSetting.badgeLabel}
          disabled
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.advanced.compactTelemetryRows}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  advanced: { ...prev.advanced, compactTelemetryRows: checked }
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
              disabled
            />
          )}
        </SettingsRow>

        <SettingsRow
          label="Verbose Logs"
          description={verboseLogsSetting.description}
          badgeLabel={verboseLogsSetting.badgeLabel}
          disabled
        >
          {({ descriptionId, labelId }) => (
            <SettingsToggle
              checked={settings.advanced.verboseLogs}
              onChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  advanced: { ...prev.advanced, verboseLogs: checked }
                }))
              }
              describedBy={descriptionId}
              labelledBy={labelId}
              disabled
            />
          )}
        </SettingsRow>
      </SectionBlock>

      <SectionBlock title="Tools">
        <UpdateCheckerRow />

        <SettingsRow
          label="Reset Panel Layout"
          description="Restores the dashboard panel to its default layout."
        >
          {({ descriptionId, labelId }) => (
            <button
              type="button"
              aria-describedby={descriptionId}
              aria-labelledby={labelId}
              onClick={() => void onResetPanelLayouts()}
              className="min-h-11 rounded-md border border-rd-accent/40 bg-rd-accent/10 px-3 py-1.5 text-xs font-semibold text-rd-text transition-colors hover:bg-rd-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface"
            >
              Reset
            </button>
          )}
        </SettingsRow>

        <SettingsRow
          label="Reset Window Size"
          description="Restores the dashboard to its default size."
        >
          {({ descriptionId, labelId }) => (
            <button
              type="button"
              aria-describedby={descriptionId}
              aria-labelledby={labelId}
              onClick={() => void onResetWindowSizes()}
              className="min-h-11 rounded-md border border-rd-accent/40 bg-rd-accent/10 px-3 py-1.5 text-xs font-semibold text-rd-text transition-colors hover:bg-rd-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface"
            >
              Reset
            </button>
          )}
        </SettingsRow>

        <SettingsRow
          label="Reset Quit Confirmation Flag"
          description="Forces the quit confirmation to appear again."
        >
          {({ descriptionId, labelId }) => (
            <button
              type="button"
              aria-describedby={descriptionId}
              aria-labelledby={labelId}
              onClick={() => void onResetQuitConfirm()}
              className="min-h-11 rounded-md border border-rd-warning/40 bg-rd-warning/10 px-3 py-1.5 text-xs font-semibold text-rd-warning transition-colors hover:bg-rd-warning/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-warning/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface"
            >
              Reset
            </button>
          )}
        </SettingsRow>
      </SectionBlock>
    </div>
  )
}

export default AdvancedSettingsTab
