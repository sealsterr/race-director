import { app, BrowserWindow, shell, screen } from 'electron'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import type { GlobalUiSettingsPayload } from '../shared/globalUi'
import { DEFAULT_MEASUREMENT_UNITS } from '../shared/measurementUnits'
import { getOverlayWindowScale } from '../shared/overlayWindowSizing'
import { registerIpcHandlers } from './ipc/handlers'
import { registerOverlayHandlers } from './ipc/overlayHandlers'
import { registerUpdaterHandlers } from './ipc/updaterHandlers'
import { registerIpcHandle } from './ipc/registerIpcHandle'
import { initializeAutoUpdater } from './updater'

const DASHBOARD_WIDTH = 1100
const DASHBOARD_HEIGHT = 700
const INFO_WINDOW_DEFAULTS = {
  width: 1400,
  height: 800,
  minWidth: 900,
  minHeight: 400
} as const
const OVERLAY_CONTROL_WINDOW_DEFAULTS = {
  width: 1240,
  height: 760,
  minWidth: 1180,
  minHeight: 680
} as const

interface UiPrefs {
  showQuitConfirm: boolean
  quitConfirmResetAppliedAfterTesting: boolean
}

type GlobalUiSettings = GlobalUiSettingsPayload

const DEFAULT_UI_PREFS: UiPrefs = {
  showQuitConfirm: true,
  quitConfirmResetAppliedAfterTesting: false
}

let uiPrefs: UiPrefs = DEFAULT_UI_PREFS
const DEFAULT_GLOBAL_UI_SETTINGS: GlobalUiSettings = {
  darkMode: true,
  accent: '#dc2626',
  logoPrimary: '#eb7b27',
  logoSecondary: '#14537e',
  reduceMotion: false,
  measurementUnits: { ...DEFAULT_MEASUREMENT_UNITS }
}
let globalUiSettings: GlobalUiSettings = DEFAULT_GLOBAL_UI_SETTINGS
let isAppQuitting = false
let isQuitDialogOpen = false
const modalBackdropWindowIds = new Set<number>()

//* track child windows so we don't open duplicates
const childWindows: Map<string, BrowserWindow> = new Map()
const suppressOverlayMoveEvents = new Set<string>()

const OVERLAY_WINDOW_IDS = new Set<string>([
  'OVERLAY-TOWER',
  'OVERLAY-DRIVER',
  'OVERLAY-GAP',
  'OVERLAY-SESSION'
])

function isOverlayWindowId(id: string): boolean {
  return OVERLAY_WINDOW_IDS.has(id)
}

function closeAllOverlayWindows(): void {
  for (const [id, win] of childWindows.entries()) {
    if (!isOverlayWindowId(id)) continue
    if (win.isDestroyed()) continue
    win.close()
  }
}

function clampBoundsToDisplay(
  bounds: Electron.Rectangle,
  displayBounds: Electron.Rectangle
): Electron.Rectangle {
  const clampAxis = (
    position: number,
    size: number,
    displayPosition: number,
    displaySize: number
  ): number => {
    const fitsWithinDisplay = size <= displaySize
    const min = fitsWithinDisplay ? displayPosition : displayPosition + displaySize - size
    const max = fitsWithinDisplay ? displayPosition + displaySize - size : displayPosition

    return Math.min(Math.max(position, min), max)
  }

  return {
    ...bounds,
    x: clampAxis(bounds.x, bounds.width, displayBounds.x, displayBounds.width),
    y: clampAxis(bounds.y, bounds.height, displayBounds.y, displayBounds.height)
  }
}

function getDisplayForBounds(bounds: Electron.Rectangle): Electron.Display {
  const centerPoint = {
    x: Math.round(bounds.x + bounds.width / 2),
    y: Math.round(bounds.y + bounds.height / 2)
  }

  const displays = screen.getAllDisplays()
  const primaryDisplay = screen.getPrimaryDisplay()

  let closestDisplay = primaryDisplay
  let closestDistance = Number.POSITIVE_INFINITY

  for (const display of displays) {
    const displayCenterX = display.bounds.x + display.bounds.width / 2
    const displayCenterY = display.bounds.y + display.bounds.height / 2
    const dx = centerPoint.x - displayCenterX
    const dy = centerPoint.y - displayCenterY
    const distance = dx * dx + dy * dy

    if (distance < closestDistance) {
      closestDistance = distance
      closestDisplay = display
    }
  }

  return closestDisplay
}

function getOpenNonOverlayChildWindowCount(): number {
  return Array.from(childWindows.entries()).filter(([id, win]) => {
    return !isOverlayWindowId(id) && !win.isDestroyed()
  }).length
}

function getUiPrefsPath(): string {
  return join(app.getPath('userData'), 'ui-prefs.json')
}

function loadUiPrefs(): UiPrefs {
  try {
    const raw = readFileSync(getUiPrefsPath(), 'utf8')
    const parsed = JSON.parse(raw) as Partial<UiPrefs>
    return {
      ...DEFAULT_UI_PREFS,
      ...parsed
    }
  } catch {
    return DEFAULT_UI_PREFS
  }
}

function saveUiPrefs(next: UiPrefs): void {
  const path = getUiPrefsPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(next, null, 2), 'utf8')
}

function getTitlebarOverlayTheme(height: number): Electron.TitleBarOverlay {
  if (globalUiSettings.darkMode) {
    return {
      color: '#0f1117',
      symbolColor: '#f1f5f9',
      height
    }
  }

  return {
    color: '#e9edf3',
    symbolColor: '#0f172a',
    height
  }
}

function getSolidWindowBackground(): string {
  return globalUiSettings.darkMode ? '#08090c' : '#dbe4ef'
}

function getModalMaskedTitlebarOverlayTheme(height: number): Electron.TitleBarOverlay {
  const modalBackdropColor = globalUiSettings.darkMode
    ? 'rgba(6, 10, 16, 0.74)'
    : 'rgba(148, 163, 184, 0.34)'

  return {
    color: modalBackdropColor,
    // Hide native symbols while preserving the modal backdrop blend.
    symbolColor: modalBackdropColor,
    height
  }
}

function applyWindowTheme(win: BrowserWindow, titlebarHeight: number): void {
  if (win.isDestroyed()) return

  try {
    if (modalBackdropWindowIds.has(win.id)) {
      win.setTitleBarOverlay(getModalMaskedTitlebarOverlayTheme(titlebarHeight))
      return
    }

    win.setTitleBarOverlay(getTitlebarOverlayTheme(titlebarHeight))
  } catch {
    // no-op for windows that don't support title bar overlays
  }
}

function broadcastGlobalUiSettings(): void {
  const payload = globalUiSettings
  for (const win of BrowserWindow.getAllWindows()) {
    if (win.isDestroyed()) continue
    win.webContents.send('settings:globalUiChanged', payload)
  }
}

function applyThemeToOpenWindows(mainWindow: BrowserWindow): void {
  applyWindowTheme(mainWindow, 56)

  for (const win of childWindows.values()) {
    if (win.isDestroyed()) continue
    applyWindowTheme(win, 40)
  }
}

function applyGlobalUiSettings(next: GlobalUiSettings, mainWindow: BrowserWindow): void {
  globalUiSettings = next
  applyThemeToOpenWindows(mainWindow)
  broadcastGlobalUiSettings()
}

function resetQuitConfirmPreferenceOnceAfterTesting(): void {
  if (uiPrefs.quitConfirmResetAppliedAfterTesting) return

  uiPrefs = {
    ...uiPrefs,
    showQuitConfirm: true,
    quitConfirmResetAppliedAfterTesting: true
  }
  saveUiPrefs(uiPrefs)
}

function closeAllManagedWindows(exceptIds: Set<string> = new Set()): void {
  for (const [id, win] of childWindows.entries()) {
    if (exceptIds.has(id)) continue
    if (win.isDestroyed()) continue
    win.close()
  }
}

function focusMainWindow(mainWindow: BrowserWindow): void {
  if (mainWindow.isDestroyed()) return
  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }
  mainWindow.show()
  mainWindow.focus()
}

function resetWindowToDefaultSize(win: BrowserWindow, width: number, height: number): void {
  if (win.isDestroyed()) return
  if (win.isFullScreen()) {
    win.setFullScreen(false)
  }
  if (win.isMaximized()) {
    win.unmaximize()
  }
  if (win.isMinimized()) {
    win.restore()
  }

  win.setSize(width, height)
  win.center()
}

function resetManagedWindowLayouts(mainWindow: BrowserWindow): void {
  resetWindowToDefaultSize(mainWindow, DASHBOARD_WIDTH, DASHBOARD_HEIGHT)

  const infoWindow = childWindows.get('INFO')
  if (infoWindow && !infoWindow.isDestroyed()) {
    resetWindowToDefaultSize(infoWindow, INFO_WINDOW_DEFAULTS.width, INFO_WINDOW_DEFAULTS.height)
  }

  const overlayControlWindow = childWindows.get('OVERLAY-CONTROL')
  if (overlayControlWindow && !overlayControlWindow.isDestroyed()) {
    resetWindowToDefaultSize(
      overlayControlWindow,
      OVERLAY_CONTROL_WINDOW_DEFAULTS.width,
      OVERLAY_CONTROL_WINDOW_DEFAULTS.height
    )
  }
}

function dismissDisconnectNotice(mainWindow: BrowserWindow): void {
  setDisconnectNoticeVisibility(mainWindow, false)
  focusMainWindow(mainWindow)
}

function dismissQuitConfirm(mainWindow: BrowserWindow): void {
  isQuitDialogOpen = false
  setQuitConfirmVisibility(mainWindow, false)
  focusMainWindow(mainWindow)
}

function setDisconnectNoticeVisibility(mainWindow: BrowserWindow, isVisible: boolean): void {
  if (mainWindow.isDestroyed()) return
  mainWindow.webContents.send('system:disconnectNoticeVisibility', isVisible)
}

function setQuitConfirmVisibility(mainWindow: BrowserWindow, isVisible: boolean): void {
  if (mainWindow.isDestroyed()) return
  mainWindow.webContents.send('system:quitConfirmVisibility', isVisible)
}

function openDisconnectNotice(mainWindow: BrowserWindow): void {
  isQuitDialogOpen = false
  setQuitConfirmVisibility(mainWindow, false)
  setDisconnectNoticeVisibility(mainWindow, true)
}

function openQuitConfirm(mainWindow: BrowserWindow): void {
  isQuitDialogOpen = true
  setQuitConfirmVisibility(mainWindow, true)
}

function resetQuitConfirmPreference(): void {
  uiPrefs = {
    ...uiPrefs,
    showQuitConfirm: true
  }
  saveUiPrefs(uiPrefs)
}

function toSafeExternalUrl(rawUrl: string): string | null {
  if (typeof rawUrl !== 'string' || rawUrl.length === 0) {
    return null
  }

  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

function getDevRendererOrigin(): string | null {
  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (!devUrl) {
    return null
  }

  try {
    return new URL(devUrl).origin
  } catch {
    return null
  }
}

function isAllowedInAppNavigation(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol === 'file:') {
      return true
    }

    const devOrigin = getDevRendererOrigin()
    return devOrigin !== null && parsed.origin === devOrigin
  } catch {
    return false
  }
}

function attachWebContentsSecurityHandlers(win: BrowserWindow): void {
  win.webContents.setWindowOpenHandler(({ url }) => {
    const safeUrl = toSafeExternalUrl(url)
    if (safeUrl) {
      void shell.openExternal(safeUrl)
    }
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (isAllowedInAppNavigation(url)) {
      return
    }

    event.preventDefault()
    const safeUrl = toSafeExternalUrl(url)
    if (safeUrl) {
      void shell.openExternal(safeUrl)
    }
  })
}

const createMainWindow = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: DASHBOARD_WIDTH,
    height: DASHBOARD_HEIGHT,
    minWidth: 900,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: getTitlebarOverlayTheme(56),
    backgroundColor: getSolidWindowBackground(),
    icon: join(__dirname, '../../resources/rd-icon-2.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.once('ready-to-show', () => win.show())
  setTimeout(() => {
    // fallback in case 'ready-to-show' doesn't fire
    if (!win.isDestroyed() && !win.isVisible()) win.show()
  }, 3000)
  attachWebContentsSecurityHandlers(win)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

const createChildWindow = (
  id: string,
  route: string,
  options: Partial<Electron.BrowserWindowConstructorOptions>,
  mainWindow: BrowserWindow
): BrowserWindow => {
  //* if already open just focus it
  const existing = childWindows.get(id)
  if (existing && !existing.isDestroyed()) {
    existing.focus()
    return existing
  }

  const isFrameless = options.frame === false

  const win = new BrowserWindow({
    show: false,
    backgroundColor: isFrameless ? '#00000000' : getSolidWindowBackground(),
    ...(isFrameless
      ? {}
      : {
          titleBarStyle: 'hidden',
          titleBarOverlay: getTitlebarOverlayTheme(40)
        }),
    icon: join(__dirname, '../../resources/rd-icon-2.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    ...options
  })

  win.once('ready-to-show', () => win.show())
  win.webContents.on('did-finish-load', () => {
    if (options.title) win.setTitle(options.title)
  })
  attachWebContentsSecurityHandlers(win)

  //* load same renderer with hash route
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const base = process.env['ELECTRON_RENDERER_URL'].replace(/\/$/, '')
    win.loadURL(`${base}/#${route}`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: route
    })
  }

  //* clean up map entry and notify dashboard when closed
  win.on('closed', () => {
    childWindows.delete(id)
    modalBackdropWindowIds.delete(win.id)

    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window:closed', id)
    }

    if (getOpenNonOverlayChildWindowCount() === 0 && mainWindow.isDestroyed()) {
      closeAllOverlayWindows()
    }
  })

  childWindows.set(id, win)
  return win
}

const createOverlayWindow = (
  id: string,
  route: string,
  x: number,
  y: number,
  width: number,
  height: number
): BrowserWindow => {
  const existing = childWindows.get(id)
  if (existing && !existing.isDestroyed()) {
    existing.focus()
    return existing
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
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  // click-through by default
  win.setIgnoreMouseEvents(true, { forward: true })

  win.once('ready-to-show', () => win.show())
  attachWebContentsSecurityHandlers(win)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#${route}`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: route
    })
  }

  win.on('closed', () => {
    childWindows.delete(id)
  })

  win.on('move', () => {
    if (suppressOverlayMoveEvents.has(id)) {
      suppressOverlayMoveEvents.delete(id)
      return
    }

    const currentBounds = win.getBounds()
    const targetDisplay = getDisplayForBounds(currentBounds)
    const clampedBounds = clampBoundsToDisplay(currentBounds, targetDisplay.bounds)
    const didClamp = clampedBounds.x !== currentBounds.x || clampedBounds.y !== currentBounds.y

    if (didClamp) {
      suppressOverlayMoveEvents.add(id)
      win.setBounds(clampedBounds)
    }
  })
  win.on('will-move', (event, newBounds) => {
    const targetDisplay = getDisplayForBounds(newBounds)
    const clampedBounds = clampBoundsToDisplay(newBounds, targetDisplay.bounds)
    const didClamp = clampedBounds.x !== newBounds.x || clampedBounds.y !== newBounds.y

    if (!didClamp) return

    event.preventDefault()
    suppressOverlayMoveEvents.add(id)
    win.setBounds(clampedBounds)
  })

  childWindows.set(id, win)
  return win
}

const registerWindowIpc = (mainWindow: BrowserWindow): void => {
  //* open a named window
  registerIpcHandle('window:open', (_event, id: string): boolean => {
    if (id === 'INFO') {
      createChildWindow(
        'INFO',
        'info',
        {
          ...INFO_WINDOW_DEFAULTS,
          title: 'RaceDirector | Info Window'
        },
        mainWindow
      )
      return true
    }

    if (id === 'OVERLAY-CONTROL') {
      createChildWindow(
        'OVERLAY-CONTROL',
        'overlay-control',
        {
          ...OVERLAY_CONTROL_WINDOW_DEFAULTS,
          title: 'RaceDirector | Overlay Control'
        },
        mainWindow
      )
      return true
    }

    //* overlay windows
    const OVERLAY_SIZES: Record<string, { route: string; w: number; h: number }> = {
      'OVERLAY-TOWER': { route: 'overlay/tower', w: 400, h: 700 },
      'OVERLAY-DRIVER': { route: 'overlay/driver', w: 896, h: 286 },
      'OVERLAY-GAP': { route: 'overlay/gap', w: 1904, h: 316 },
      'OVERLAY-SESSION': { route: 'overlay/session', w: 1120, h: 430 }
    }

    const def = OVERLAY_SIZES[id]
    if (def) {
      const overlayScale = getOverlayWindowScale(id)
      createOverlayWindow(
        id,
        def.route,
        0,
        0,
        Math.max(1, Math.round(def.w * overlayScale)),
        Math.max(1, Math.round(def.h * overlayScale))
      )
      return true
    }

    return false
  })

  // move/resize overlay windows
  registerIpcHandle(
    'overlay:updateBounds',
    (_e, id: string, x: number, y: number, w: number, h: number): Electron.Rectangle | null => {
      const win = childWindows.get(id)
      if (win && !win.isDestroyed()) {
        const nextBounds = { x, y, width: w, height: h }
        const targetDisplay = getDisplayForBounds(nextBounds)
        const clampedBounds = clampBoundsToDisplay(nextBounds, targetDisplay.bounds)
        win.setBounds(clampedBounds)
        return clampedBounds
      }
      return null
    }
  )

  // toggle drag mode
  registerIpcHandle('overlay:setDragMode', (_e, id: string, enabled: boolean): void => {
    const win = childWindows.get(id)
    if (win && !win.isDestroyed()) {
      win.setIgnoreMouseEvents(!enabled, { forward: true })
      win.setFocusable(enabled)
    }
  })

  // get bounds of overlay window
  registerIpcHandle('overlay:getBounds', (_e, id: string): Electron.Rectangle | null => {
    const win = childWindows.get(id)
    if (win && !win.isDestroyed()) return win.getBounds()
    return null
  })

  //* close a named window
  registerIpcHandle('window:close', (_event, id: string): void => {
    const win = childWindows.get(id)
    if (win && !win.isDestroyed()) win.close()
  })

  registerIpcHandle('system:ackDisconnect', (): void => {
    dismissDisconnectNotice(mainWindow)
  })

  registerIpcHandle('system:getQuitConfirmPreference', (): boolean => {
    return uiPrefs.showQuitConfirm
  })

  registerIpcHandle('system:resetWindowLayouts', (): void => {
    resetManagedWindowLayouts(mainWindow)
  })

  registerIpcHandle('system:resetQuitConfirmPreference', (): void => {
    resetQuitConfirmPreference()
  })

  registerIpcHandle('system:cancelQuit', (): void => {
    dismissQuitConfirm(mainWindow)
  })

  registerIpcHandle('system:confirmQuit', (_event, dontAskAgain: boolean): void => {
    uiPrefs = {
      ...uiPrefs,
      showQuitConfirm: !dontAskAgain
    }
    saveUiPrefs(uiPrefs)

    isQuitDialogOpen = false
    setQuitConfirmVisibility(mainWindow, false)

    isAppQuitting = true
    closeAllManagedWindows()

    if (!mainWindow.isDestroyed()) {
      mainWindow.close()
    }
  })

  registerIpcHandle('settings:applyGlobalUi', (_event, next: GlobalUiSettings): void => {
    applyGlobalUiSettings(next, mainWindow)
  })

  registerIpcHandle('window:setModalBackdropActive', (event, isActive: boolean): void => {
    const targetWindow = BrowserWindow.fromWebContents(event.sender)
    if (!targetWindow || targetWindow.isDestroyed()) return

    if (isActive) {
      modalBackdropWindowIds.add(targetWindow.id)
    } else {
      modalBackdropWindowIds.delete(targetWindow.id)
    }

    const titlebarHeight = targetWindow.id === mainWindow.id ? 56 : 40
    applyWindowTheme(targetWindow, titlebarHeight)
  })

  //* query which windows are open
  registerIpcHandle('window:getOpen', (): string[] => {
    return Array.from(childWindows.entries())
      .filter(([, w]) => !w.isDestroyed())
      .map(([id]) => id)
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

const bootstrap = async (): Promise<void> => {
  try {
    await app.whenReady()
    electronApp.setAppUserModelId('com.racedirector')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    uiPrefs = loadUiPrefs()
    resetQuitConfirmPreferenceOnceAfterTesting()

    const mainWindow = createMainWindow()

    const handleConnectionLost = (): void => {
      if (isAppQuitting || mainWindow.isDestroyed()) return

      closeAllManagedWindows()
      openDisconnectNotice(mainWindow)
      mainWindow.focus()
    }

    mainWindow.on('close', (event) => {
      if (isAppQuitting) return
      if (isQuitDialogOpen) {
        event.preventDefault()
        return
      }

      if (!uiPrefs.showQuitConfirm) {
        isAppQuitting = true
        closeAllManagedWindows()
        return
      }

      event.preventDefault()
      openQuitConfirm(mainWindow)
    })

    mainWindow.on('closed', () => {
      modalBackdropWindowIds.delete(mainWindow.id)
      closeAllManagedWindows()
    })

    registerIpcHandlers(mainWindow, handleConnectionLost)
    registerOverlayHandlers()
    registerWindowIpc(mainWindow)
    registerUpdaterHandlers()
    initializeAutoUpdater({
      onBeforeInstall: () => {
        isAppQuitting = true
        closeAllManagedWindows()
      }
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
  } catch (err) {
    console.error('Failed to bootstrap app:', err)
    app.quit()
  }
}

void bootstrap()
