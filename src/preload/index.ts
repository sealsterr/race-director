import { contextBridge, ipcRenderer } from "electron";
import type { ConnectionStatus, AppState } from "../renderer/src/types/lmu";

const api = {
  // -- connection --
  connect: (url: string, pollRate: number): Promise<void> =>
    ipcRenderer.invoke("lmu:connect", url, pollRate),

  disconnect: (): Promise<void> =>
    ipcRenderer.invoke("lmu:disconnect"),

  focusVehicle: (slotId: number): Promise<void> =>
    ipcRenderer.invoke("lmu:focusVehicle", slotId),

  setCameraAngle: (
    cameraType: number,
    trackSideGroup: number,
    shouldAdvance: boolean
  ): Promise<void> =>
    ipcRenderer.invoke("lmu:setCameraAngle", cameraType, trackSideGroup, shouldAdvance),

  // -- state --
  getState: (): Promise<AppState> =>
    ipcRenderer.invoke("lmu:getState"),

  // -- event subscriptions --
  onStateUpdate: (
    callback: (state: AppState) => void
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      state: AppState
    ): void => {
      callback(state);
    };
    ipcRenderer.on("lmu:stateUpdate", handler);
    return () => ipcRenderer.removeListener("lmu:stateUpdate", handler);
  },

  onConnectionChange: (
    callback: (status: ConnectionStatus) => void
  ): (() => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      status: ConnectionStatus
    ): void => {
      callback(status);
    };
    ipcRenderer.on("lmu:connectionChange", handler);
    return () => ipcRenderer.removeListener("lmu:connectionChange", handler);
  },

  // -- window management --
  windows: {
    open: (id: string): Promise<boolean> =>
      ipcRenderer.invoke("window:open", id),

    close: (id: string): Promise<void> =>
      ipcRenderer.invoke("window:close", id),

    getOpen: (): Promise<string[]> =>
      ipcRenderer.invoke("window:getOpen"),

    onClosed: (cb: (id: string) => void): (() => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        id: string
      ): void => {
        cb(id);
      };
      ipcRenderer.on("window:closed", handler);
      return () => ipcRenderer.removeListener("window:closed", handler);
    },
  },

  // -- overlay management --
  overlay: {
    getDisplays: () =>
      ipcRenderer.invoke("overlay:getDisplays"),

    getDefaultSavePath: () =>
      ipcRenderer.invoke("overlay:getDefaultSavePath"),

    savePreset: (overlays: unknown[], savePath: string) =>
      ipcRenderer.invoke("overlay:savePreset", overlays, savePath),

    loadPreset: (savePath: string) =>
      ipcRenderer.invoke("overlay:loadPreset", savePath),

    pickSavePath: () =>
      ipcRenderer.invoke("overlay:pickSavePath"),

    pickLoadPath: () =>
      ipcRenderer.invoke("overlay:pickLoadPath"),

    updateBounds: (
      id: string,
      x: number,
      y: number,
      w: number,
      h: number
    ) => ipcRenderer.invoke("overlay:updateBounds", id, x, y, w, h),

    setDragMode: (id: string, enabled: boolean) =>
      ipcRenderer.invoke("overlay:setDragMode", id, enabled),

    getBounds: (id: string) =>
      ipcRenderer.invoke("overlay:getBounds", id),
    broadcastConfig: (config: unknown) =>
      ipcRenderer.invoke("overlay:broadcastConfig", config),
    onConfigUpdate: (cb: (config: unknown) => void) => {
      const handler = (_e: unknown, config: unknown): void => cb(config);
      ipcRenderer.on("overlay:configUpdate", handler);
      return () => ipcRenderer.removeListener("overlay:configUpdate", handler);
    },
  },
};

contextBridge.exposeInMainWorld("api", api);

export type ElectronAPI = typeof api;