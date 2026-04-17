import { contextBridge, ipcRenderer } from 'electron'
import type { ConnectionStatus, AppState, TelemetrySnapshot } from '../shared/types'
import type { AppUpdaterState } from '../shared/updater'
import type { GlobalUiSettingsPayload } from '../shared/globalUi'
import type {
  DisplayInfo,
  OverlayBounds,
  OverlayBoundsChangedPayload,
  OverlayConfigForId,
  OverlayConfigUnion,
  OverlayId,
  OverlayPathPickResult,
  OverlayPresetLoadResult,
  OverlayPresetSaveResult
} from '../shared/overlay'

// Keep methods small and explicit so IPC contracts stay auditable.
const api = {
  connect: (url: string, pollRate: number): Promise<void> =>
    ipcRenderer.invoke('lmu:connect', url, pollRate),

  disconnect: (): Promise<void> => ipcRenderer.invoke('lmu:disconnect'),

  focusVehicle: (slotId: number): Promise<void> => ipcRenderer.invoke('lmu:focusVehicle', slotId),

  setCameraAngle: (
    cameraType: number,
    trackSideGroup: number,
    shouldAdvance: boolean
  ): Promise<void> =>
    ipcRenderer.invoke('lmu:setCameraAngle', cameraType, trackSideGroup, shouldAdvance),

  getState: (): Promise<AppState> => ipcRenderer.invoke('lmu:getState'),

  getTelemetry: (): Promise<TelemetrySnapshot> => ipcRenderer.invoke('lmu:getTelemetry'),

  onStateUpdate: (callback: (state: AppState) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: AppState): void => {
      callback(state)
    }
    ipcRenderer.on('lmu:stateUpdate', handler)
    return () => ipcRenderer.removeListener('lmu:stateUpdate', handler)
  },

  onConnectionChange: (callback: (status: ConnectionStatus) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, status: ConnectionStatus): void => {
      callback(status)
    }
    ipcRenderer.on('lmu:connectionChange', handler)
    return () => ipcRenderer.removeListener('lmu:connectionChange', handler)
  },

  onTelemetryUpdate: (callback: (snapshot: TelemetrySnapshot) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, snapshot: TelemetrySnapshot): void => {
      callback(snapshot)
    }
    ipcRenderer.on('lmu:telemetryUpdate', handler)
    return () => ipcRenderer.removeListener('lmu:telemetryUpdate', handler)
  },

  windows: {
    open: (id: string): Promise<boolean> => ipcRenderer.invoke('window:open', id),

    close: (id: string): Promise<void> => ipcRenderer.invoke('window:close', id),

    getOpen: (): Promise<string[]> => ipcRenderer.invoke('window:getOpen'),

    setModalBackdropActive: (isActive: boolean): Promise<void> =>
      ipcRenderer.invoke('window:setModalBackdropActive', isActive),

    onClosed: (cb: (id: string) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, id: string): void => {
        cb(id)
      }
      ipcRenderer.on('window:closed', handler)
      return () => ipcRenderer.removeListener('window:closed', handler)
    }
  },

  system: {
    ackDisconnect: (): Promise<void> => ipcRenderer.invoke('system:ackDisconnect'),

    onDisconnectNoticeVisibilityChange: (cb: (isVisible: boolean) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, isVisible: boolean): void => {
        cb(isVisible)
      }
      ipcRenderer.on('system:disconnectNoticeVisibility', handler)
      return () => ipcRenderer.removeListener('system:disconnectNoticeVisibility', handler)
    },

    onQuitConfirmVisibilityChange: (cb: (isVisible: boolean) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, isVisible: boolean): void => {
        cb(isVisible)
      }
      ipcRenderer.on('system:quitConfirmVisibility', handler)
      return () => ipcRenderer.removeListener('system:quitConfirmVisibility', handler)
    },

    getQuitConfirmPreference: (): Promise<boolean> =>
      ipcRenderer.invoke('system:getQuitConfirmPreference'),

    resetWindowLayouts: (): Promise<void> => ipcRenderer.invoke('system:resetWindowLayouts'),

    resetQuitConfirmPreference: (): Promise<void> =>
      ipcRenderer.invoke('system:resetQuitConfirmPreference'),

    cancelQuit: (): Promise<void> => ipcRenderer.invoke('system:cancelQuit'),

    confirmQuit: (dontAskAgain: boolean): Promise<void> =>
      ipcRenderer.invoke('system:confirmQuit', dontAskAgain)
  },

  settings: {
    applyGlobalUi: (payload: GlobalUiSettingsPayload): Promise<void> =>
      ipcRenderer.invoke('settings:applyGlobalUi', payload),

    onGlobalUiChanged: (callback: (payload: GlobalUiSettingsPayload) => void): (() => void) => {
      const handler = (
        _event: Electron.IpcRendererEvent,
        payload: GlobalUiSettingsPayload
      ): void => {
        callback(payload)
      }
      ipcRenderer.on('settings:globalUiChanged', handler)
      return () => ipcRenderer.removeListener('settings:globalUiChanged', handler)
    }
  },

  updater: {
    getState: (): Promise<AppUpdaterState> => ipcRenderer.invoke('updater:getState'),

    check: (): Promise<AppUpdaterState> => ipcRenderer.invoke('updater:check'),

    download: (): Promise<AppUpdaterState> => ipcRenderer.invoke('updater:download'),

    install: (): Promise<AppUpdaterState> => ipcRenderer.invoke('updater:install'),

    onStateChange: (callback: (state: AppUpdaterState) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, state: AppUpdaterState): void => {
        callback(state)
      }
      ipcRenderer.on('updater:state', handler)
      return () => ipcRenderer.removeListener('updater:state', handler)
    }
  },

  overlay: {
    getDisplays: (): Promise<DisplayInfo[]> => ipcRenderer.invoke('overlay:getDisplays'),

    getDefaultSavePath: (): Promise<string> => ipcRenderer.invoke('overlay:getDefaultSavePath'),

    savePreset: (
      overlays: OverlayConfigUnion[],
      savePath: string
    ): Promise<OverlayPresetSaveResult> =>
      ipcRenderer.invoke('overlay:savePreset', overlays, savePath),

    loadPreset: (savePath: string): Promise<OverlayPresetLoadResult> =>
      ipcRenderer.invoke('overlay:loadPreset', savePath),

    pickSavePath: (): Promise<OverlayPathPickResult> => ipcRenderer.invoke('overlay:pickSavePath'),

    pickLoadPath: (): Promise<OverlayPathPickResult> => ipcRenderer.invoke('overlay:pickLoadPath'),

    getConfig: <Id extends OverlayId>(id: Id): Promise<OverlayConfigForId<Id> | null> =>
      ipcRenderer.invoke('overlay:getConfig', id),

    updateBounds: (
      id: OverlayId,
      x: number,
      y: number,
      w: number,
      h: number
    ): Promise<OverlayBounds | null> => ipcRenderer.invoke('overlay:updateBounds', id, x, y, w, h),

    setDragMode: (id: OverlayId, enabled: boolean): Promise<void> =>
      ipcRenderer.invoke('overlay:setDragMode', id, enabled),

    getBounds: (id: OverlayId): Promise<OverlayBounds | null> =>
      ipcRenderer.invoke('overlay:getBounds', id),
    broadcastConfig: (config: OverlayConfigUnion): Promise<void> =>
      ipcRenderer.invoke('overlay:broadcastConfig', config),
    onBoundsChanged: (cb: (payload: OverlayBoundsChangedPayload) => void): (() => void) => {
      const handler = (_e: Electron.IpcRendererEvent, payload: OverlayBoundsChangedPayload): void =>
        cb(payload)
      ipcRenderer.on('overlay:boundsChanged', handler)
      return () => ipcRenderer.removeListener('overlay:boundsChanged', handler)
    },
    onConfigUpdate: (cb: (config: OverlayConfigUnion) => void): (() => void) => {
      const handler = (_e: Electron.IpcRendererEvent, config: OverlayConfigUnion): void =>
        cb(config)
      ipcRenderer.on('overlay:configUpdate', handler)
      return () => ipcRenderer.removeListener('overlay:configUpdate', handler)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ElectronAPI = typeof api
