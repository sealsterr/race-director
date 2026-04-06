import React, { useEffect, useState } from 'react'
import Dashboard from './windows/dashboard'
import InfoWindow from './windows/info'
import OverlayControl from './windows/overlay-control'
import TowerOverlay from './windows/overlay/tower/index'
import DriverOverlay from './windows/overlay/driver'
import GapOverlay from './windows/overlay/gap'
import SessionOverlay from './windows/overlay/session'
import useGlobalUiSettings from './hooks/useGlobalUiSettings'

const ROUTES: Record<string, React.ReactElement> = {
  '': <Dashboard />,
  info: <InfoWindow />,
  'overlay-control': <OverlayControl />,
  'overlay/tower': <TowerOverlay />,
  'overlay/driver': <DriverOverlay />,
  'overlay/gap': <GapOverlay />,
  'overlay/session': <SessionOverlay />
}

const App = (): React.ReactElement => {
  useGlobalUiSettings()

  const [route, setRoute] = useState(() => globalThis.location.hash.replace('#', '').toLowerCase())

  useEffect(() => {
    const onHashChange = (): void => {
      setRoute(globalThis.location.hash.replace('#', '').toLowerCase())
    }
    globalThis.addEventListener('hashchange', onHashChange)
    return () => globalThis.removeEventListener('hashchange', onHashChange)
  }, [])

  return ROUTES[route] ?? <Dashboard />
}

export default App
