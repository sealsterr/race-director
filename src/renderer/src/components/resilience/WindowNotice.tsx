import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  TriangleAlert,
} from "lucide-react";

type WindowNoticeTone = "info" | "success" | "warning" | "error";

interface WindowNoticeProps {
  title: string;
  description: string;
  tone?: WindowNoticeTone;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  compact?: boolean;
  className?: string;
}

const toneMap: Record<
  WindowNoticeTone,
  {
    icon: React.ReactElement;
    iconClass: string;
    panelClass: string;
    buttonClass: string;
  }
> = {
  info: {
    icon: <Info size={18} />,
    iconClass: "bg-rd-panel-strong/80 text-rd-muted",
    panelClass: "border-rd-border bg-rd-surface/92",
    buttonClass:
      "border-rd-border bg-rd-elevated text-rd-text hover:border-rd-muted hover:bg-rd-panel",
  },
  success: {
    icon: <CheckCircle2 size={18} />,
    iconClass: "bg-rd-success/16 text-rd-success",
    panelClass: "border-rd-success/25 bg-rd-surface/92",
    buttonClass:
      "border-rd-success/35 bg-rd-success/12 text-rd-success hover:bg-rd-success/20",
  },
  warning: {
    icon: <TriangleAlert size={18} />,
    iconClass: "bg-rd-warning/16 text-rd-warning",
    panelClass: "border-rd-warning/25 bg-rd-surface/94",
    buttonClass:
      "border-rd-warning/35 bg-rd-warning/12 text-rd-warning hover:bg-rd-warning/20",
  },
  error: {
    icon: <AlertTriangle size={18} />,
    iconClass: "bg-rd-error/16 text-rd-error",
    panelClass: "border-rd-error/25 bg-rd-surface/94",
    buttonClass:
      "border-rd-error/35 bg-rd-error/12 text-rd-error hover:bg-rd-error/20",
  },
};

const WindowNotice = ({
  title,
  description,
  tone = "info",
  actionLabel,
  onAction,
  actionDisabled = false,
  compact = false,
  className,
}: WindowNoticeProps): React.ReactElement => {
  const appearance = toneMap[tone];

  return (
    <div
      className={`w-full rounded-[1.25rem] border p-4 shadow-[var(--shadow-rd-soft)] ${
        compact ? "max-w-[24rem]" : "max-w-[34rem] p-5 sm:p-6"
      } ${appearance.panelClass} ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${appearance.iconClass}`}
        >
          {appearance.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="rd-wrap text-base font-semibold text-rd-text sm:text-lg">
            {title}
          </h2>
          <p className="rd-wrap mt-1 text-sm leading-6 text-rd-muted">
            {description}
          </p>
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              disabled={actionDisabled}
              className={`mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${appearance.buttonClass}`}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default WindowNotice;
