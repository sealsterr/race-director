import { contextBridge, ipcRenderer } from "electron";
import type { ConnectionStatus, AppState } from "../renderer/src/types/lmu";

const api = {
  // -- connection --
  connect: (url: string, pollRate: number): Promise<void> =>
    ipcRenderer.invoke("lmu:connect", url, pollRate),

  disconnect: (): Promise<void> =>
    ipcRenderer.invoke("lmu:disconnect"),

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
};

contextBridge.exposeInMainWorld("api", api);

export type ElectronAPI = typeof api;