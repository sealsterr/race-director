import React, { useState, useCallback } from 'react'
import TopBar from './components/TopBar'
import { WINDOW_DEFINITIONS } from './components/Sidebar'
import DashboardWorkspace from './components/DashboardWorkspace'
import SettingsModal from './components/settings/SettingsModal'
import SystemPopups from './components/system-popups/SystemPopups'
import useAppUpdater from './hooks/useAppUpdater'
import useAutoReconnect from './hooks/useAutoReconnect'
import useDashboardIpcSync from './hooks/useDashboardIpcSync'
import useDashboardSettings from './hooks/useDashboardSettings'
import useDashboardStartup from './hooks/useDashboardStartup'
import { DASHBOARD_LAYOUT_RESET_EVENT } from './hooks/useDashboardPaneLayout'
import useDashboardViewportScale from './hooks/useDashboardViewportScale'
import useSystemPopups from './hooks/useSystemPopups'
import { useRaceStore } from '../../store/raceStore'
import type { LogEntry, LogType, WindowId, WindowItem } from '../../types/dashboard'

const createLogEntry = (message: string, type: LogType = 'INFO'): LogEntry => ({
  id: crypto.randomUUID(),
  timestamp: new Date(),
  type,
  message
})

const updateWindowOpenStatus = (windows: WindowItem[], id: string, isOpen: boolean): WindowItem[] =>
  windows.map((w) => (w.id === id ? { ...w, isOpen } : w))

const Dashboard = (): React.ReactElement => {
  const { connection, session, setConnection, setSession, setStandings } = useRaceStore()
  const {
    settings,
    draftSettings,
    hasUnsavedChanges,
    isSettingsOpen,
    openSettings,
    closeSettings,
    updateDraft,
    saveDraft,
    resetDraftToDefaults
  } = useDashboardSettings()

  const [log, setLog] = useState<LogEntry[]>([
    createLogEntry('Race Director initialized.', 'SYSTEM'),
    createLogEntry('Waiting for LMU connection...', 'INFO')
  ])

  const [windows, setWindows] = useState<WindowItem[]>(
    WINDOW_DEFINITIONS.map((def) => ({ ...def, isOpen: false }))
  )
  const { updaterState, downloadUpdate } = useAppUpdater()
  const {
    showDisconnectNotice,
    showQuitConfirm,
    dontAskAgain,
    isBusy,
    errorMessage,
    setDontAskAgain,
    clearError,
    dismissDisconnectNotice,
    cancelQuit,
    confirmQuit
  } = useSystemPopups()

  const addLog = useCallback(
    (message: string, type: LogType = 'INFO') => {
      setLog((prev) => {
        const next = [...prev, createLogEntry(message, type)]
        return next.slice(-settings.general.activityLogLimit)
      })
    },
    [settings.general.activityLogLimit]
  )

  const updateWindowOpen = useCallback((id: WindowId, isOpen: boolean) => {
    setWindows((prev) => updateWindowOpenStatus(prev, id, isOpen))
  }, [])

  useDashboardStartup({
    settings,
    onLog: addLog,
    onWindowOpenStatus: updateWindowOpen
  })
  useAutoReconnect({ connection, settings, onLog: addLog })
  useDashboardIpcSync({
    setConnection,
    setSession,
    setStandings,
    addLog,
    setWindows,
    closeOverlaysWhenControlCloses: settings.overlay.closeOverlaysWhenControlCloses
  })

  const handleLaunch = useCallback(
    async (id: WindowId) => {
      const win = windows.find((w) => w.id === id)
      if (!win) return

      if (win.isOpen) {
        await globalThis.api.windows.close(id)
        setWindows((prev) => updateWindowOpenStatus(prev, id, false))
        addLog(`Closed ${win.label}`, 'WARNING')
      } else {
        await globalThis.api.windows.open(id)
        setWindows((prev) => updateWindowOpenStatus(prev, id, true))
        addLog(`Launched ${win.label}`, 'SUCCESS')
      }
    },
    [windows, addLog]
  )

  const handleSettingsClick = useCallback(() => {
    openSettings()
  }, [openSettings])
  useDashboardViewportScale()

  const handleResetPanelLayouts = useCallback(async (): Promise<void> => {
    globalThis.dispatchEvent(new Event(DASHBOARD_LAYOUT_RESET_EVENT))
  }, [])

  const handleResetWindowSizes = useCallback(async (): Promise<void> => {
    await globalThis.api.system.resetWindowLayouts()
  }, [])

  const handleConnectionChange = useCallback(
    (status: typeof connection) => {
      setConnection(status)

      if (status === 'DISCONNECTED' || status === 'ERROR') {
        setSession(null)
        setStandings([])
      }
    },
    [setConnection, setSession, setStandings]
  )

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-rd-bg">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-rd-bg">
        <TopBar connection={connection} />

        <DashboardWorkspace
          connection={connection}
          session={session}
          entries={log}
          settings={settings}
          updaterState={updaterState}
          windows={windows}
          onLaunch={handleLaunch}
          onSettingsClick={handleSettingsClick}
          onConnectionChange={handleConnectionChange}
          onLog={addLog}
          onDownloadUpdate={downloadUpdate}
        />

        <SystemPopups
          showDisconnectNotice={showDisconnectNotice}
          showQuitConfirm={showQuitConfirm}
          dontAskAgain={dontAskAgain}
          isBusy={isBusy}
          errorMessage={errorMessage}
          onDontAskAgainChange={setDontAskAgain}
          onDismissDisconnect={async () => {
            clearError()
            await dismissDisconnectNotice()
          }}
          onCancelQuit={async () => {
            clearError()
            await cancelQuit()
          }}
          onConfirmQuit={async () => {
            clearError()
            await confirmQuit()
          }}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          hasUnsavedChanges={hasUnsavedChanges}
          settings={draftSettings}
          onChange={updateDraft}
          onClose={closeSettings}
          onSave={saveDraft}
          onResetDefaults={resetDraftToDefaults}
          onResetPanelLayouts={handleResetPanelLayouts}
          onResetWindowSizes={handleResetWindowSizes}
          onResetQuitConfirm={globalThis.api.system.resetQuitConfirmPreference}
        />
      </div>
    </div>
  )
}

export default Dashboard
