import { useState, useCallback, JSX } from "react";
import TopBar from "./components/TopBar";
import Sidebar, { WINDOW_DEFINITIONS } from "./components/Sidebar";
import ConnectionPanel from "./components/ConnectionPanel";
import SessionPanel from "./components/SessionPanel";
import ActivityLog from "./components/ActivityLog";
import { useRaceStore } from "../../store/raceStore";
import type { LogEntry, LogType, WindowId, WindowItem } from "../../types/dashboard";

// -- helpers --

const createLogEntry = (
  message: string,
  type: LogType = "INFO"
): LogEntry => ({
  id: crypto.randomUUID(),
  timestamp: new Date(),
  type,
  message,
});

// -- component --

const Dashboard = (): JSX.Element => {
  const { connection, session, setConnection } = useRaceStore();

  const [log, setLog] = useState<LogEntry[]>([
    createLogEntry("Race Director initialized.", "SYSTEM"),
    createLogEntry("Waiting for LMU connection...", "INFO"),
  ]);

  const [windows, setWindows] = useState<WindowItem[]>(
    WINDOW_DEFINITIONS.map((def) => ({ ...def, isOpen: false }))
  );

  // -- logger --
  const addLog = useCallback(
    (message: string, type: LogType = "INFO") => {
      setLog((prev) => [...prev, createLogEntry(message, type)]);
    },
    []
  );

  // -- window launcher (electron ipc later) --
  const handleLaunch = useCallback(
    (id: WindowId) => {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === id ? { ...w, isOpen: !w.isOpen } : w
        )
      );
      const win = windows.find((w) => w.id === id);
      if (win) {
        const isCurrentlyOpen = win.isOpen;
        addLog(
          isCurrentlyOpen
            ? `Closed: ${win.label}`
            : `Launched: ${win.label}`,
          isCurrentlyOpen ? "WARNING" : "SUCCESS"
        );
      }
    },
    [windows, addLog]
  );

  // -- connection handler --
  const handleConnectionChange = useCallback(
    (status: Parameters<typeof setConnection>[0]) => {
      setConnection(status);
    },
    [setConnection]
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-rd-bg">
      {/* -- top bar -- */}
      <TopBar connection={connection} />

      {/* -- body -- */}
      <div className="flex min-h-0 flex-1">
        {/* -- sidebar -- */}
        <Sidebar windows={windows} onLaunch={handleLaunch} />

        {/* -- main content -- */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
          {/* -- top row: connection + session panels -- */}
          <div className="grid grid-cols-2 gap-3">
            <ConnectionPanel
              connection={connection}
              onConnectionChange={handleConnectionChange}
              onLog={addLog}
            />
            <SessionPanel session={session} />
          </div>

          {/* -- bottom: activity log, takes all remaining height -- */}
          <ActivityLog entries={log} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;