import { ipcMain } from "electron";
import {
  checkForAppUpdates,
  downloadUpdate,
  getUpdaterState,
} from "../updater";
import type { AppUpdaterState } from "../../shared/updater";

export const registerUpdaterHandlers = (): void => {
  ipcMain.handle("updater:getState", (): AppUpdaterState => {
    return getUpdaterState();
  });

  ipcMain.handle("updater:check", async (): Promise<AppUpdaterState> => {
    return checkForAppUpdates();
  });

  ipcMain.handle("updater:download", async (): Promise<AppUpdaterState> => {
    return downloadUpdate();
  });
};
