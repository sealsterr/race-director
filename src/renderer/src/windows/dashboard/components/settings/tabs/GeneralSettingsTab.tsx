import React from 'react'
import CustomSelect from '../../../../../components/ui/CustomSelect'
import { useI18n } from '../../../../../i18n/I18nProvider'
import type { DashboardSettings } from '../../../settings/types'
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
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-3">
      <SectionBlock title={t('settings.general.section.interface')}>
        <SettingsRow
          label={t('settings.general.language.label')}
          description={t('settings.general.language.description')}
        >
          {({ controlId, descriptionId, labelId }) => (
            <CustomSelect
              id={controlId}
              value={settings.general.language}
              options={[
                { label: t('settings.language.en'), value: 'en' },
                { label: t('settings.language.fr'), value: 'fr' },
                { label: t('settings.language.de'), value: 'de' }
              ]}
              ariaDescribedBy={descriptionId}
              ariaLabelledBy={labelId}
              onChange={(value) =>
                onChange((prev) => ({
                  ...prev,
                  general: {
                    ...prev.general,
                    language: value as DashboardSettings['general']['language']
                  }
                }))
              }
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
