import type { ReactElement } from 'react'
import DashboardPaneFrame from '../../dashboard/components/DashboardPaneFrame'
import DashboardResizeHandle from '../../dashboard/components/DashboardResizeHandle'
import { FlagActivityPanel } from './FlagActivityPanel'
import { FlagCommandPanel } from './FlagCommandPanel'
import { useFlagSystemDemo } from './useFlagSystemDemo'
import { useFlagSystemPaneLayout } from './useFlagSystemPaneLayout'

export function FlagSystemWorkspace(): ReactElement {
  const demo = useFlagSystemDemo()
  const { activeResizeTarget, workspaceRef, sidebarWidth, beginSidebarResize, nudgeSidebar } =
    useFlagSystemPaneLayout()

  return (
    <div ref={workspaceRef} className="flex min-h-0 flex-1 overflow-hidden">
      <div
        className="relative h-full shrink-0"
        style={{ width: sidebarWidth, minWidth: 320, maxWidth: 460 }}
      >
        <DashboardPaneFrame baseWidth={360} baseHeight={780} className="h-full">
          <FlagCommandPanel
            effectiveFlag={demo.effectiveFlag}
            currentLap={demo.currentLap}
            timeRemaining={demo.timeRemaining}
            sectorFlags={demo.sectorFlags}
            onApplyManualFlag={demo.applyManualFlag}
          />
        </DashboardPaneFrame>
      </div>

      <DashboardResizeHandle
        active={activeResizeTarget === 'sidebar'}
        ariaLabel="Resize flag control panel"
        className="h-full w-4 shrink-0 cursor-col-resize"
        orientation="vertical"
        onPointerDown={beginSidebarResize}
        onStep={nudgeSidebar}
      />

      <div className="min-h-0 flex-1 py-4 pr-4">
        <DashboardPaneFrame baseWidth={1180} baseHeight={760} className="h-full">
          <FlagActivityPanel
            activityFilter={demo.activityFilter}
            activityQuery={demo.activityQuery}
            filteredHistory={demo.filteredHistory}
            filteredAlerts={demo.filteredAlerts}
            onActivityFilterChange={demo.setActivityFilter}
            onActivityQueryChange={demo.setActivityQuery}
            onAcknowledgeAlert={demo.acknowledgeAlert}
          />
        </DashboardPaneFrame>
      </div>
    </div>
  )
}
