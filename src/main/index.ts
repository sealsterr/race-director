import { app, BrowserWindow, shell, ipcMain } from "electron";
import { join } from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { registerIpcHandlers } from "./ipc/handlers";
import { registerOverlayHandlers } from "./ipc/overlayHandlers";

const DASHBOARD_WIDTH = 1100;
const DASHBOARD_HEIGHT = 700;

// -- track child windows so we don't open duplicates --
const childWindows: Map<string, BrowserWindow> = new Map();

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

  const win = new BrowserWindow({
    show: false,
    backgroundColor: "#08090c",
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#0f1117",
      symbolColor: "#f1f5f9",
      height: 40,
    },
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
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send("window:closed", id);
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
    focusable: false,       // wont steal focus from game
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
    const base = process.env["ELECTRON_RENDERER_URL"].replace(/\/$/, "");
    win.loadURL(`${base}/#${route}`);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"), { hash: route });
  }

  win.on("closed", () => {
    childWindows.delete(id);
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
          width: 1000,
          height: 700,
          minWidth: 800,
          minHeight: 500,
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
      "OVERLAY-TOWER":   { route: "overlay/tower",   w: 340,  h: 600 },
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

    const mainWindow = createMainWindow();
    registerIpcHandlers(mainWindow);
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