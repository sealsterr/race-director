import React, { useState, useCallback } from "react";
import TopBar from "./components/TopBar";
import Sidebar, { WINDOW_DEFINITIONS } from "./components/Sidebar";
import ConnectionPanel from "./components/ConnectionPanel";
import SessionPanel from "./components/SessionPanel";
import ActivityLog from "./components/ActivityLog";
import SettingsModal from "./components/settings/SettingsModal";
import SystemPopups from "./components/system-popups/SystemPopups";
import useAppUpdater from "./hooks/useAppUpdater";
import useAutoReconnect from "./hooks/useAutoReconnect";
import useDashboardIpcSync from "./hooks/useDashboardIpcSync";
import useDashboardSettings from "./hooks/useDashboardSettings";
import useDashboardStartup from "./hooks/useDashboardStartup";
import useSystemPopups from "./hooks/useSystemPopups";
import { useRaceStore } from "../../store/raceStore";
import type { LogEntry, LogType, WindowId, WindowItem } from "../../types/dashboard";

const createLogEntry = (
  message: string,
  type: LogType = "INFO"
): LogEntry => ({
  id: crypto.randomUUID(),
  timestamp: new Date(),
  type,
  message,
});

const updateWindowOpenStatus = (
  windows: WindowItem[],
  id: string,
  isOpen: boolean
): WindowItem[] =>
  windows.map((w) => (w.id === id ? { ...w, isOpen } : w));

const Dashboard = (): React.ReactElement => {
  const { connection, session, setConnection, setSession, setStandings } =
    useRaceStore();
  const {
    settings,
    draftSettings,
    isSettingsOpen,
    scaledContainerStyle,
    openSettings,
    closeSettings,
    updateDraft,
    saveDraft,
    resetDraftToDefaults,
  } = useDashboardSettings();

  const [log, setLog] = useState<LogEntry[]>([
    createLogEntry("Race Director initialized.", "SYSTEM"),
    createLogEntry("Waiting for LMU connection...", "INFO"),
  ]);

  const [windows, setWindows] = useState<WindowItem[]>(
    WINDOW_DEFINITIONS.map((def) => ({ ...def, isOpen: false }))
  );
  const { updaterState, downloadUpdate } = useAppUpdater();
  const {
    showDisconnectNotice,
    showQuitConfirm,
    dontAskAgain,
    setDontAskAgain,
    dismissDisconnectNotice,
    cancelQuit,
    confirmQuit,
  } = useSystemPopups();

  const addLog = useCallback(
    (message: string, type: LogType = "INFO") => {
      setLog((prev) => {
        const next = [...prev, createLogEntry(message, type)];
        return next.slice(-settings.general.activityLogLimit);
      });
    },
    [settings.general.activityLogLimit]
  );

  const updateWindowOpen = useCallback((id: WindowId, isOpen: boolean) => {
    setWindows((prev) => updateWindowOpenStatus(prev, id, isOpen));
  }, []);

  useDashboardStartup({
    settings,
    onLog: addLog,
    onWindowOpenStatus: updateWindowOpen,
  });
  useAutoReconnect({ connection, settings, onLog: addLog });
  useDashboardIpcSync({
    setConnection,
    setSession,
    setStandings,
    addLog,
    setWindows,
    closeOverlaysWhenControlCloses: settings.overlay.closeOverlaysWhenControlCloses,
  });

  const handleLaunch = useCallback(
    async (id: WindowId) => {
      const win = windows.find((w) => w.id === id);
      if (!win) return;

      if (win.isOpen) {
        await globalThis.api.windows.close(id);
        setWindows((prev) => updateWindowOpenStatus(prev, id, false));
        addLog(`Closed ${win.label}`, "WARNING");
      } else {
        await globalThis.api.windows.open(id);
        setWindows((prev) => updateWindowOpenStatus(prev, id, true));
        addLog(`Launched ${win.label}`, "SUCCESS");
      }
    },
    [windows, addLog]
  );

  const handleSettingsClick = useCallback(() => {
    openSettings();
  }, [openSettings]);

  return (
    <div
      style={scaledContainerStyle}
      className="relative flex h-screen w-screen flex-col overflow-hidden bg-rd-bg"
    >
      <TopBar connection={connection} />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          windows={windows}
          onLaunch={handleLaunch}
          onSettingsClick={handleSettingsClick}
          updaterState={updaterState}
          onDownloadUpdate={downloadUpdate}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
          <div className="grid grid-cols-2 gap-3">
            <ConnectionPanel
              connection={connection}
              defaultApiUrl={settings.network.apiUrl}
              defaultPollRateMs={settings.network.pollRateMs}
              onConnectionChange={(status) => {
                setConnection(status);

                if (status === "DISCONNECTED" || status === "ERROR") {
                  setSession(null);
                  setStandings([]);
                }
              }}
              onLog={addLog}
            />
            <SessionPanel session={session} />
          </div>

          <ActivityLog entries={log} />
        </div>
      </div>

      <SystemPopups
        showDisconnectNotice={showDisconnectNotice}
        showQuitConfirm={showQuitConfirm}
        dontAskAgain={dontAskAgain}
        onDontAskAgainChange={setDontAskAgain}
        onDismissDisconnect={dismissDisconnectNotice}
        onCancelQuit={cancelQuit}
        onConfirmQuit={confirmQuit}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={draftSettings}
        onChange={updateDraft}
        onClose={closeSettings}
        onSave={saveDraft}
        onResetDefaults={resetDraftToDefaults}
        onResetQuitConfirm={globalThis.api.system.resetQuitConfirmPreference}
      />
    </div>
  );
};

export default Dashboard;
