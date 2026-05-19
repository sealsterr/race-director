import type { ReactElement } from 'react'
import DashboardPaneFrame from '../../dashboard/components/DashboardPaneFrame'
import DashboardResizeHandle from '../../dashboard/components/DashboardResizeHandle'
import { FlagActivityPanel } from './FlagActivityPanel'
import { FlagCommandPanel } from './FlagCommandPanel'
import { FlagFeedPanel } from './FlagFeedPanel'
import { FlagStatusPanel } from './FlagStatusPanel'
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
        <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <DashboardPaneFrame baseWidth={1180} baseHeight={760} className="h-full">
            <FlagActivityPanel
              activityFilters={demo.activityFilters}
              activityQuery={demo.activityQuery}
              filteredHistory={demo.filteredHistory}
              filteredAlerts={demo.filteredAlerts}
              onActivityFilterToggle={demo.toggleActivityFilter}
              onActivityQueryChange={demo.setActivityQuery}
              onDismissAlert={demo.dismissAlert}
              onDismissHistoryItem={demo.dismissHistoryItem}
              onClearActivities={demo.clearActivities}
            />
          </DashboardPaneFrame>

          <div className="grid min-h-0 gap-4 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
            <DashboardPaneFrame baseWidth={560} baseHeight={360} className="h-full">
              <FlagStatusPanel
                effectiveFlag={demo.effectiveFlag}
                previewSettings={demo.previewSettings}
                syncState={demo.syncState}
              />
            </DashboardPaneFrame>

            <DashboardPaneFrame baseWidth={560} baseHeight={360} className="h-full">
              <FlagFeedPanel
                manualFlag={demo.manualFlag}
                detectedFlag={demo.detectedFlag}
                syncState={demo.syncState}
                speedLimitKph={demo.speedLimitKph}
                toleranceKph={demo.toleranceKph}
                speedAlerts={demo.speedAlerts}
              />
            </DashboardPaneFrame>
          </div>
        </div>
      </div>
    </div>
  )
}
