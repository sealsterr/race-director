import { useEffect, useState } from 'react'
import { useOverlayStore } from '../../../store/overlayStore'
import type { DriverSettings, GapSettings, OverlayConfig } from '../../../store/overlayStore'
import { useMeasurementUnits } from '../../../hooks/useMeasurementUnits'
import { DRIVER_DEFAULT_SETTINGS } from '../driver/driverCardUtils'
import { GAP_DEFAULT_SETTINGS, getTrendColors, getTrendPalette } from './gapOverlayUtils'
import { buildGapBattle } from './gapBattleUtils'
import { useGapBattleSelection } from './useGapBattleSelection'
import { useGapPreviewData } from './useGapPreviewData'
import { useGapBattleTelemetry } from './useGapBattleTelemetry'
import type { GapOverlayBattle, GapOverlayCenterState } from './gapTypes'

interface GapOverlayData {
  readonly overlayConfig: OverlayConfig<GapSettings>
  readonly battle: GapOverlayBattle | null
  readonly center: GapOverlayCenterState | null
  readonly dragMode: boolean
  readonly opacity: number
  readonly scale: number
  readonly isConfigReady: boolean
  readonly speedUnit: ReturnType<typeof useMeasurementUnits>['speedUnit']
  readonly trendPalette: ReturnType<typeof getTrendPalette>
  readonly trendColors: ReturnType<typeof getTrendColors>
}

export function useGapOverlayData(): GapOverlayData {
  const { speedUnit } = useMeasurementUnits()
  const storeGapConfig = useOverlayStore(
    (state) => state.getOverlay('OVERLAY-GAP') as OverlayConfig<GapSettings> | undefined
  )
  const storeDriverConfig = useOverlayStore(
    (state) => state.getOverlay('OVERLAY-DRIVER') as OverlayConfig<DriverSettings> | undefined
  )
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig<GapSettings>>(
    storeGapConfig ?? {
      id: 'OVERLAY-GAP',
      enabled: false,
      opacity: 90,
      scale: 0.8,
      x: 120,
      y: 620,
      displayId: 0,
      dragMode: false,
      settings: GAP_DEFAULT_SETTINGS
    }
  )
  const [driverSettings, setDriverSettings] = useState<DriverSettings>({
    ...DRIVER_DEFAULT_SETTINGS,
    ...storeDriverConfig?.settings
  })
  const [isConfigReady, setIsConfigReady] = useState(false)

  useEffect(() => {
    if (storeGapConfig) {
      setOverlayConfig(storeGapConfig)
    }
  }, [storeGapConfig])

  useEffect(() => {
    if (storeDriverConfig) {
      setDriverSettings({ ...DRIVER_DEFAULT_SETTINGS, ...storeDriverConfig.settings })
    }
  }, [storeDriverConfig])

  useEffect(() => {
    let cancelled = false

    void globalThis.api?.overlay
      ?.getConfig?.('OVERLAY-GAP')
      .then((raw: unknown) => {
        if (cancelled || !raw) return

        const incoming = raw as OverlayConfig<GapSettings>
        if (incoming?.id !== 'OVERLAY-GAP') return
        setOverlayConfig({
          ...incoming,
          settings: { ...GAP_DEFAULT_SETTINGS, ...incoming.settings }
        })
        setIsConfigReady(true)
      })
      .finally(() => {
        if (!cancelled) {
          setIsConfigReady(true)
        }
      })

    const unsubscribe = globalThis.api?.overlay?.onConfigUpdate?.((raw: unknown) => {
      const incoming = raw as OverlayConfig<GapSettings | DriverSettings>

      if (incoming?.id === 'OVERLAY-GAP') {
        setOverlayConfig({
          ...(incoming as OverlayConfig<GapSettings>),
          settings: { ...GAP_DEFAULT_SETTINGS, ...incoming.settings }
        })
        setIsConfigReady(true)
      }

      if (incoming?.id === 'OVERLAY-DRIVER') {
        setDriverSettings({
          ...DRIVER_DEFAULT_SETTINGS,
          ...((incoming as OverlayConfig<DriverSettings>).settings ?? {})
        })
      }
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  const settings = { ...GAP_DEFAULT_SETTINGS, ...overlayConfig.settings }
  const selection = useGapBattleSelection(settings.triggerThresholdSeconds)
  const preview = useGapPreviewData()
  const telemetry = useGapBattleTelemetry(selection.pair)
  const liveBattle =
    selection.pair === null
      ? null
      : buildGapBattle(
          selection.pair.ahead,
          selection.pair.behind,
          telemetry.ahead,
          telemetry.behind
        )
  const battle = selection.isPreview ? preview.battle : liveBattle
  const center = selection.isPreview ? preview.center : selection.center

  return {
    overlayConfig: { ...overlayConfig, settings },
    battle,
    center,
    dragMode: overlayConfig.dragMode,
    opacity: overlayConfig.opacity / 100,
    scale: overlayConfig.scale,
    isConfigReady,
    speedUnit,
    trendPalette: getTrendPalette(center?.trend ?? 'closing', driverSettings),
    trendColors: getTrendColors(driverSettings)
  }
}
