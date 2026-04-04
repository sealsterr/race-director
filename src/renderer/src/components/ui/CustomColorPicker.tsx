import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Pipette } from "lucide-react";

export const COLOR_PICKER_PORTAL_SELECTOR =
  "[data-rd-color-picker-portal='true']";

const VIEWPORT_MARGIN_PX = 8;
const POPOVER_MARGIN_PX = 8;
const DEFAULT_POPOVER_WIDTH_PX = 236;
const HEX_PATTERN = /^#?[0-9a-fA-F]{0,6}$/;
const FULL_HEX_PATTERN = /^#?[0-9a-fA-F]{6}$/;

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

interface HsvColor {
  h: number;
  s: number;
  v: number;
}

interface ColorPickerPanelProps {
  value: string;
  onChange: (value: string) => void;
  hexInputId?: string;
  className?: string;
}

interface CustomColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  ariaLabel?: string;
  title?: string;
  buttonClassName?: string;
  popoverClassName?: string;
  stopPropagation?: boolean;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const normalizeHex = (value: string): string => {
  const withHash = value.startsWith("#") ? value : `#${value}`;
  return withHash.toLowerCase();
};

const isValidHex = (value: string): boolean => FULL_HEX_PATTERN.test(value);

const hexToRgb = (value: string): RgbColor => {
  const normalized = normalizeHex(value);
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
};

const rgbToHex = ({ r, g, b }: RgbColor): string =>
  `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;

const rgbToHsv = ({ r, g, b }: RgbColor): HsvColor => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === red) h = 60 * (((green - blue) / delta) % 6);
    else if (max === green) h = 60 * ((blue - red) / delta + 2);
    else h = 60 * ((red - green) / delta + 4);
  }

  return {
    h: h < 0 ? h + 360 : h,
    s: max === 0 ? 0 : delta / max,
    v: max,
  };
};

const hsvToRgb = ({ h, s, v }: HsvColor): RgbColor => {
  const hue = ((h % 360) + 360) % 360;
  const chroma = v * s;
  const segment = hue / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;

  if (segment >= 0 && segment < 1) {
    red = chroma;
    green = x;
  } else if (segment < 2) {
    red = x;
    green = chroma;
  } else if (segment < 3) {
    green = chroma;
    blue = x;
  } else if (segment < 4) {
    green = x;
    blue = chroma;
  } else if (segment < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const match = v - chroma;
  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
  };
};

const ColorPickerPanel = ({
  value,
  onChange,
  hexInputId,
  className,
}: ColorPickerPanelProps): React.ReactElement => {
  const normalizedValue = useMemo(
    () => (isValidHex(value) ? normalizeHex(value) : "#dc2626"),
    [value]
  );
  const [draftHex, setDraftHex] = useState(normalizedValue.toUpperCase());
  const [rgbDraft, setRgbDraft] = useState(() => {
    const rgb = hexToRgb(normalizedValue);
    return { r: String(rgb.r), g: String(rgb.g), b: String(rgb.b) };
  });
  const [hsv, setHsv] = useState(() => rgbToHsv(hexToRgb(normalizedValue)));

  useEffect(() => {
    const rgb = hexToRgb(normalizedValue);
    setDraftHex(normalizedValue.toUpperCase());
    setRgbDraft({ r: String(rgb.r), g: String(rgb.g), b: String(rgb.b) });
    setHsv(rgbToHsv(rgb));
  }, [normalizedValue]);

  const syncFromHex = useCallback(
    (nextHex: string) => {
      const normalized = normalizeHex(nextHex);
      const rgb = hexToRgb(normalized);
      setDraftHex(normalized.toUpperCase());
      setRgbDraft({ r: String(rgb.r), g: String(rgb.g), b: String(rgb.b) });
      setHsv(rgbToHsv(rgb));
      onChange(normalized);
    },
    [onChange]
  );

  const syncFromRgb = useCallback(
    (nextRgb: RgbColor) => {
      syncFromHex(rgbToHex(nextRgb));
    },
    [syncFromHex]
  );

  const syncFromHsv = useCallback(
    (nextHsv: HsvColor) => {
      const bounded = {
        h: clamp(nextHsv.h, 0, 360),
        s: clamp(nextHsv.s, 0, 1),
        v: clamp(nextHsv.v, 0, 1),
      };
      setHsv(bounded);
      syncFromRgb(hsvToRgb(bounded));
    },
    [syncFromRgb]
  );

  const commitHex = useCallback(() => {
    if (!isValidHex(draftHex)) {
      setDraftHex(normalizedValue.toUpperCase());
      return;
    }
    syncFromHex(draftHex);
  }, [draftHex, normalizedValue, syncFromHex]);

  const updateRgbChannel = useCallback(
    (channel: keyof RgbColor, raw: string) => {
      if (!/^\d{0,3}$/.test(raw)) return;
      setRgbDraft((current) => ({ ...current, [channel]: raw }));
      if (raw === "") return;

      const nextValue = clamp(Number(raw), 0, 255);
      const currentRgb = hexToRgb(normalizedValue);
      syncFromRgb({ ...currentRgb, [channel]: nextValue });
    },
    [normalizedValue, syncFromRgb]
  );

  const commitRgbChannel = useCallback(
    (channel: keyof RgbColor) => {
      const raw = rgbDraft[channel];
      if (raw === "") {
        const rgb = hexToRgb(normalizedValue);
        setRgbDraft((current) => ({ ...current, [channel]: String(rgb[channel]) }));
        return;
      }

      const nextValue = clamp(Number(raw), 0, 255);
      const currentRgb = hexToRgb(normalizedValue);
      syncFromRgb({ ...currentRgb, [channel]: nextValue });
    },
    [normalizedValue, rgbDraft, syncFromRgb]
  );

  const beginSquareDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const element = event.currentTarget;
      const updateFromPointer = (clientX: number, clientY: number): void => {
        const rect = element.getBoundingClientRect();
        syncFromHsv({
          ...hsv,
          s: clamp((clientX - rect.left) / rect.width, 0, 1),
          v: clamp(1 - (clientY - rect.top) / rect.height, 0, 1),
        });
      };

      updateFromPointer(event.clientX, event.clientY);
      const handleMove = (moveEvent: PointerEvent): void => {
        updateFromPointer(moveEvent.clientX, moveEvent.clientY);
      };
      const handleUp = (): void => {
        window.removeEventListener("pointermove", handleMove);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp, { once: true });
    },
    [hsv, syncFromHsv]
  );

  const beginHueDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const element = event.currentTarget;
      const updateFromPointer = (clientX: number): void => {
        const rect = element.getBoundingClientRect();
        syncFromHsv({
          ...hsv,
          h: clamp(((clientX - rect.left) / rect.width) * 360, 0, 360),
        });
      };

      updateFromPointer(event.clientX);
      const handleMove = (moveEvent: PointerEvent): void => {
        updateFromPointer(moveEvent.clientX);
      };
      const handleUp = (): void => {
        window.removeEventListener("pointermove", handleMove);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp, { once: true });
    },
    [hsv, syncFromHsv]
  );

  const huePercent = `${(hsv.h / 360) * 100}%`;

  return (
    <div
      className={`w-full rounded-xl border border-rd-border bg-rd-surface text-rd-text shadow-[0_18px_50px_rgba(0,0,0,0.42)] ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 border-b border-rd-border bg-rd-elevated/65 px-2 py-1.5">
        <div
          className="h-8 w-8 shrink-0 rounded-lg border border-rd-border shadow-sm"
          style={{ backgroundColor: normalizedValue }}
        />
        <div className="min-w-0 flex-1">
          <label
            htmlFor={hexInputId}
            className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-rd-muted"
          >
            Hex
          </label>
          <input
            id={hexInputId}
            type="text"
            value={draftHex}
            spellCheck={false}
            inputMode="text"
            onChange={(event) => {
              if (!HEX_PATTERN.test(event.target.value)) return;
              setDraftHex(event.target.value.toUpperCase());
            }}
            onBlur={commitHex}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              commitHex();
              event.currentTarget.blur();
            }}
            className="w-full rounded-lg border border-rd-border bg-rd-surface px-2 py-1.5 font-mono text-xs uppercase text-rd-text outline-none transition-colors focus:border-rd-accent/70"
          />
        </div>
      </div>

      <div className="p-1.5">
        <div
          role="presentation"
          onPointerDown={beginSquareDrag}
          className="relative h-26 cursor-crosshair overflow-hidden rounded-lg border border-rd-border touch-none"
          style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.6)]"
            style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
          />
        </div>

        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md border border-rd-border bg-rd-elevated text-rd-muted">
            <Pipette size={12} />
          </div>
          <div className="relative flex-1">
            <div
              role="presentation"
              onPointerDown={beginHueDrag}
              className="h-2.5 cursor-ew-resize rounded-full border border-rd-border shadow-inner touch-none"
              style={{
                background:
                  "linear-gradient(90deg, #ff0000 0%, #ffff00 16.66%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.66%, #ff00ff 83.33%, #ff0000 100%)",
              }}
            />
            <div
              className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(15,23,42,0.45)]"
              style={{ left: huePercent, backgroundColor: normalizedValue }}
            />
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1">
          {(["r", "g", "b"] as const).map((channel) => (
            <label key={channel} className="flex flex-col gap-1">
              <input
                type="text"
                inputMode="numeric"
                value={rgbDraft[channel]}
                onChange={(event) => updateRgbChannel(channel, event.target.value)}
                onBlur={() => commitRgbChannel(channel)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  commitRgbChannel(channel);
                  event.currentTarget.blur();
                }}
                className="w-full rounded-md border border-rd-border bg-rd-elevated px-1.5 py-1.5 text-center font-mono text-xs text-rd-text outline-none transition-colors focus:border-rd-accent/70"
              />
              <span className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-rd-muted">
                {channel}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const CustomColorPicker = ({
  value,
  onChange,
  id,
  ariaLabel,
  title,
  buttonClassName,
  popoverClassName,
  stopPropagation = false,
}: CustomColorPickerProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId();
  const hexInputId = `${baseId}-hex`;

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((current) => !current), []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    const updatePosition = (): void => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(DEFAULT_POPOVER_WIDTH_PX, window.innerWidth - VIEWPORT_MARGIN_PX * 2);
      const maxHeight = window.innerHeight - VIEWPORT_MARGIN_PX * 2;
      const measuredHeight = Math.min(
        maxHeight,
        popoverRef.current?.offsetHeight ?? 280
      );
      const availableAbove = rect.top - VIEWPORT_MARGIN_PX - POPOVER_MARGIN_PX;
      const availableBelow =
        window.innerHeight - rect.bottom - VIEWPORT_MARGIN_PX - POPOVER_MARGIN_PX;
      const openAbove =
        availableBelow < measuredHeight && availableAbove > availableBelow;
      const left = clamp(
        rect.right - width,
        VIEWPORT_MARGIN_PX,
        window.innerWidth - width - VIEWPORT_MARGIN_PX
      );
      setPopoverStyle({
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
        width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      close();
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [close, isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        title={title}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={(event) => {
          if (stopPropagation) event.stopPropagation();
          toggle();
        }}
        className={`flex h-7 w-7 items-center justify-center rounded-md border border-rd-border bg-rd-elevated p-0.5 outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface ${buttonClassName ?? ""}`}
      >
        <span
          className="h-full w-full rounded-[5px] border border-white/15"
          style={{ backgroundColor: value }}
        />
      </button>

      {isOpen
        ? createPortal(
            <div
              ref={popoverRef}
              data-rd-color-picker-portal="true"
              onMouseDown={stopPropagation ? (event) => event.stopPropagation() : undefined}
              className={`fixed z-[120] overflow-visible ${popoverClassName ?? ""}`}
              style={popoverStyle}
            >
              <div className="max-h-full overflow-y-auto rounded-xl">
                <ColorPickerPanel
                  value={value}
                  onChange={onChange}
                  hexInputId={hexInputId}
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
};

export { ColorPickerPanel };
export default CustomColorPicker;
