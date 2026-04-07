import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties
} from 'react'
import { createPortal } from 'react-dom'
import { Pipette } from 'lucide-react'
import {
  ColorPickerPanel,
  COLOR_PICKER_PORTAL_SELECTOR
} from '../../../../../components/ui/CustomColorPicker'
import { ACCENT_PRESETS, CUSTOM_ACCENT_PRESET_ID } from '../../../settings/defaults'
import type { DashboardSettings, PaletteColors } from '../../../settings/types'
import { SectionBlock, SettingsRow, SettingsToggle } from '../SettingsPrimitives'

interface GeneralThemeSectionProps {
  settings: DashboardSettings
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void
}

type PaletteColorKey = keyof PaletteColors

const VIEWPORT_MARGIN_PX = 8
const POPOVER_MARGIN_PX = 8
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
): DashboardSettings => ({
  ...previous,
  general: {
    ...previous.general,
    accentPreset
  }
})

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
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [activeKey, setActiveKey] = useState<PaletteColorKey>('accent')
  const [pickerStyle, setPickerStyle] = useState<CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const isCustomSelected = settings.general.accentPreset === CUSTOM_ACCENT_PRESET_ID
  const activeField =
    CUSTOM_COLOR_FIELDS.find((field) => field.key === activeKey) ?? CUSTOM_COLOR_FIELDS[0]

  const closePicker = useCallback(() => {
    setIsPickerOpen(false)
  }, [])

  useLayoutEffect(() => {
    if (!isPickerOpen) return
    const updatePosition = (): void => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const width = Math.min(PICKER_WIDTH_PX, window.innerWidth - VIEWPORT_MARGIN_PX * 2)
      const maxHeight = window.innerHeight - VIEWPORT_MARGIN_PX * 2
      const measuredHeight = Math.min(maxHeight, popoverRef.current?.offsetHeight ?? 340)
      const left = Math.min(
        Math.max(rect.right - width, VIEWPORT_MARGIN_PX),
        window.innerWidth - width - VIEWPORT_MARGIN_PX
      )
      const availableAbove = rect.top - VIEWPORT_MARGIN_PX - POPOVER_MARGIN_PX
      const availableBelow =
        window.innerHeight - rect.bottom - VIEWPORT_MARGIN_PX - POPOVER_MARGIN_PX
      const openAbove = availableBelow < measuredHeight && availableAbove > availableBelow

      setPickerStyle({
        left,
        maxHeight,
        top: openAbove
          ? Math.max(VIEWPORT_MARGIN_PX, rect.top - measuredHeight - POPOVER_MARGIN_PX)
          : Math.max(
              VIEWPORT_MARGIN_PX,
              Math.min(
                rect.bottom + POPOVER_MARGIN_PX,
                window.innerHeight - measuredHeight - VIEWPORT_MARGIN_PX
              )
            ),
        width
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isPickerOpen])

  useEffect(() => {
    if (!isPickerOpen) return
    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (triggerRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      if (target.closest(COLOR_PICKER_PORTAL_SELECTOR)) return
      closePicker()
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [closePicker, isPickerOpen])

  return (
    <SectionBlock title="Theme">
      <SettingsRow label="Dark Mode" description="Toggle dark mode.">
        {({ descriptionId, labelId }) => (
          <SettingsToggle
            checked={settings.general.darkMode}
            onChange={(checked) =>
              onChange((prev) => ({
                ...prev,
                general: { ...prev.general, darkMode: checked }
              }))
            }
            describedBy={descriptionId}
            labelledBy={labelId}
          />
        )}
      </SettingsRow>

      <SettingsRow
        label="Palette"
        description="Select a built-in palette or tune your own color set."
      >
        {({ descriptionId, labelId }) => (
          <div
            role="radiogroup"
            aria-describedby={descriptionId}
            aria-labelledby={labelId}
            className="flex max-w-[420px] flex-wrap justify-end gap-2"
          >
            {ACCENT_PRESETS.map((preset) => {
              const selected = settings.general.accentPreset === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={preset.label}
                  title={preset.label}
                  onClick={() => onChange((prev) => updateAccentPreset(prev, preset.id))}
                  className={`h-8 w-8 rounded-md border transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface ${
                    selected ? 'border-rd-text' : 'border-rd-border'
                  }`}
                  style={{ backgroundColor: preset.accent }}
                >
                  <span className="sr-only">{preset.label}</span>
                </button>
              )
            })}

            <button
              ref={triggerRef}
              type="button"
              role="radio"
              aria-checked={isCustomSelected}
              aria-label="Custom palette"
              title="Custom palette"
              onClick={() => {
                onChange((prev) => updateAccentPreset(prev, CUSTOM_ACCENT_PRESET_ID))
                setIsPickerOpen((current) => !current)
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-md border bg-transparent transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface ${
                isCustomSelected
                  ? 'border-rd-accent/70 text-rd-accent'
                  : 'border-rd-border text-rd-muted'
              }`}
            >
              <span className="sr-only">Custom palette</span>
              <Pipette size={14} />
            </button>
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
              <div className="max-h-full overflow-y-auto rounded-2xl">
                <div className="rounded-2xl border border-rd-border bg-rd-surface/96 p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur">
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
                          {field.label}
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
