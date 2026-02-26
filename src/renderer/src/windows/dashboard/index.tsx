import React, { useState, useCallback, useEffect } from "react";
import TopBar from "./components/TopBar";
import Sidebar, { WINDOW_DEFINITIONS } from "./components/Sidebar";
import ConnectionPanel from "./components/ConnectionPanel";
import SessionPanel from "./components/SessionPanel";
import ActivityLog from "./components/ActivityLog";
import { useRaceStore } from "../../store/raceStore";
import type {
  LogEntry,
  LogType,
  WindowId,
  WindowItem,
} from "../../types/dashboard";
import type { AppState } from "../../types/lmu";

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

const mapWindowWithOpenStatus = (w: WindowItem, openIds: string[]) => ({
  ...w,
  isOpen: openIds.includes(w.id),
});

const hydrateOpenWindows = (openIds: string[]) => (prev: WindowItem[]) =>
  prev.map((w) => mapWindowWithOpenStatus(w, openIds));

const Dashboard = (): React.ReactElement => {
  const { connection, session, setConnection, setSession, setStandings } =
    useRaceStore();

  const [log, setLog] = useState<LogEntry[]>([
    createLogEntry("Race Director initialized.", "SYSTEM"),
    createLogEntry("Waiting for LMU connection...", "INFO"),
  ]);

  const [windows, setWindows] = useState<WindowItem[]>(
    WINDOW_DEFINITIONS.map((def) => ({ ...def, isOpen: false }))
  );

  const addLog = useCallback(
    (message: string, type: LogType = "INFO") => {
      setLog((prev) => [...prev, createLogEntry(message, type)]);
    },
    []
  );

  // -- subscribe to IPC events from main process --
  useEffect(() => {
    // -- hydrate with whatever state main process already has --
    globalThis.api.getState().then((state: AppState) => {
      setConnection(state.connection);
      setSession(state.session);
      setStandings(state.standings);
    });

    // -- live state updates from poll loop --
    const unsubState = globalThis.api.onStateUpdate((state: AppState) => {
      setSession(state.session);
      setStandings(state.standings);
    });

    // -- connection status changes --
    const unsubConn = globalThis.api.onConnectionChange((status) => {
      setConnection(status);

      const messages: Record<typeof status, [string, LogType]> = {
        CONNECTED: ["Connected to LMU API successfully!", "SUCCESS"],
        CONNECTING: ["Connecting to LMU API...", "INFO"],
        DISCONNECTED: ["Disconnected from LMU API!", "WARNING"],
        ERROR: [
          "Connection failed! Make sure Le Mans Ultimate is running.",
          "ERROR",
        ],
      };
      const [msg, type] = messages[status];
      addLog(msg, type);
    });

    // sync isOpen if user closes a child window via its own X button
    const unsubWinClosed = globalThis.api.windows.onClosed((id: string) => {
      setWindows((prev) => updateWindowOpenStatus(prev, id, false));
      const closed = WINDOW_DEFINITIONS.find((w) => w.id === id);
      if (closed) addLog(`${closed.label} was closed`, "WARNING");
    });

    // hydrate open windows on mount
    globalThis.api.windows.getOpen().then((openIds: string[]) => {
      setWindows(hydrateOpenWindows(openIds));
    });

    // -- remove listeners when component unmounts --
    return () => {
      unsubState();
      unsubConn();
      unsubWinClosed();
    };
  }, [setConnection, setSession, setStandings, addLog]);

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

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-rd-bg">
      <TopBar connection={connection} />

      <div className="flex min-h-0 flex-1">
        <Sidebar windows={windows} onLaunch={handleLaunch} />

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
          <div className="grid grid-cols-2 gap-3">
            <ConnectionPanel
              connection={connection}
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
    </div>
  );
};

export default Dashboard;