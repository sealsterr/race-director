import React, { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../../../../i18n/I18nProvider'
import {
  ColorPickerPanel,
  COLOR_PICKER_PORTAL_SELECTOR
} from '../../../../../components/ui/CustomColorPicker'
import { useAnchoredPopover } from '../../../../../components/ui/useAnchoredPopover'
import {
  ACCENT_PRESETS,
  CUSTOM_ACCENT_PRESET_ID,
  getAccentPreset,
  resolveThemeColors
} from '../../../settings/defaults'
import type { DashboardSettings, PaletteColors } from '../../../settings/types'
import { SectionBlock, SettingsRow } from '../SettingsPrimitives'
import { CustomThemeButton, ThemePresetButton } from './ThemePresetButton'

interface GeneralThemeSectionProps {
  settings: DashboardSettings
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void
}

type PaletteColorKey = keyof PaletteColors

const PICKER_WIDTH_PX = 244
const CUSTOM_COLOR_FIELDS: Array<{
  key: PaletteColorKey
  label: string
  description: string
}> = [
  {
    key: 'accent',
    label: 'Accent',
    description: 'Highlights, active states, and selected controls.'
  },
  {
    key: 'logoPrimary',
    label: 'Primary',
    description: 'The brighter supporting brand tone used in titles and chips.'
  },
  {
    key: 'logoSecondary',
    label: 'Secondary',
    description: 'The darker companion tone used beside the primary color.'
  }
]

const updateAccentPreset = (
  previous: DashboardSettings,
  accentPreset: DashboardSettings['general']['accentPreset']
): DashboardSettings => {
  if (accentPreset === CUSTOM_ACCENT_PRESET_ID) {
    return {
      ...previous,
      general: {
        ...previous.general,
        accentPreset
      }
    }
  }

  const preset = getAccentPreset(accentPreset)
  return {
    ...previous,
    general: {
      ...previous.general,
      accentPreset,
      darkMode: preset.appearance === 'dark'
    }
  }
}

const updateCustomPaletteColor = (
  previous: DashboardSettings,
  key: PaletteColorKey,
  value: string
): DashboardSettings => ({
  ...previous,
  general: {
    ...previous.general,
    accentPreset: CUSTOM_ACCENT_PRESET_ID,
    customPalette: {
      ...previous.general.customPalette,
      [key]: value
    }
  }
})

const GeneralThemeSection = ({
  settings,
  onChange
}: GeneralThemeSectionProps): React.ReactElement => {
  const { t } = useI18n()
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [activeKey, setActiveKey] = useState<PaletteColorKey>('accent')
  const isCustomSelected = settings.general.accentPreset === CUSTOM_ACCENT_PRESET_ID
  const customColors = resolveThemeColors({
    ...settings.general,
    accentPreset: CUSTOM_ACCENT_PRESET_ID
  })
  const activeField =
    CUSTOM_COLOR_FIELDS.find((field) => field.key === activeKey) ?? CUSTOM_COLOR_FIELDS[0]

  const closePicker = useCallback(() => {
    setIsPickerOpen(false)
  }, [])
  const {
    triggerRef,
    popoverRef,
    popoverStyle: pickerStyle
  } = useAnchoredPopover<HTMLButtonElement, HTMLDivElement>({
    isOpen: isPickerOpen,
    onClose: closePicker,
    width: PICKER_WIDTH_PX,
    fallbackHeight: 340,
    ignoredClosestSelector: COLOR_PICKER_PORTAL_SELECTOR
  })

  return (
    <SectionBlock title={t('settings.general.section.theme')}>
      <SettingsRow
        label={t('settings.theme.palette.label')}
        description={t('settings.theme.palette.description')}
      >
        {({ descriptionId, labelId }) => (
          <div
            role="radiogroup"
            aria-describedby={descriptionId}
            aria-labelledby={labelId}
            className="grid max-h-[88px] w-[420px] max-w-full grid-cols-2 gap-2 overflow-y-auto pr-1"
          >
            {ACCENT_PRESETS.map((preset) => (
              <ThemePresetButton
                key={preset.id}
                preset={preset}
                selected={settings.general.accentPreset === preset.id}
                onSelect={() => onChange((prev) => updateAccentPreset(prev, preset.id))}
              />
            ))}

            <CustomThemeButton
              triggerRef={triggerRef}
              colors={customColors}
              selected={isCustomSelected}
              label={t('settings.theme.customPalette')}
              onSelect={() => {
                onChange((prev) => updateAccentPreset(prev, CUSTOM_ACCENT_PRESET_ID))
                setIsPickerOpen((current) => !current)
              }}
            />
          </div>
        )}
      </SettingsRow>

      {isPickerOpen
        ? createPortal(
            <div
              ref={popoverRef}
              data-rd-color-picker-portal="true"
              className="fixed z-[130] overflow-visible"
              style={pickerStyle}
            >
              <div className="max-h-full overflow-y-auto rounded-lg">
                <div className="rounded-lg border border-rd-border bg-rd-surface/96 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur">
                  <div className="grid grid-cols-3 gap-1.5">
                    {CUSTOM_COLOR_FIELDS.map((field) => {
                      const selected = field.key === activeKey
                      return (
                        <button
                          key={field.key}
                          type="button"
                          onClick={() => setActiveKey(field.key)}
                          className={`min-w-0 rounded-md border px-1 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                            selected
                              ? 'border-rd-accent/60 bg-rd-accent/12 text-rd-text'
                              : 'border-rd-border bg-rd-elevated text-rd-muted hover:border-rd-muted hover:text-rd-text'
                          }`}
                        >
                          {t(`settings.theme.color.${field.key}`)}
                        </button>
                      )
                    })}
                  </div>

                  <ColorPickerPanel
                    key={settings.general.customPalette[activeField.key]}
                    className="mt-2"
                    value={settings.general.customPalette[activeField.key]}
                    onChange={(value) =>
                      onChange((prev) => updateCustomPaletteColor(prev, activeField.key, value))
                    }
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </SectionBlock>
  )
}

export default GeneralThemeSection
