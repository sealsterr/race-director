import React from 'react'
import type { DashboardSettings } from '../../../settings/types'
import { SectionBlock, SettingsRow } from '../SettingsPrimitives'

interface GeneralMeasurementsSectionProps {
  settings: DashboardSettings
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void
}

const GeneralMeasurementsSection = ({
  settings,
  onChange
}: GeneralMeasurementsSectionProps): React.ReactElement => {
  return (
    <SectionBlock title="Measurements">
      <SettingsRow
        label="Speed Unit"
        description="Apply one speed unit across dashboard telemetry and every overlay readout."
      >
        {({ controlId, descriptionId, labelId }) => (
          <select
            id={controlId}
            value={settings.general.speedUnit}
            aria-describedby={descriptionId}
            aria-labelledby={labelId}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                general: {
                  ...prev.general,
                  speedUnit: event.target.value as DashboardSettings['general']['speedUnit']
                }
              }))
            }
            className="w-44 rounded-md border border-rd-border bg-rd-elevated px-3 py-2 text-sm font-medium text-rd-text outline-none transition-colors focus:border-rd-accent/60 focus-visible:ring-2 focus-visible:ring-rd-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface"
          >
            <option value="kph">KPH · Metric</option>
            <option value="mph">MPH · Imperial</option>
          </select>
        )}
      </SettingsRow>
    </SectionBlock>
  )
}

export default GeneralMeasurementsSection
