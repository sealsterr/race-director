import React, { useMemo, useState } from "react";
import {
  Gauge,
  Network,
  MonitorPlay,
  AudioLines,
  Wrench,
  X,
} from "lucide-react";
import type { DashboardSettings, SettingsTabId } from "../../settings/types";
import AdvancedSettingsTab from "./tabs/AdvancedSettingsTab";
import AudioSettingsTab from "./tabs/AudioSettingsTab";
import GeneralSettingsTab from "./tabs/GeneralSettingsTab";
import NetworkSettingsTab from "./tabs/NetworkSettingsTab";
import OverlaySettingsTab from "./tabs/OverlaySettingsTab";

interface SettingsModalProps {
  isOpen: boolean;
  settings: DashboardSettings;
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void;
  onClose: () => void;
  onSave: () => void;
  onResetDefaults: () => void;
  onResetQuitConfirm: () => Promise<void>;
}

const TAB_ITEMS: Array<{
  id: SettingsTabId;
  label: string;
  icon: React.ReactElement;
}> = [
  { id: "general", label: "General", icon: <Gauge size={14} /> },
  { id: "network", label: "Network", icon: <Network size={14} /> },
  { id: "overlay", label: "Overlay", icon: <MonitorPlay size={14} /> },
  { id: "audio", label: "Audio", icon: <AudioLines size={14} /> },
  { id: "advanced", label: "Advanced", icon: <Wrench size={14} /> },
];

const SettingsModal = ({
  isOpen,
  settings,
  onChange,
  onClose,
  onSave,
  onResetDefaults,
  onResetQuitConfirm,
}: SettingsModalProps): React.ReactElement | null => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");

  const currentPanel = useMemo(() => {
    if (activeTab === "general") {
      return <GeneralSettingsTab settings={settings} onChange={onChange} />;
    }
    if (activeTab === "network") {
      return <NetworkSettingsTab settings={settings} onChange={onChange} />;
    }
    if (activeTab === "overlay") {
      return <OverlaySettingsTab settings={settings} onChange={onChange} />;
    }
    if (activeTab === "audio") {
      return <AudioSettingsTab settings={settings} onChange={onChange} />;
    }
    return (
      <AdvancedSettingsTab
        settings={settings}
        onChange={onChange}
        onResetQuitConfirm={onResetQuitConfirm}
      />
    );
  }, [activeTab, onChange, onResetQuitConfirm, settings]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="flex h-full max-h-[620px] w-full max-w-[820px] flex-col overflow-hidden rounded-xl border border-rd-border bg-rd-surface/95 shadow-[0_28px_80px_rgba(0,0,0,0.75)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-12 items-center border-b border-rd-border px-4">
          <h2 className="text-xl font-semibold text-rd-text">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md border border-rd-border text-rd-subtle transition-colors hover:border-rd-muted hover:text-rd-text"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex border-b border-rd-border bg-rd-bg/60 px-4">
          {TAB_ITEMS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm ${
                  isActive
                    ? "border-rd-accent text-rd-text"
                    : "border-transparent text-rd-muted hover:text-rd-text"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_48%)] p-4">
          {currentPanel}
        </div>

        <div className="flex h-14 items-center gap-3 border-t border-rd-border bg-rd-bg/55 px-4">
          <div className="flex-1" />
          <button
            type="button"
            onClick={onResetDefaults}
            className="rounded-md border border-rd-border bg-rd-elevated px-4 py-2 text-sm font-semibold text-rd-text transition-colors hover:border-rd-muted hover:bg-rd-bg"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-md border border-rd-accent/40 bg-rd-accent/15 px-4 py-2 text-sm font-semibold text-rd-text transition-colors hover:bg-rd-accent/25"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
