import React from 'react'
import CustomSelect from '../../../../../components/ui/CustomSelect'
import type { DashboardSettings } from '../../../settings/types'
import { getPendingSettingCopy } from '../pendingSettings'
import { SectionBlock, SettingsRow } from '../SettingsPrimitives'
import GeneralMeasurementsSection from './GeneralMeasurementsSection'
import GeneralThemeSection from './GeneralThemeSection'

interface GeneralSettingsTabProps {
  settings: DashboardSettings
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void
}

const GeneralSettingsTab = ({
  settings,
  onChange
}: GeneralSettingsTabProps): React.ReactElement => {
  const languageSetting = getPendingSettingCopy('general.language')

  return (
    <div className="flex flex-col gap-3">
      <SectionBlock title="Interface">
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
                { label: 'English', value: 'en' },
                { label: 'French', value: 'fr' },
                { label: 'German', value: 'de' }
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
  )
}

export default GeneralSettingsTab
