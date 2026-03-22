import React from "react";

interface SettingsRowProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

const SettingsRow = ({
  label,
  description,
  children,
}: SettingsRowProps): React.ReactElement => {
  return (
    <div className="flex items-center gap-4 rounded-md px-3 py-2.5 transition-colors hover:bg-rd-elevated/80">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-rd-text">{label}</p>
        <p className="mt-1 text-xs leading-5 text-rd-muted">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
};

interface SettingsToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}

const SettingsToggle = ({
  checked,
  onChange,
  ariaLabel,
}: SettingsToggleProps): React.ReactElement => {
  return (
    <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
      <input
        type="checkbox"
        aria-label={ariaLabel}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="h-6 w-11 rounded-full border border-rd-border bg-rd-bg transition-colors peer-checked:border-rd-success/50 peer-checked:bg-rd-success/30" />
      <span className="pointer-events-none absolute left-1 h-4 w-4 rounded-full bg-rd-subtle transition-transform peer-checked:translate-x-5 peer-checked:bg-rd-success" />
    </label>
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
