import { ipcMain, BrowserWindow } from "electron";
import { lmuClient } from "../api/lmuApi";
import type { AppState, ConnectionStatus } from "../../renderer/src/types/lmu";

/* 
    -- registers all IPC handlers for LMU API client --
    -- call once during app startup, passing main window reference --
*/
export const registerIpcHandlers = (_mainWindow: BrowserWindow): void => {
  // -- lmu:connect --
  // -- renderer calls: await window.api.connect(url, pollRate) --
  ipcMain.handle(
    "lmu:connect",
    async (_event, url: string, pollRate: number): Promise<void> => {
      lmuClient.configure(url, pollRate);

      // -- when state updates arrive from polling loop, push to renderer -- 
      lmuClient.setStateUpdateCallback((state: AppState) => {
        BrowserWindow.getAllWindows().forEach((win) => {
          if (!win.isDestroyed()) {
            win.webContents.send("lmu:stateUpdate", state);
          }
        });
      });

      // -- when connection status changes, push that too --
      lmuClient.setConnectionCallback((status: ConnectionStatus) => {
        BrowserWindow.getAllWindows().forEach((win) => {
          if (!win.isDestroyed()) {
            win.webContents.send("lmu:connectionChange", status);
          }
        });
      });

      await lmuClient.connect();
    }
  );

  // -- lmu:focusVehicle --
  ipcMain.handle(
    "lmu:focusVehicle",
    async (_event, slotId: number): Promise<void> => {
      await lmuClient.focusVehicle(slotId);
    }
  );

  // -- lmu:setCameraAngle --
  ipcMain.handle(
    "lmu:setCameraAngle",
    async (
      _event,
      cameraType: number,
      trackSideGroup: number,
      shouldAdvance: boolean
    ): Promise<void> => {
      await lmuClient.setCameraAngle(cameraType, trackSideGroup, shouldAdvance);
    }
  );

  // -- lmu:disconnect --
  ipcMain.handle("lmu:disconnect", (): void => {
    lmuClient.disconnect();
  });

  // -- lmu:getState --
  // -- used on mount to hydrate renderer with any existing state --
  ipcMain.handle("lmu:getState", (): AppState => {
    return lmuClient.getState();
  });
};