import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

interface CustomNumberFieldProps {
  value: number | string;
  onChange: (value: string) => void;
  allowDecimal?: boolean;
  allowNegative?: boolean;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  containerClassName?: string;
  disabled?: boolean;
  id?: string;
  inputClassName?: string;
  max?: number;
  min?: number;
  step?: number;
  suffix?: string;
  widthMode?: "content" | "fill";
}

function sanitizeDraft(
  raw: string,
  allowDecimal: boolean,
  allowNegative: boolean
): string {
  let next = raw.replace(allowDecimal ? /[^0-9.-]/g : /[^0-9-]/g, "");
  if (!allowNegative) next = next.replace(/-/g, "");
  else next = next.replace(/(?!^)-/g, "");
  if (!allowDecimal) return next;

  const sign = next.startsWith("-") ? "-" : "";
  const unsigned = sign ? next.slice(1) : next;
  const [whole = "", ...rest] = unsigned.split(".");
  return `${sign}${whole}${rest.length > 0 ? `.${rest.join("")}` : ""}`;
}

function parseDraft(value: string): number | null {
  if (value === "" || value === "-" || value === "." || value === "-.") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function clampValue(value: number, min?: number, max?: number): number {
  if (typeof min === "number") value = Math.max(min, value);
  if (typeof max === "number") value = Math.min(max, value);
  return value;
}

function getPrecision(step: number): number {
  const text = String(step);
  const dotIndex = text.indexOf(".");
  return dotIndex === -1 ? 0 : text.length - dotIndex - 1;
}

function formatValue(value: number, step: number): string {
  const precision = getPrecision(step);
  return precision === 0
    ? String(Math.round(value))
    : value.toFixed(precision).replace(/\.?0+$/, "");
}

const CustomNumberField = ({
  value,
  onChange,
  allowDecimal = false,
  allowNegative = false,
  ariaDescribedBy,
  ariaInvalid,
  ariaLabel,
  ariaLabelledBy,
  containerClassName,
  disabled = false,
  id,
  inputClassName,
  max,
  min,
  step = 1,
  suffix,
  widthMode = "content",
}: CustomNumberFieldProps): React.ReactElement => {
  const [draft, setDraft] = useState(String(value));
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (isFocusedRef.current) return;
    setDraft(String(value));
  }, [value]);

  const commitValue = useCallback(
    (nextDraft: string): void => {
      const parsed = parseDraft(nextDraft);
      if (parsed === null) {
        setDraft(String(value));
        return;
      }
      const normalized = formatValue(clampValue(parsed, min, max), step);
      setDraft(normalized);
      onChange(normalized);
    },
    [max, min, onChange, step, value]
  );

  const handleChange = useCallback(
    (raw: string): void => {
      const sanitized = sanitizeDraft(raw, allowDecimal, allowNegative);
      setDraft(sanitized);
      if (parseDraft(sanitized) !== null) onChange(sanitized);
    },
    [allowDecimal, allowNegative, onChange]
  );

  const handleBlur = useCallback((): void => {
    isFocusedRef.current = false;
    commitValue(draft);
  }, [commitValue, draft]);

  const handleFocus = useCallback((): void => {
    isFocusedRef.current = true;
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const base = parseDraft(draft) ?? parseDraft(String(value)) ?? 0;
        const delta = event.key === "ArrowUp" ? step : -step;
        const nextValue = formatValue(clampValue(base + delta, min, max), step);
        setDraft(nextValue);
        onChange(nextValue);
        return;
      }
      if (event.key === "Enter") {
        commitValue(draft);
        event.currentTarget.blur();
      }
    },
    [commitValue, draft, max, min, onChange, step, value]
  );

  const inputStyle = useMemo<CSSProperties | undefined>(() => {
    if (widthMode !== "content") return undefined;
    const width = Math.min(10, Math.max(3, draft.length === 0 ? 3 : draft.length + 1));
    return { width: `${width}ch` };
  }, [draft, widthMode]);

  return (
    <div className={`inline-flex items-center gap-2 ${containerClassName ?? ""}`}>
      <div
        className={`inline-flex items-center rounded-md border border-rd-border bg-rd-elevated px-2.5 py-1.5 transition-colors focus-within:border-rd-accent/60 ${
          widthMode === "fill" ? "w-full" : ""
        } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
      >
        <input
          id={id}
          type="text"
          value={draft}
          inputMode={allowDecimal || allowNegative ? "decimal" : "numeric"}
          spellCheck={false}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          onBlur={handleBlur}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className={`bg-transparent font-mono text-xs text-rd-text outline-none ${
            widthMode === "fill" ? "w-full min-w-0" : "min-w-0"
          } text-right ${inputClassName ?? ""}`}
          style={inputStyle}
        />
      </div>
      {suffix ? <span className="text-xs text-rd-muted">{suffix}</span> : null}
    </div>
  );
};

export default CustomNumberField;
