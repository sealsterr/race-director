import { app, BrowserWindow, shell } from "electron";
import { join } from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import { registerIpcHandlers } from "./ipc/handlers";

const DASHBOARD_WIDTH = 1100;
const DASHBOARD_HEIGHT = 700;

const createMainWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: DASHBOARD_WIDTH,
    height: DASHBOARD_HEIGHT,
    minWidth: 900,
    minHeight: 600,
    show: false, // don't flash an empty window, wait for content
    frame: false, // custom titlebar later
    backgroundColor: "#08090c", // match rd-bg to prevent white flash
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,  // security: renderer can't access Node directly
      nodeIntegration: false,  // security: no require() in renderer
    },
  });

  // -- shows window only once content ready, prevents visual flash --
  win.once("ready-to-show", () => {
    win.show();
  });

  // -- open external links in system browser, not electron --
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // -- load renderer --
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }

  return win;
};

// -- quit when all windows are closed (standard windows / linux behaviour) --
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// -- app ready --
app.whenReady().then(() => {
  // -- sets app user model ID for windows taskbar grouping --
  electronApp.setAppUserModelId("com.racedirector");

  // -- optimise devtools shortcuts in dev, disable in prod --
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const mainWindow = createMainWindow();
  registerIpcHandlers(mainWindow);

  // -- macOS: re-create window when dock icon is clicked with no windows open --
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});