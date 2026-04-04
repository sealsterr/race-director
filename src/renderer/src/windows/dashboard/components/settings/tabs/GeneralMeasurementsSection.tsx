import React from 'react'
import CustomSelect from '../../../../../components/ui/CustomSelect'
import type { DashboardSettings } from '../../../settings/types'
import { SectionBlock, SettingsRow } from '../SettingsPrimitives'

interface GeneralMeasurementsSectionProps {
  settings: DashboardSettings
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void
}

type MeasurementSettingKey =
  | 'speedUnit'
  | 'temperatureUnit'
  | 'distanceUnit'
  | 'pressureUnit'

const MEASUREMENT_SETTING_DEFINITIONS: ReadonlyArray<{
  key: MeasurementSettingKey
  label: string
  description: string
  options: ReadonlyArray<{ label: string; value: string }>
}> = [
  {
    key: 'speedUnit',
    label: 'Speed',
    description: 'Choose shown speed values.',
    options: [
      { value: 'kph', label: 'Kilometers per hour (KPH)' },
      { value: 'mph', label: 'Miles per hour (MPH)' }
    ]
  },
  {
    key: 'temperatureUnit',
    label: 'Temperature',
    description: 'Default unit for ambient, tyre, and track temperatures.',
    options: [
      { value: 'c', label: 'Celsius (C)' },
      { value: 'f', label: 'Fahrenheit (F)' }
    ]
  },
  {
    key: 'distanceUnit',
    label: 'Distance',
    description: 'Control how distances and gaps are labeled.',
    options: [
      { value: 'km', label: 'Kilometers (km)' },
      { value: 'mi', label: 'Miles (mi)' }
    ]
  },
  {
    key: 'pressureUnit',
    label: 'Pressure',
    description: 'Unit for tyre pressure.',
    options: [
      { value: 'kpa', label: 'Kilopascals (kPa)' },
      { value: 'psi', label: 'Pounds per square inch (PSI)' },
      { value: 'bar', label: 'Bar' }
    ]
  }
]

const GeneralMeasurementsSection = ({
  settings,
  onChange
}: GeneralMeasurementsSectionProps): React.ReactElement => {
  return (
    <SectionBlock title="Measurements">
      {MEASUREMENT_SETTING_DEFINITIONS.map((definition) => (
        <SettingsRow
          key={definition.key}
          label={definition.label}
          description={definition.description}
        >
          {({ controlId, descriptionId, labelId }) => (
            <CustomSelect
              id={controlId}
              value={settings.general[definition.key]}
              options={definition.options}
              ariaDescribedBy={descriptionId}
              ariaLabelledBy={labelId}
              onChange={(value) =>
                onChange((prev) => ({
                  ...prev,
                  general: {
                    ...prev.general,
                    [definition.key]: value
                  }
                }))
              }
              buttonClassName="w-56 font-medium"
            />
          )}
        </SettingsRow>
      ))}
    </SectionBlock>
  )
}

export default GeneralMeasurementsSection
