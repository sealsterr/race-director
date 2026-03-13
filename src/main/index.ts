import { app, BrowserWindow, shell, ipcMain, screen } from "electron";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { registerIpcHandlers } from "./ipc/handlers";
import { registerOverlayHandlers } from "./ipc/overlayHandlers";

const DASHBOARD_WIDTH = 1100;
const DASHBOARD_HEIGHT = 700;

interface UiPrefs {
  showQuitConfirm: boolean;
}

const DEFAULT_UI_PREFS: UiPrefs = {
  showQuitConfirm: true,
};

let uiPrefs: UiPrefs = DEFAULT_UI_PREFS;
let isAppQuitting = false;
let isQuitDialogOpen = false;

// -- track child windows so we don't open duplicates --
const childWindows: Map<string, BrowserWindow> = new Map();
const suppressOverlayMoveEvents = new Set<string>();

const OVERLAY_WINDOW_IDS = new Set<string>([
  "OVERLAY-TOWER",
  "OVERLAY-DRIVER",
  "OVERLAY-GAP",
  "OVERLAY-SESSION",
  "OVERLAY-PITS",
  "OVERLAY-SECTOR",
]);

function isOverlayWindowId(id: string): boolean {
  return OVERLAY_WINDOW_IDS.has(id);
}

function closeAllOverlayWindows(): void {
  for (const [id, win] of childWindows.entries()) {
    if (!isOverlayWindowId(id)) continue;
    if (win.isDestroyed()) continue;
    win.close();
  }
}

function clampBoundsToDisplay(
  bounds: Electron.Rectangle,
  displayBounds: Electron.Rectangle
): Electron.Rectangle {
  const maxX = Math.max(displayBounds.x, displayBounds.x + displayBounds.width - bounds.width);
  const maxY = Math.max(displayBounds.y, displayBounds.y + displayBounds.height - bounds.height);

  return {
    ...bounds,
    x: Math.min(Math.max(bounds.x, displayBounds.x), maxX),
    y: Math.min(Math.max(bounds.y, displayBounds.y), maxY),
  };
}

function getDisplayForBounds(bounds: Electron.Rectangle): Electron.Display {
  const electronScreen = screen as any;
  const centerPoint = {
    x: Math.round(bounds.x + bounds.width / 2),
    y: Math.round(bounds.y + bounds.height / 2),
  };

  const displays = electronScreen.getAllDisplays() as Electron.Display[];
  const primaryDisplay = electronScreen.getPrimaryDisplay() as Electron.Display;

  let closestDisplay = primaryDisplay;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const display of displays) {
    const displayCenterX = display.bounds.x + display.bounds.width / 2;
    const displayCenterY = display.bounds.y + display.bounds.height / 2;
    const dx = centerPoint.x - displayCenterX;
    const dy = centerPoint.y - displayCenterY;
    const distance = dx * dx + dy * dy;

    if (distance < closestDistance) {
      closestDistance = distance;
      closestDisplay = display;
    }
  }

  return closestDisplay;
}

function getOpenNonOverlayChildWindowCount(): number {
  return Array.from(childWindows.entries()).filter(([id, win]) => {
    return !isOverlayWindowId(id) && !win.isDestroyed();
  }).length;
}

function getUiPrefsPath(): string {
  return join(app.getPath("userData"), "ui-prefs.json");
}

function loadUiPrefs(): UiPrefs {
  try {
    const raw = readFileSync(getUiPrefsPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<UiPrefs>;
    return {
      ...DEFAULT_UI_PREFS,
      ...parsed,
    };
  } catch {
    return DEFAULT_UI_PREFS;
  }
}

function saveUiPrefs(next: UiPrefs): void {
  const path = getUiPrefsPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(next, null, 2), "utf8");
}

function closeAllManagedWindows(exceptIds: Set<string> = new Set()): void {
  for (const [id, win] of childWindows.entries()) {
    if (exceptIds.has(id)) continue;
    if (win.isDestroyed()) continue;
    win.close();
  }
}

function focusMainWindow(mainWindow: BrowserWindow): void {
  if (mainWindow.isDestroyed()) return;
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

function destroyChildWindow(id: string): void {
  const win = childWindows.get(id);
  if (win && !win.isDestroyed()) {
    win.destroy();
  }
}

function dismissDisconnectNotice(mainWindow: BrowserWindow): void {
  destroyChildWindow("DISCONNECT-NOTICE");
  focusMainWindow(mainWindow);
}

function dismissQuitConfirm(mainWindow: BrowserWindow): void {
  isQuitDialogOpen = false;
  destroyChildWindow("QUIT-CONFIRM");
  focusMainWindow(mainWindow);
}

function getCenteredBounds(
  mainWindow: BrowserWindow,
  width: number,
  height: number
): Electron.Rectangle {
  const bounds = mainWindow.getBounds();
  return {
    x: bounds.x + Math.round((bounds.width - width) / 2),
    y: bounds.y + Math.round((bounds.height - height) / 2),
    width,
    height,
  };
}

function openDisconnectNotice(mainWindow: BrowserWindow): void {
  const bounds = getCenteredBounds(mainWindow, 460, 248);
  createChildWindow(
    "DISCONNECT-NOTICE",
    "system/disconnect-notice",
    {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      parent: mainWindow,
      resizable: false,
      minimizable: false,
      maximizable: false,
      frame: false,
      transparent: true,
      hasShadow: false,
      backgroundColor: "#00000000",
      title: "Connection Lost",
    },
    mainWindow
  );
}

function openQuitConfirm(mainWindow: BrowserWindow): void {
  const bounds = getCenteredBounds(mainWindow, 490, 370);
  createChildWindow(
    "QUIT-CONFIRM",
    "system/quit-confirm",
    {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      parent: mainWindow,
      modal: true,
      movable: false,
      minimizable: false,
      maximizable: false,
      resizable: false,
      skipTaskbar: true,
      title: "Confirm Quit",
      frame: false,
      transparent: true,
      backgroundColor: "#00000000",
      hasShadow: false,
      thickFrame: false,
      roundedCorners: true,
      alwaysOnTop: true,
    },
    mainWindow
  );
  isQuitDialogOpen = true;
}

const createMainWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: DASHBOARD_WIDTH,
    height: DASHBOARD_HEIGHT,
    minWidth: 900,
    minHeight: 600,
    show: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#0f1117",
      symbolColor: "#f1f5f9",
      height: 56,
    },
    backgroundColor: "#08090c",
    icon: join(__dirname, "../../resources/rd-icon-2.ico"),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.once("ready-to-show", () => win.show());
  setTimeout(() => {  // fallback in case 'ready-to-show' doesn't fire
    if (!win.isDestroyed() && !win.isVisible()) win.show();
  }, 3000);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }

  return win;
};

const createChildWindow = (
  id: string,
  route: string,
  options: Partial<Electron.BrowserWindowConstructorOptions>,
  mainWindow: BrowserWindow
): BrowserWindow => {
  // -- if already open just focus it --
  const existing = childWindows.get(id);
  if (existing && !existing.isDestroyed()) {
    existing.focus();
    return existing;
  }

  
  const isFrameless = options.frame === false;

  const win = new BrowserWindow({
    show: false,
    backgroundColor: isFrameless ? "#00000000" : "#08090c",
    ...(isFrameless
      ? {}
      : {
          titleBarStyle: "hidden",
          titleBarOverlay: {
            color: "#0f1117",
            symbolColor: "#f1f5f9",
            height: 40,
          },
        }),
    icon: join(__dirname, "../../resources/rd-icon-2.ico"),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
    ...options,
  });

  win.once("ready-to-show", () => win.show());
  win.webContents.on("did-finish-load", () => {
    if (options.title) win.setTitle(options.title);
  });

  win.on("close", (event) => {
    if (isAppQuitting) return;

    if (id === "QUIT-CONFIRM") {
      event.preventDefault();
      dismissQuitConfirm(mainWindow);
      return;
    }

    if (id === "DISCONNECT-NOTICE") {
      event.preventDefault();
      dismissDisconnectNotice(mainWindow);
    }
  });

  // -- load same renderer with hash route --
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    const base = process.env["ELECTRON_RENDERER_URL"].replace(/\/$/, "");
    win.loadURL(`${base}/#${route}`);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"), {
      hash: route,
    });
  }

  // -- clean up map entry and notify dashboard when closed --
  win.on("closed", () => {
    childWindows.delete(id);

    if (id === "QUIT-CONFIRM" && !mainWindow.isDestroyed()) {
      isQuitDialogOpen = false;
    }

    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("window:closed", id);
    }

    if (getOpenNonOverlayChildWindowCount() === 0 && mainWindow.isDestroyed()) {
      closeAllOverlayWindows();
    }
  });

  childWindows.set(id, win);
  return win;
};

const createOverlayWindow = (
  id: string,
  route: string,
  x: number,
  y: number,
  width: number,
  height: number
): BrowserWindow => {
  const existing = childWindows.get(id);
  if (existing && !existing.isDestroyed()) {
    existing.focus();
    return existing;
  }

  const win = new BrowserWindow({
    x,
    y,
    width,
    height,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: false,
    focusable: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // click-through by default
  win.setIgnoreMouseEvents(true, { forward: true });

  win.once("ready-to-show", () => win.show());

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/#${route}`);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"), {
      hash: route,
    });
  }

  win.on("closed", () => {
    childWindows.delete(id);
  });

  win.on("move", () => {
    if (suppressOverlayMoveEvents.has(id)) {
      suppressOverlayMoveEvents.delete(id);
      return;
    }

    const currentBounds = win.getBounds();
    const targetDisplay = getDisplayForBounds(currentBounds);
    const clampedBounds = clampBoundsToDisplay(currentBounds, targetDisplay.bounds);
    const didClamp =
      clampedBounds.x !== currentBounds.x ||
      clampedBounds.y !== currentBounds.y;

    if (didClamp) {
      suppressOverlayMoveEvents.add(id);
      win.setBounds(clampedBounds);
    }
  });

  (win as any).on("will-move", (event: { preventDefault: () => void }, newBounds: Electron.Rectangle) => {
    const targetDisplay = getDisplayForBounds(newBounds);
    const clampedBounds = clampBoundsToDisplay(newBounds, targetDisplay.bounds);
    const didClamp =
      clampedBounds.x !== newBounds.x ||
      clampedBounds.y !== newBounds.y;

    if (!didClamp) return;

    event.preventDefault();
    suppressOverlayMoveEvents.add(id);
    win.setBounds(clampedBounds);
  });

  childWindows.set(id, win);
  return win;
};

const registerWindowIpc = (mainWindow: BrowserWindow): void => {
  // -- open a named window --
  ipcMain.handle("window:open", (_event, id: string): boolean => {
    if (id === "INFO") {
      createChildWindow(
        "INFO",
        "info",
        {
          width: 1400,
          height: 800,
          minWidth: 900,
          minHeight: 400,
          title: "RaceDirector | Info Window",
        },
        mainWindow
      );
      return true;
    }

    if (id === "OVERLAY-CONTROL") {
      createChildWindow(
        "OVERLAY-CONTROL",
        "overlay-control",
        {
          width: 1240,
          height: 760,
          minWidth: 1180,
          minHeight: 680,
          title: "RaceDirector | Overlay Control",
        },
        mainWindow
      );
      return true;
    }

    // -- overlay windows --
    const OVERLAY_SIZES: Record<
      string,
      { route: string; w: number; h: number }
    > = {
      "OVERLAY-TOWER":   { route: "overlay/tower",   w: 400,  h: 700 },
      "OVERLAY-DRIVER":  { route: "overlay/driver",  w: 540,  h: 120 },
      "OVERLAY-GAP":     { route: "overlay/gap",     w: 460,  h: 100 },
      "OVERLAY-SESSION": { route: "overlay/session", w: 1920, h: 60  },
      "OVERLAY-PITS":    { route: "overlay/pits",    w: 300,  h: 500 },
      "OVERLAY-SECTOR":  { route: "overlay/sector",  w: 420,  h: 80  },
    };

    const def = OVERLAY_SIZES[id];
    if (def) {
      createOverlayWindow(id, def.route, 0, 0, def.w, def.h);
      return true;
    }

    return false;
  });

  // move/resize overlay windows
  ipcMain.handle(
    "overlay:updateBounds",
    (_e, id: string, x: number, y: number, w: number, h: number): void => {
      const win = childWindows.get(id);
      if (win && !win.isDestroyed()) {
        win.setBounds({ x, y, width: w, height: h });
      }
    }
  );

  // toggle drag mode
  ipcMain.handle(
    "overlay:setDragMode",
    (_e, id: string, enabled: boolean): void => {
      const win = childWindows.get(id);
      if (win && !win.isDestroyed()) {
        win.setIgnoreMouseEvents(!enabled, { forward: true });
        win.setFocusable(enabled);
      }
    }
  );

  // get bounds of overlay window
  ipcMain.handle(
    "overlay:getBounds",
    (_e, id: string): Electron.Rectangle | null => {
      const win = childWindows.get(id);
      if (win && !win.isDestroyed()) return win.getBounds();
      return null;
    }
  );

  // -- close a named window --
  ipcMain.handle("window:close", (_event, id: string): void => {
    const win = childWindows.get(id);
    if (win && !win.isDestroyed()) win.close();
  });

  ipcMain.handle("system:ackDisconnect", (): void => {
    dismissDisconnectNotice(mainWindow);
  });

  ipcMain.handle("system:getQuitConfirmPreference", (): boolean => {
    return uiPrefs.showQuitConfirm;
  });

  ipcMain.handle("system:cancelQuit", (): void => {
    dismissQuitConfirm(mainWindow);
  });

  ipcMain.handle("system:confirmQuit", (_event, dontAskAgain: boolean): void => {
    uiPrefs = {
      ...uiPrefs,
      showQuitConfirm: !dontAskAgain,
    };
    saveUiPrefs(uiPrefs);

    isAppQuitting = true;
    closeAllManagedWindows();

    if (!mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });

  // -- query which windows are open --
  ipcMain.handle("window:getOpen", (): string[] => {
    return Array.from(childWindows.entries())
      .filter(([, w]) => !w.isDestroyed())
      .map(([id]) => id);
  });
};

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

const bootstrap = async (): Promise<void> => {
  try {
    await app.whenReady();
    electronApp.setAppUserModelId("com.racedirector");

    app.on("browser-window-created", (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    uiPrefs = loadUiPrefs();

    const mainWindow = createMainWindow();

    const handleConnectionLost = (): void => {
      if (isAppQuitting || mainWindow.isDestroyed()) return;

      closeAllManagedWindows();
      openDisconnectNotice(mainWindow);
      mainWindow.focus();
    };

    mainWindow.on("close", (event) => {
      if (isAppQuitting) return;
      if (isQuitDialogOpen) {
        event.preventDefault();
        return;
      }

      if (!uiPrefs.showQuitConfirm) {
        isAppQuitting = true;
        closeAllManagedWindows();
        return;
      }

      event.preventDefault();
      openQuitConfirm(mainWindow);
    });

    mainWindow.on("closed", () => {
      closeAllManagedWindows();
    });

    registerIpcHandlers(mainWindow, handleConnectionLost);
    registerOverlayHandlers();
    registerWindowIpc(mainWindow);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
  } catch (err) {
    console.error("Failed to bootstrap app:", err);
    app.quit();
  }
};

void bootstrap();
