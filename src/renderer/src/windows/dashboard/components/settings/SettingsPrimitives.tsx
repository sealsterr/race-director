import React, { useId } from "react";

interface SettingsRowProps {
  label: string;
  description: string;
  badgeLabel?: string;
  disabled?: boolean;
  children: (ids: SettingsFieldIds) => React.ReactNode;
}

interface SettingsFieldIds {
  controlId: string;
  descriptionId: string;
  labelId: string;
}

const SettingsRow = ({
  label,
  description,
  badgeLabel,
  disabled = false,
  children,
}: SettingsRowProps): React.ReactElement => {
  const baseId = useId();
  const ids: SettingsFieldIds = {
    controlId: `${baseId}-control`,
    descriptionId: `${baseId}-description`,
    labelId: `${baseId}-label`,
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-md px-3 py-2.5 transition-colors ${
        disabled ? "opacity-70" : "hover:bg-rd-elevated/80"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p
          id={ids.labelId}
          className="flex items-center gap-2 text-sm font-medium text-rd-text"
        >
          <span>{label}</span>
          {badgeLabel ? <SettingsBadge label={badgeLabel} /> : null}
        </p>
        <p
          id={ids.descriptionId}
          className="mt-1 text-xs leading-5 text-rd-muted"
        >
          {description}
        </p>
      </div>
      <div className="shrink-0" aria-disabled={disabled}>
        {children(ids)}
      </div>
    </div>
  );
};

interface SettingsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  describedBy: string;
  labelledBy: string;
  disabled?: boolean;
}

const SettingsToggle = ({
  checked,
  onChange,
  describedBy,
  labelledBy,
  disabled = false,
}: SettingsToggleProps): React.ReactElement => {
  return (
    <label
      className={`relative inline-flex h-6 w-11 items-center ${
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        aria-describedby={describedBy}
        aria-labelledby={labelledBy}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        role="switch"
        className="peer sr-only"
      />
      <span className="h-6 w-11 rounded-full border border-rd-border bg-rd-bg transition-colors peer-checked:border-rd-accent/50 peer-checked:bg-rd-accent/30 peer-disabled:border-rd-border/60 peer-disabled:bg-rd-elevated/40 peer-focus-visible:ring-2 peer-focus-visible:ring-rd-accent/70 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-rd-surface" />
      <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-rd-subtle transition-transform peer-checked:translate-x-5 peer-checked:bg-rd-accent peer-disabled:bg-rd-border" />
    </label>
  );
};

interface SettingsBadgeProps {
  label: string;
}

const SettingsBadge = ({ label }: SettingsBadgeProps): React.ReactElement => {
  return (
    <span className="rounded px-1 text-[8px] font-bold uppercase tracking-wide leading-4 bg-rd-logo-primary/20 text-rd-logo-primary">
      {label}
    </span>
  );
};

interface SectionBlockProps {
  title: string;
  children: React.ReactNode;
}

const SectionBlock = ({ title, children }: SectionBlockProps): React.ReactElement => {
  return (
    <section className="rounded-lg border border-rd-border/70 bg-rd-surface/70 p-3">
      <h3 className="border-b border-rd-border/80 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rd-accent">
        {title}
      </h3>
      <div className="mt-2 flex flex-col gap-1">{children}</div>
    </section>
  );
};

interface SettingsSectionTitleProps {
  title: string;
}

const SettingsSectionTitle = ({
  title,
}: SettingsSectionTitleProps): React.ReactElement => {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rd-subtle">
      {title}
    </p>
  );
};

export {
  SectionBlock,
  SettingsRow,
  SettingsSectionTitle,
  SettingsToggle,
};
export type { SettingsFieldIds };
