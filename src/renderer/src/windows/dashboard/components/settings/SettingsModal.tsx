import React, { useMemo, useState } from "react";
import {
  Gauge,
  Network,
  MonitorPlay,
  Wrench,
  X,
} from "lucide-react";
import type { DashboardSettings, SettingsTabId } from "../../settings/types";
import DiscardSettingsPopup from "./DiscardSettingsPopup";
import useSettingsModalA11y from "./hooks/useSettingsModalA11y";
import AdvancedSettingsTab from "./tabs/AdvancedSettingsTab";
import GeneralSettingsTab from "./tabs/GeneralSettingsTab";
import NetworkSettingsTab from "./tabs/NetworkSettingsTab";
import OverlaySettingsTab from "./tabs/OverlaySettingsTab";

interface SettingsModalProps {
  hasUnsavedChanges: boolean;
  isOpen: boolean;
  settings: DashboardSettings;
  onChange: (updater: (prev: DashboardSettings) => DashboardSettings) => void;
  onClose: () => void;
  onSave: () => void;
  onResetDefaults: () => void;
  onResetPanelLayouts: () => Promise<void>;
  onResetWindowSizes: () => Promise<void>;
  onResetQuitConfirm: () => Promise<void>;
}

const SETTINGS_MODAL_TITLE_ID = "settings-modal-title";
const SETTINGS_MODAL_DESCRIPTION_ID = "settings-modal-description";

const TAB_ITEMS: ReadonlyArray<{
  id: SettingsTabId;
  label: string;
  icon: React.ReactElement;
}> = [
  { id: "general", label: "General", icon: <Gauge size={14} /> },
  { id: "network", label: "Network", icon: <Network size={14} /> },
  { id: "overlay", label: "Overlay", icon: <MonitorPlay size={14} /> },
  { id: "advanced", label: "Advanced", icon: <Wrench size={14} /> },
];

const SettingsModal = ({
  hasUnsavedChanges,
  isOpen,
  settings,
  onChange,
  onClose,
  onSave,
  onResetDefaults,
  onResetPanelLayouts,
  onResetWindowSizes,
  onResetQuitConfirm,
}: SettingsModalProps): React.ReactElement | null => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("general");
  const [showDiscardPopup, setShowDiscardPopup] = useState(false);
  const handleRequestClose = (): void => {
    if (hasUnsavedChanges) {
      setShowDiscardPopup(true);
      return;
    }
    onClose();
  };

  const {
    closeButtonRef,
    dialogRef,
    handleDialogKeyDown,
    handleTabKeyDown,
    requestClose,
    setTabRef,
  } = useSettingsModalA11y({
    activeTab,
    isOpen,
    onRequestClose: handleRequestClose,
    onTabChange: setActiveTab,
    tabs: TAB_ITEMS.map((tab) => tab.id),
  });

  React.useEffect(() => {
    if (isOpen) return;
    setShowDiscardPopup(false);
  }, [isOpen]);

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
    return (
      <AdvancedSettingsTab
        settings={settings}
        onChange={onChange}
        onResetPanelLayouts={onResetPanelLayouts}
        onResetWindowSizes={onResetWindowSizes}
        onResetQuitConfirm={onResetQuitConfirm}
      />
    );
  }, [activeTab, onChange, onResetPanelLayouts, onResetQuitConfirm, onResetWindowSizes, settings]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        requestClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-describedby={SETTINGS_MODAL_DESCRIPTION_ID}
        aria-labelledby={SETTINGS_MODAL_TITLE_ID}
        aria-modal="true"
        tabIndex={-1}
        className="relative flex h-full max-h-[620px] w-full max-w-[820px] flex-col overflow-hidden rounded-xl border border-rd-border bg-rd-surface/95 shadow-[0_28px_80px_rgba(0,0,0,0.75)]"
        onKeyDown={(event) => {
          if (showDiscardPopup) return;
          handleDialogKeyDown(event);
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-12 items-center border-b border-rd-border px-4">
          <h2
            id={SETTINGS_MODAL_TITLE_ID}
            className="text-xl font-semibold text-rd-text"
          >
            Settings
          </h2>
          <p id={SETTINGS_MODAL_DESCRIPTION_ID} className="sr-only">
            Configure dashboard behavior. Press Escape to close this dialog. If
            you have unsaved changes, closing requires confirmation.
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={requestClose}
            aria-label="Close settings"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md border border-rd-border text-rd-subtle transition-colors hover:border-rd-muted hover:text-rd-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface"
          >
            <X size={15} />
          </button>
        </div>

        <div
          role="tablist"
          aria-label="Settings sections"
          className="overflow-x-auto border-b border-rd-border bg-rd-bg/60"
        >
          <div className="mx-auto flex w-max min-w-full justify-center px-4">
            {TAB_ITEMS.map((tab, index) => {
              const isActive = tab.id === activeTab;
              const tabButtonId = `settings-tab-${tab.id}`;
              const tabPanelId = `settings-panel-${tab.id}`;
              return (
                <button
                  key={tab.id}
                  ref={(node) => setTabRef(index, node)}
                  type="button"
                  id={tabButtonId}
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                  aria-controls={tabPanelId}
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm ${
                    isActive
                      ? "border-rd-accent text-rd-text"
                      : "border-transparent text-rd-muted hover:text-rd-text"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          id={`settings-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`settings-tab-${activeTab}`}
          className="min-h-0 flex-1 overflow-y-auto p-4"
        >
          {currentPanel}
        </div>

        <div className="flex h-14 items-center gap-3 border-t border-rd-border bg-rd-bg/55 px-4">
          <div className="flex-1" />
          <button
            type="button"
            onClick={onResetDefaults}
            className="rounded-md border border-rd-border bg-rd-elevated px-4 py-2 text-sm font-semibold text-rd-text transition-colors hover:border-rd-muted hover:bg-rd-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={hasUnsavedChanges ? onSave : onClose}
            className="rounded-md border border-rd-accent/40 bg-rd-accent/15 px-4 py-2 text-sm font-semibold text-rd-text transition-colors hover:bg-rd-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-rd-surface"
          >
            {hasUnsavedChanges ? "Save & Close" : "Close"}
          </button>
        </div>

        {showDiscardPopup ? (
          <DiscardSettingsPopup
            onCancel={() => setShowDiscardPopup(false)}
            onConfirm={() => {
              setShowDiscardPopup(false);
              onClose();
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

export default SettingsModal;
