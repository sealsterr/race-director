import React from 'react'
import type { AccentPreset, ThemeColors } from '../../../settings/types'

interface ThemePresetButtonProps {
  preset: AccentPreset
  selected: boolean
  onSelect: () => void
}

interface CustomThemeButtonProps {
  colors: ThemeColors
  label: string
  selected: boolean
  onSelect: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const ThemeSwatches = ({ colors }: { colors: ThemeColors }): React.ReactElement => (
  <span className="flex shrink-0 items-center gap-1" aria-hidden="true">
    {[colors.background, colors.accent, colors.logoPrimary].map((color, index) => (
      <span
        key={`${color}-${index}`}
        className="h-4 w-4 rounded border border-white/20 shadow-sm"
        style={{ backgroundColor: color }}
      />
    ))}
  </span>
)

const ThemeButtonShell = ({
  colors,
  selected,
  label,
  children,
  onSelect,
  triggerRef
}: {
  colors: ThemeColors
  selected: boolean
  label: string
  children: React.ReactNode
  onSelect: () => void
  triggerRef?: React.RefObject<HTMLButtonElement | null>
}): React.ReactElement => (
  <button
    ref={triggerRef}
    type="button"
    role="radio"
    aria-checked={selected}
    aria-label={label}
    title={label}
    onClick={onSelect}
    className="grid h-10 w-full grid-cols-[1fr_auto] items-center gap-2 rounded-md border px-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface"
    style={{
      backgroundColor: colors.surface,
      borderColor: selected ? colors.accent : colors.border,
      color: colors.text,
      boxShadow: selected ? `inset 0 0 0 1px ${colors.accent}` : 'none'
    }}
  >
    {children}
  </button>
)

export const ThemePresetButton = ({
  preset,
  selected,
  onSelect
}: ThemePresetButtonProps): React.ReactElement => (
  <ThemeButtonShell colors={preset} selected={selected} label={preset.label} onSelect={onSelect}>
    <span className="min-w-0">
      <span className="block truncate text-xs font-semibold">{preset.label}</span>
    </span>
    <ThemeSwatches colors={preset} />
  </ThemeButtonShell>
)

export const CustomThemeButton = ({
  colors,
  label,
  selected,
  onSelect,
  triggerRef
}: CustomThemeButtonProps): React.ReactElement => (
  <ThemeButtonShell
    colors={colors}
    selected={selected}
    label={label}
    onSelect={onSelect}
    triggerRef={triggerRef}
  >
    <span className="min-w-0">
      <span className="block truncate text-xs font-semibold">{label}</span>
    </span>
    <ThemeSwatches colors={colors} />
  </ThemeButtonShell>
)
