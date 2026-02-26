import { app, BrowserWindow, shell, ipcMain } from "electron";
import { join } from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { registerIpcHandlers } from "./ipc/handlers";

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

const registerWindowIpc = (mainWindow: BrowserWindow): void => {
  // -- open a named window --
  ipcMain.handle("window:open", (_event, id: string): boolean => {
    if (id === "INFO") {
      createChildWindow(
        "INFO",
        "info",
        { width: 1400, height: 800, minWidth: 900, minHeight: 400 },
        mainWindow
      );
      return true;
    }
    return false;
  });

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