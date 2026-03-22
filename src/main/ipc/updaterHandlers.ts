import {
  checkForAppUpdates,
  downloadUpdate,
  getUpdaterState,
  installDownloadedUpdate,
} from "../updater";
import type { AppUpdaterState } from "../../shared/updater";
import { registerIpcHandle } from "./registerIpcHandle";

export const registerUpdaterHandlers = (): void => {
  registerIpcHandle("updater:getState", (): AppUpdaterState => {
    return getUpdaterState();
  });

  registerIpcHandle("updater:check", async (): Promise<AppUpdaterState> => {
    return checkForAppUpdates();
  });

  registerIpcHandle("updater:download", async (): Promise<AppUpdaterState> => {
    return downloadUpdate();
  });

  registerIpcHandle("updater:install", async (): Promise<AppUpdaterState> => {
    const result = await installDownloadedUpdate();
    return result.state;
  });
};
