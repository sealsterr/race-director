import { contextBridge, ipcRenderer } from "electron";
import type { ConnectionStatus, AppState } from "../renderer/src/types/lmu";

/*
  the API is exposed to the renderer via window.api
  only expose what the renderer actually needs!
*/
const api = {
  // -- connection --
  connect: (url: string, pollRate: number): Promise<void> =>
    ipcRenderer.invoke("lmu:connect", url, pollRate),

  disconnect: (): Promise<void> =>
    ipcRenderer.invoke("lmu:disconnect"),

  // -- state --
  getState: (): Promise<AppState> =>
    ipcRenderer.invoke("lmu:getState"),

  // -- event subscriptions (main -> renderer push) --
  onStateUpdate: (
    callback: (state: AppState) => void
  ): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: AppState): void => {
      callback(state);
    };
    ipcRenderer.on("lmu:stateUpdate", handler);
    // -- returns an unsubscribe function to avoid memory leaks --
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
};

contextBridge.exposeInMainWorld("api", api);

// -- export the type so the renderer gets full ts intellisense
export type ElectronAPI = typeof api;