import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export interface CustomSelectOption {
  label: string
  value: string
}

interface CustomSelectProps {
  value: string
  options: readonly CustomSelectOption[]
  onChange: (value: string) => void
  buttonClassName?: string
  disabled?: boolean
  id?: string
  optionClassName?: string
  placeholder?: string
  stopPropagation?: boolean
  title?: string
  ariaDescribedBy?: string
  ariaLabel?: string
  ariaLabelledBy?: string
}

const DEFAULT_BUTTON_CLASS =
  'flex h-10 items-center justify-between gap-2 rounded-md border border-rd-border bg-rd-elevated px-3 py-2 text-left text-sm text-rd-text outline-none transition-colors hover:border-rd-muted focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface'
const DEFAULT_OPTION_CLASS = 'px-3 py-2 text-sm text-rd-text transition-colors'
const MENU_MARGIN_PX = 4
const VIEWPORT_MARGIN_PX = 8
const MAX_MENU_HEIGHT_PX = 280

const CustomSelect = ({
  value,
  options,
  onChange,
  buttonClassName,
  disabled = false,
  id,
  optionClassName,
  placeholder = 'Select an option',
  stopPropagation = false,
  title,
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy
}: CustomSelectProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const optionRefs = useRef<Array<HTMLDivElement | null>>([])
  const baseId = useId()
  const listboxId = `${baseId}-listbox`

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value]
  )
  const selectedOption = selectedIndex >= 0 ? (options[selectedIndex] ?? null) : null

  const getOptionId = useCallback((index: number) => `${baseId}-option-${index}`, [baseId])

  const getOptionRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      optionRefs.current[index] = node
    },
    []
  )

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const open = useCallback(() => {
    if (disabled || options.length === 0) return
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setIsOpen(true)
  }, [disabled, options.length, selectedIndex])

  const toggle = useCallback(() => {
    if (isOpen) {
      close()
      return
    }
    open()
  }, [close, isOpen, open])

  const selectIndex = useCallback(
    (index: number) => {
      const option = options[index]
      if (!option) return
      onChange(option.value)
      close()
      triggerRef.current?.focus()
    },
    [close, onChange, options]
  )

  const moveHighlight = useCallback(
    (direction: 1 | -1) => {
      if (options.length === 0) return
      setHighlightedIndex((current) => {
        const next = current + direction
        if (next < 0) return options.length - 1
        if (next >= options.length) return 0
        return next
      })
    },
    [options.length]
  )

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return
      if (event.key === 'Tab') {
        close()
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (!isOpen) open()
        else moveHighlight(1)
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (!isOpen) open()
        else moveHighlight(-1)
        return
      }
      if (event.key === 'Home') {
        event.preventDefault()
        if (!isOpen) open()
        setHighlightedIndex(0)
        return
      }
      if (event.key === 'End') {
        event.preventDefault()
        if (!isOpen) open()
        setHighlightedIndex(Math.max(0, options.length - 1))
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!isOpen) open()
        else selectIndex(highlightedIndex)
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    },
    [close, disabled, highlightedIndex, isOpen, moveHighlight, open, options.length, selectIndex]
  )

  useLayoutEffect(() => {
    if (!isOpen) return
    const updatePosition = (): void => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const availableAbove = rect.top - VIEWPORT_MARGIN_PX - MENU_MARGIN_PX
      const availableBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN_PX - MENU_MARGIN_PX
      const preferredHeight = Math.min(MAX_MENU_HEIGHT_PX, options.length * 40 + 8)
      const openAbove = availableBelow < preferredHeight && availableAbove > availableBelow
      const maxHeight = Math.min(
        preferredHeight,
        Math.max(80, openAbove ? availableAbove : availableBelow)
      )
      setMenuStyle({
        left: rect.left,
        top: openAbove ? rect.top - maxHeight - MENU_MARGIN_PX : rect.bottom + MENU_MARGIN_PX,
        width: rect.width,
        maxHeight
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, options.length])

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (triggerRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      close()
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [close, isOpen])

  useEffect(() => {
    if (!isOpen) return
    optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [highlightedIndex, isOpen])

  const handleClick = stopPropagation
    ? (event: React.MouseEvent): void => event.stopPropagation()
    : undefined

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-activedescendant={isOpen ? getOptionId(highlightedIndex) : undefined}
        disabled={disabled}
        title={title}
        onClick={(event) => {
          handleClick?.(event)
          toggle()
        }}
        onKeyDown={handleTriggerKeyDown}
        className={`${DEFAULT_BUTTON_CLASS} ${buttonClassName ?? ''} ${
          disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
        }`}
      >
        <span className="min-w-0 flex-1 truncate">{selectedOption?.label ?? placeholder}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-rd-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen
        ? createPortal(
            <div
              ref={menuRef}
              data-rd-select-portal="true"
              role="listbox"
              id={listboxId}
              aria-label={ariaLabel}
              onMouseDown={handleClick}
              className="fixed z-[100] overflow-auto rounded-md border border-rd-border bg-rd-surface py-1 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
              style={menuStyle}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value
                const isHighlighted = index === highlightedIndex
                return (
                  <div
                    key={option.value}
                    ref={getOptionRef(index)}
                    id={getOptionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => selectIndex(index)}
                    className={`${DEFAULT_OPTION_CLASS} ${optionClassName ?? ''} ${
                      isHighlighted
                        ? 'bg-rd-accent text-rd-text'
                        : isSelected
                          ? 'bg-rd-accent/15 text-rd-text'
                          : 'text-rd-text hover:bg-rd-elevated'
                    } cursor-pointer`}
                  >
                    {option.label}
                  </div>
                )
              })}
            </div>,
            document.body
          )
        : null}
    </>
  )
}

export default CustomSelect
