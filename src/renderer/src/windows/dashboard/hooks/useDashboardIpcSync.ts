import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { WINDOW_DEFINITIONS } from "../components/Sidebar";
import type { LogType, WindowItem } from "../../../types/dashboard";
import type { AppState } from "../../../types/lmu";

const updateWindowOpenStatus = (
  windows: WindowItem[],
  id: string,
  isOpen: boolean
): WindowItem[] =>
  windows.map((windowItem) =>
    windowItem.id === id ? { ...windowItem, isOpen } : windowItem
  );

const hydrateOpenWindows = (openIds: string[]) => (prev: WindowItem[]) =>
  prev.map((windowItem) => ({
    ...windowItem,
    isOpen: openIds.includes(windowItem.id),
  }));

interface UseDashboardIpcSyncParams {
  setConnection: (status: AppState["connection"]) => void;
  setSession: (session: AppState["session"]) => void;
  setStandings: (standings: AppState["standings"]) => void;
  addLog: (message: string, type?: LogType) => void;
  setWindows: Dispatch<SetStateAction<WindowItem[]>>;
  closeOverlaysWhenControlCloses: boolean;
}

const useDashboardIpcSync = ({
  setConnection,
  setSession,
  setStandings,
  addLog,
  setWindows,
  closeOverlaysWhenControlCloses,
}: UseDashboardIpcSyncParams): void => {
  useEffect(() => {
    void globalThis.api
      .getState()
      .then((state: AppState) => {
        setConnection(state.connection);
        setSession(state.session);
        setStandings(state.standings);
      })
      .catch(() => {
        addLog("Unable to load the latest LMU state snapshot.", "ERROR");
      });

    const unsubState = globalThis.api.onStateUpdate((state: AppState) => {
      setSession(state.session);
      setStandings(state.standings);
    });

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
      const [message, type] = messages[status];
      addLog(message, type);
    });

    const unsubWinClosed = globalThis.api.windows.onClosed((id: string) => {
      setWindows((prev) => updateWindowOpenStatus(prev, id, false));
      const closed = WINDOW_DEFINITIONS.find((windowItem) => windowItem.id === id);
      if (closed) addLog(`${closed.label} was closed`, "WARNING");

      if (!closeOverlaysWhenControlCloses || id !== "OVERLAY-CONTROL") return;

      const overlayIds = [
        "OVERLAY-TOWER",
        "OVERLAY-DRIVER",
        "OVERLAY-GAP",
        "OVERLAY-SESSION",
      ];
      void Promise.allSettled(
        overlayIds.map(async (overlayId) => {
          await globalThis.api.windows.close(overlayId);
          setWindows((prev) => updateWindowOpenStatus(prev, overlayId, false));
        })
      ).then((results) => {
        if (results.some((result) => result.status === "rejected")) {
          addLog("One or more overlay windows failed to close cleanly.", "ERROR");
        }
      });
    });

    void globalThis.api.windows
      .getOpen()
      .then((openIds: string[]) => {
        setWindows(hydrateOpenWindows(openIds));
      })
      .catch(() => {
        addLog("Unable to determine which windows are already open.", "ERROR");
      });

    return () => {
      unsubState();
      unsubConn();
      unsubWinClosed();
    };
  }, [
    addLog,
    closeOverlaysWhenControlCloses,
    setConnection,
    setSession,
    setStandings,
    setWindows,
  ]);
};

export default useDashboardIpcSync;
