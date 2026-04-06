import React from 'react'
import ConnectionPanel from './ConnectionPanel'
import SessionPanel from './SessionPanel'
import ActivityLog from './ActivityLog'
import Sidebar from './Sidebar'
import DashboardPaneFrame from './DashboardPaneFrame'
import DashboardResizeHandle from './DashboardResizeHandle'
import useDashboardPaneLayout from '../hooks/useDashboardPaneLayout'
import type { ConnectionStatus, SessionInfo } from '../../../types/lmu'
import type { AppUpdaterState } from '../../../types/updater'
import type { DashboardSettings } from '../settings/types'
import type { LogEntry, LogType, WindowId, WindowItem } from '../../../types/dashboard'

interface DashboardWorkspaceProps {
  connection: ConnectionStatus
  session: SessionInfo | null
  entries: LogEntry[]
  settings: DashboardSettings
  updaterState: AppUpdaterState | null
  windows: WindowItem[]
  onLaunch: (id: WindowId) => void
  onSettingsClick: () => void
  onConnectionChange: (status: ConnectionStatus) => void
  onLog: (message: string, type?: LogType) => void
  onDownloadUpdate: () => void
}

const DashboardWorkspace = ({
  connection,
  session,
  entries,
  settings,
  updaterState,
  windows,
  onLaunch,
  onSettingsClick,
  onConnectionChange,
  onLog,
  onDownloadUpdate
}: DashboardWorkspaceProps): React.ReactElement => {
  const {
    activeResizeTarget,
    workspaceRef,
    mainColumnRef,
    topRowRef,
    sidebarWidth,
    topRowHeight,
    topPanelsWidth,
    beginSidebarResize,
    beginTopPanelsResize,
    beginTopRowResize,
    nudgeSidebar,
    nudgeTopPanels,
    nudgeTopRow
  } = useDashboardPaneLayout()

  return (
    <div ref={workspaceRef} className="flex min-h-0 flex-1">
      <div
        className="relative h-full shrink-0"
        style={{ width: sidebarWidth, minWidth: 220, maxWidth: 420 }}
      >
        <DashboardPaneFrame baseWidth={256} baseHeight={580} className="h-full">
          <Sidebar
            windows={windows}
            onLaunch={onLaunch}
            onSettingsClick={onSettingsClick}
            updaterState={updaterState}
            onDownloadUpdate={onDownloadUpdate}
          />
        </DashboardPaneFrame>
      </div>

      <DashboardResizeHandle
        active={activeResizeTarget === 'sidebar'}
        ariaLabel="Resize sidebar"
        className="h-full w-4 shrink-0 cursor-col-resize"
        orientation="vertical"
        onPointerDown={beginSidebarResize}
        onStep={nudgeSidebar}
      />

      <div
        ref={mainColumnRef}
        className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4 pr-4 pb-4"
      >
        <div
          ref={topRowRef}
          className="flex min-h-0"
          style={{ height: topRowHeight, minHeight: 220 }}
        >
          <div
            className="relative min-w-0 shrink-0"
            style={{ width: topPanelsWidth, minWidth: 280 }}
          >
            <DashboardPaneFrame baseWidth={420} baseHeight={220} className="h-full">
              <ConnectionPanel
                connection={connection}
                defaultApiUrl={settings.network.apiUrl}
                defaultPollRateMs={settings.network.pollRateMs}
                onConnectionChange={onConnectionChange}
                onLog={onLog}
              />
            </DashboardPaneFrame>
          </div>

          <DashboardResizeHandle
            active={activeResizeTarget === 'topPanels'}
            ariaLabel="Resize top panels"
            className="h-full w-4 shrink-0 cursor-col-resize"
            orientation="vertical"
            onPointerDown={beginTopPanelsResize}
            onStep={nudgeTopPanels}
          />

          <div className="min-w-0 flex-1">
            <DashboardPaneFrame baseWidth={420} baseHeight={220} className="h-full">
              <SessionPanel session={session} />
            </DashboardPaneFrame>
          </div>
        </div>

        <DashboardResizeHandle
          active={activeResizeTarget === 'topRow'}
          ariaLabel="Resize top row"
          className="h-4 w-full shrink-0 cursor-row-resize"
          orientation="horizontal"
          onPointerDown={beginTopRowResize}
          onStep={nudgeTopRow}
        />

        <div className="min-h-0 flex-1">
          <DashboardPaneFrame baseWidth={840} baseHeight={300} className="h-full">
            <ActivityLog entries={entries} />
          </DashboardPaneFrame>
        </div>
      </div>
    </div>
  )
}

export default DashboardWorkspace
