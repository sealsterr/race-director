import React, {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DiscardSettingsPopupProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const DiscardSettingsPopup = ({
  onCancel,
  onConfirm,
}: DiscardSettingsPopupProps): React.ReactElement => {
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    popupRef.current?.querySelector<HTMLButtonElement>("[data-discard-cancel='true']")?.focus();
  }, []);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }

    if (event.key !== "Tab" || !popupRef.current) return;

    const focusable = Array.from(
      popupRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      )
    );
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    }
  };

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/68 px-4 py-6 backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        onCancel();
      }}
    >
      <div
        ref={popupRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="discard-settings-title"
        aria-describedby="discard-settings-description"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-[490px] overflow-hidden rounded-2xl border border-rd-accent/25 bg-rd-surface text-rd-text shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-rd-border px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rd-accent/12 text-rd-accent">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-rd-accent">
                Unsaved Changes
              </p>
              <h2
                id="discard-settings-title"
                className="mt-1 text-2xl font-semibold text-rd-text"
              >
                Discard changes?
              </h2>
            </div>
          </div>
          <button
            type="button"
            aria-label="Cancel discard"
            onClick={onCancel}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rd-border bg-rd-elevated text-rd-subtle transition-colors hover:border-rd-muted hover:text-rd-text"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p
            id="discard-settings-description"
            className="break-words text-sm leading-6 text-rd-muted"
          >
            You have unsaved changes. Are you sure you want to quit?
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-rd-border px-6 py-4">
          <button
            type="button"
            data-discard-cancel="true"
            onClick={onCancel}
            className="inline-flex items-center rounded-lg border border-rd-border bg-rd-elevated px-4 py-2 text-sm font-semibold text-rd-text transition-colors hover:border-rd-muted hover:bg-rd-bg"
          >
            Keep Editing
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg border border-rd-accent/30 bg-rd-accent/10 px-4 py-2 text-sm font-semibold text-rd-accent transition-colors hover:bg-rd-accent/20"
          >
            <Trash2 size={16} />
            Quit Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscardSettingsPopup;
