import { app, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import type { AppUpdaterState } from "../shared/updater";

const UPDATE_POLL_INTERVAL_MS = 15 * 60 * 1000;
const STARTUP_RECHECK_DELAY_MS = 30 * 1000;

const getInitialUpdaterState = (): AppUpdaterState => {
  const version = app.getVersion();
  return {
    currentVersion: version,
    latestVersion: version,
    hasUpdate: false,
    checking: false,
    downloading: false,
    downloaded: false,
    downloadProgress: null,
    error: null,
  };
};

let updaterState: AppUpdaterState = getInitialUpdaterState();
let pollTimer: NodeJS.Timeout | null = null;
let startupRetryTimer: NodeJS.Timeout | null = null;
let isInitialized = false;
let onBeforeInstall: (() => void) | null = null;

interface AutoUpdaterInitOptions {
  onBeforeInstall?: () => void;
}

const normalizeError = (value: unknown): string => {
  if (value instanceof Error && value.message) {
    return value.message;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return "Unknown update error.";
};

const broadcastUpdaterState = (): void => {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (win.isDestroyed() || win.webContents.isDestroyed()) return;
    win.webContents.send("updater:state", updaterState);
  });
};

const updateUpdaterState = (partial: Partial<AppUpdaterState>): void => {
  updaterState = {
    ...updaterState,
    ...partial,
  };
  broadcastUpdaterState();
};

export const getUpdaterState = (): AppUpdaterState => updaterState;

export const checkForAppUpdates = async (): Promise<AppUpdaterState> => {
  if (!app.isPackaged) {
    updateUpdaterState({
      checking: false,
      hasUpdate: false,
      latestVersion: updaterState.currentVersion,
      error: null,
    });
    return updaterState;
  }

  if (updaterState.checking) return updaterState;

  try {
    updateUpdaterState({ checking: true, error: null });
    await autoUpdater.checkForUpdates();
  } catch (error) {
    updateUpdaterState({
      checking: false,
      downloading: false,
      error: normalizeError(error),
    });
  }

  return updaterState;
};

export const downloadUpdate = async (): Promise<AppUpdaterState> => {
  if (!app.isPackaged) return updaterState;
  if (!updaterState.hasUpdate || updaterState.downloading) {
    return updaterState;
  }

  if (updaterState.downloaded) {
    onBeforeInstall?.();
    autoUpdater.quitAndInstall(false, true);
    return updaterState;
  }

  try {
    updateUpdaterState({
      downloading: true,
      error: null,
      downloadProgress: 0,
    });
    await autoUpdater.downloadUpdate();
  } catch (error) {
    updateUpdaterState({
      downloading: false,
      downloadProgress: null,
      error: normalizeError(error),
    });
  }

  return updaterState;
};

export const initializeAutoUpdater = (
  options: AutoUpdaterInitOptions = {}
): void => {
  if (isInitialized) return;
  isInitialized = true;
  onBeforeInstall = options.onBeforeInstall ?? null;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    updateUpdaterState({
      checking: true,
      error: null,
    });
  });

  autoUpdater.on("update-available", (info) => {
    updateUpdaterState({
      checking: false,
      hasUpdate: true,
      downloaded: false,
      latestVersion: info.version ?? updaterState.latestVersion,
      error: null,
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    updateUpdaterState({
      checking: false,
      hasUpdate: false,
      downloaded: false,
      downloading: false,
      downloadProgress: null,
      latestVersion: info.version ?? updaterState.currentVersion,
      error: null,
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    updateUpdaterState({
      checking: false,
      downloading: true,
      downloadProgress: Math.max(0, Math.min(100, Math.round(progress.percent))),
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    updateUpdaterState({
      checking: false,
      downloading: false,
      downloaded: true,
      hasUpdate: true,
      latestVersion: info.version ?? updaterState.latestVersion,
      downloadProgress: 100,
      error: null,
    });
  });

  autoUpdater.on("error", (error) => {
    updateUpdaterState({
      checking: false,
      downloading: false,
      error: normalizeError(error),
    });
  });

  if (app.isPackaged) {
    void checkForAppUpdates();
    startupRetryTimer = setTimeout(() => {
      void checkForAppUpdates();
    }, STARTUP_RECHECK_DELAY_MS);
    pollTimer = setInterval(() => {
      void checkForAppUpdates();
    }, UPDATE_POLL_INTERVAL_MS);
  } else {
    updateUpdaterState({
      hasUpdate: false,
      latestVersion: updaterState.currentVersion,
      checking: false,
      error: null,
    });
  }

  app.on("before-quit", () => {
    if (startupRetryTimer) {
      clearTimeout(startupRetryTimer);
      startupRetryTimer = null;
    }
    if (!pollTimer) return;
    clearInterval(pollTimer);
    pollTimer = null;
  });
};
