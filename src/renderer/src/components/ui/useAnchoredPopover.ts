import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject
} from 'react'

interface UseAnchoredPopoverOptions {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly width: number
  readonly fallbackHeight: number
  readonly ignoredClosestSelector?: string
  readonly viewportMargin?: number
  readonly popoverMargin?: number
}

interface UseAnchoredPopoverResult<
  TriggerElement extends HTMLElement,
  PopoverElement extends HTMLElement
> {
  readonly triggerRef: RefObject<TriggerElement | null>
  readonly popoverRef: RefObject<PopoverElement | null>
  readonly popoverStyle: CSSProperties
}

const DEFAULT_VIEWPORT_MARGIN_PX = 8
const DEFAULT_POPOVER_MARGIN_PX = 8

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export function useAnchoredPopover<
  TriggerElement extends HTMLElement,
  PopoverElement extends HTMLElement
>({
  isOpen,
  onClose,
  width: preferredWidth,
  fallbackHeight,
  ignoredClosestSelector,
  viewportMargin = DEFAULT_VIEWPORT_MARGIN_PX,
  popoverMargin = DEFAULT_POPOVER_MARGIN_PX
}: UseAnchoredPopoverOptions): UseAnchoredPopoverResult<TriggerElement, PopoverElement> {
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({})
  const triggerRef = useRef<TriggerElement | null>(null)
  const popoverRef = useRef<PopoverElement | null>(null)

  useLayoutEffect(() => {
    if (!isOpen) return

    const updatePosition = (): void => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return

      const width = Math.min(preferredWidth, window.innerWidth - viewportMargin * 2)
      const maxHeight = window.innerHeight - viewportMargin * 2
      const measuredHeight = Math.min(maxHeight, popoverRef.current?.offsetHeight ?? fallbackHeight)
      const availableAbove = rect.top - viewportMargin - popoverMargin
      const availableBelow = window.innerHeight - rect.bottom - viewportMargin - popoverMargin
      const openAbove = availableBelow < measuredHeight && availableAbove > availableBelow
      const left = clamp(
        rect.right - width,
        viewportMargin,
        window.innerWidth - width - viewportMargin
      )

      setPopoverStyle({
        left,
        maxHeight,
        top: openAbove
          ? Math.max(viewportMargin, rect.top - measuredHeight - popoverMargin)
          : Math.max(
              viewportMargin,
              Math.min(
                rect.bottom + popoverMargin,
                window.innerHeight - measuredHeight - viewportMargin
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
  }, [fallbackHeight, isOpen, popoverMargin, preferredWidth, viewportMargin])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (triggerRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      if (
        ignoredClosestSelector &&
        target instanceof Element &&
        target.closest(ignoredClosestSelector)
      ) {
        return
      }

      onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [ignoredClosestSelector, isOpen, onClose])

  return { triggerRef, popoverRef, popoverStyle }
}
