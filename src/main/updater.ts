import { readFileSync } from "node:fs";
import { join } from "node:path";
import { app, BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import type { AppUpdaterActionResult, AppUpdaterState } from "../shared/updater";
import {
  createInitialUpdaterState,
  getAutoUpdateDisabledReason,
  reduceUpdaterStateOnCheckFailure,
  reduceUpdaterStateOnCheckStart,
  reduceUpdaterStateOnDownloadComplete,
  reduceUpdaterStateOnDownloadFailure,
  reduceUpdaterStateOnDownloadProgress,
  reduceUpdaterStateOnDownloadStart,
  reduceUpdaterStateOnInstallFailure,
  reduceUpdaterStateOnNoUpdate,
  reduceUpdaterStateOnUpdateAvailable,
  setUpdaterEnabled,
  shouldBroadcastDownloadProgress,
} from "./updaterState";

const UPDATE_POLL_INTERVAL_MS = 4 * 60 * 60 * 1000;
const UPDATE_STARTUP_DELAY_MS = 15 * 1000;
const UPDATER_STATE_CHANNEL = "updater:state";

let updaterState: AppUpdaterState = createInitialUpdaterState(app.getVersion());
let updatePollTimer: NodeJS.Timeout | null = null;
let updateStartupTimer: NodeJS.Timeout | null = null;
let updateCheckInFlight = false;
let updateDownloadInFlight = false;
let updaterConfigured = false;
let isInitialized = false;
let onBeforeInstall: (() => void) | null = null;

interface AutoUpdaterInitOptions {
  onBeforeInstall?: () => void;
}

interface AppUpdateYmlConfig {
  provider?: string;
  [key: string]: string | undefined;
}

const normalizeError = (value: unknown): string => {
  if (value instanceof Error && value.message) return value.message;
  if (typeof value === "string" && value.trim().length > 0) return value;
  return "Unknown update error.";
};

const emitUpdaterState = (): void => {
  for (const win of BrowserWindow.getAllWindows()) {
    if (win.isDestroyed() || win.webContents.isDestroyed()) continue;
    win.webContents.send(UPDATER_STATE_CHANNEL, updaterState);
  }
};

const setUpdaterState = (nextState: AppUpdaterState): void => {
  updaterState = nextState;
  emitUpdaterState();
};

const clearUpdateTimers = (): void => {
  if (updateStartupTimer) {
    clearTimeout(updateStartupTimer);
    updateStartupTimer = null;
  }
  if (updatePollTimer) {
    clearInterval(updatePollTimer);
    updatePollTimer = null;
  }
};

const readAppUpdateYml = (): AppUpdateYmlConfig | null => {
  try {
    const ymlPath = app.isPackaged
      ? join(process.resourcesPath, "app-update.yml")
      : join(app.getAppPath(), "dev-app-update.yml");
    const raw = readFileSync(ymlPath, "utf-8");
    const entries: AppUpdateYmlConfig = {};

    for (const line of raw.split("\n")) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (!match?.[1] || !match[2]) continue;
      entries[match[1]] = match[2].trim();
    }

    return entries.provider ? entries : null;
  } catch {
    return null;
  }
};

const configureGitHubTokenFeed = (): void => {
  const githubToken =
    process.env.RACE_DIRECTOR_UPDATE_GITHUB_TOKEN?.trim() ||
    process.env.T3CODE_DESKTOP_UPDATE_GITHUB_TOKEN?.trim() ||
    process.env.GH_TOKEN?.trim() ||
    "";

  if (!githubToken) return;

  const appUpdateYml = readAppUpdateYml();
  if (appUpdateYml?.provider !== "github") return;

  autoUpdater.setFeedURL({
    ...appUpdateYml,
    provider: "github",
    private: true,
    token: githubToken,
  } as Parameters<typeof autoUpdater.setFeedURL>[0]);
};

const shouldEnableAutoUpdates = (): boolean => {
  return (
    getAutoUpdateDisabledReason({
      isPackaged: app.isPackaged,
      platform: process.platform,
      appImage: process.env.APPIMAGE,
      disabledByEnv:
        process.env.RACE_DIRECTOR_DISABLE_AUTO_UPDATE === "1" ||
        process.env.T3CODE_DISABLE_AUTO_UPDATE === "1",
    }) === null
  );
};

export const getUpdaterState = (): AppUpdaterState => updaterState;

export const checkForAppUpdates = async (_reason = "manual"): Promise<AppUpdaterState> => {
  if (!updaterConfigured || !updaterState.enabled) return updaterState;
  if (updateCheckInFlight) return updaterState;
  if (updaterState.status === "downloading" || updaterState.status === "downloaded") {
    return updaterState;
  }

  updateCheckInFlight = true;
  setUpdaterState(reduceUpdaterStateOnCheckStart(updaterState));

  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    setUpdaterState(reduceUpdaterStateOnCheckFailure(updaterState, normalizeError(error)));
  } finally {
    updateCheckInFlight = false;
  }

  return updaterState;
};

const downloadAvailableUpdate = async (): Promise<AppUpdaterActionResult> => {
  if (!updaterConfigured || updateDownloadInFlight || updaterState.status !== "available") {
    return { accepted: false, completed: false, state: updaterState };
  }

  updateDownloadInFlight = true;
  setUpdaterState(reduceUpdaterStateOnDownloadStart(updaterState));
  autoUpdater.disableDifferentialDownload =
    process.platform === "darwin" &&
    process.arch === "x64" &&
    app.runningUnderARM64Translation === true;

  try {
    await autoUpdater.downloadUpdate();
    return { accepted: true, completed: true, state: updaterState };
  } catch (error) {
    setUpdaterState(reduceUpdaterStateOnDownloadFailure(updaterState, normalizeError(error)));
    return { accepted: true, completed: false, state: updaterState };
  } finally {
    updateDownloadInFlight = false;
  }
};

export const installDownloadedUpdate = async (): Promise<AppUpdaterActionResult> => {
  if (!updaterConfigured || updaterState.status !== "downloaded") {
    return { accepted: false, completed: false, state: updaterState };
  }

  try {
    onBeforeInstall?.();
    clearUpdateTimers();
    autoUpdater.quitAndInstall(false, true);
    return { accepted: true, completed: true, state: updaterState };
  } catch (error) {
    setUpdaterState(reduceUpdaterStateOnInstallFailure(updaterState, normalizeError(error)));
    return { accepted: true, completed: false, state: updaterState };
  }
};

export const downloadUpdate = async (): Promise<AppUpdaterState> => {
  const result =
    updaterState.status === "downloaded"
      ? await installDownloadedUpdate()
      : await downloadAvailableUpdate();
  return result.state;
};

export const initializeAutoUpdater = (options: AutoUpdaterInitOptions = {}): void => {
  if (isInitialized) return;
  isInitialized = true;
  onBeforeInstall = options.onBeforeInstall ?? null;

  const enabled = shouldEnableAutoUpdates();
  setUpdaterState(setUpdaterEnabled(updaterState, enabled));

  if (!enabled) {
    const reason = getAutoUpdateDisabledReason({
      isPackaged: app.isPackaged,
      platform: process.platform,
      appImage: process.env.APPIMAGE,
      disabledByEnv:
        process.env.RACE_DIRECTOR_DISABLE_AUTO_UPDATE === "1" ||
        process.env.T3CODE_DISABLE_AUTO_UPDATE === "1",
    });
    if (reason) {
      setUpdaterState({
        ...updaterState,
        message: reason,
        error: reason,
      });
    }
  } else {
    updaterConfigured = true;
    configureGitHubTokenFeed();
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.allowDowngrade = false;

    autoUpdater.on("checking-for-update", () => {
      setUpdaterState(reduceUpdaterStateOnCheckStart(updaterState));
    });
    autoUpdater.on("update-available", (info) => {
      setUpdaterState(reduceUpdaterStateOnUpdateAvailable(updaterState, info.version ?? null));
    });
    autoUpdater.on("update-not-available", (info) => {
      setUpdaterState(reduceUpdaterStateOnNoUpdate(updaterState, info.version ?? null));
    });
    autoUpdater.on("download-progress", (progress) => {
      const percent = Math.max(0, Math.min(100, Math.floor(progress.percent)));
      if (!shouldBroadcastDownloadProgress(updaterState, percent) && updaterState.message === null) {
        return;
      }
      setUpdaterState(reduceUpdaterStateOnDownloadProgress(updaterState, percent));
    });
    autoUpdater.on("update-downloaded", (info) => {
      setUpdaterState(reduceUpdaterStateOnDownloadComplete(updaterState, info.version ?? null));
    });
    autoUpdater.on("error", (error) => {
      const message = normalizeError(error);

      if (updateDownloadInFlight) {
        setUpdaterState(reduceUpdaterStateOnDownloadFailure(updaterState, message));
        return;
      }

      if (updateCheckInFlight) {
        setUpdaterState(reduceUpdaterStateOnCheckFailure(updaterState, message));
        return;
      }

      setUpdaterState({
        ...updaterState,
        status: "error",
        message,
        error: message,
        checkedAt: new Date().toISOString(),
        canRetry: updaterState.hasUpdate || updaterState.downloaded,
      });
    });

    clearUpdateTimers();
    updateStartupTimer = setTimeout(() => {
      updateStartupTimer = null;
      void checkForAppUpdates("startup");
    }, UPDATE_STARTUP_DELAY_MS);
    updateStartupTimer.unref?.();

    updatePollTimer = setInterval(() => {
      void checkForAppUpdates("poll");
    }, UPDATE_POLL_INTERVAL_MS);
    updatePollTimer.unref?.();
  }

  app.on("before-quit", () => {
    clearUpdateTimers();
  });
};
