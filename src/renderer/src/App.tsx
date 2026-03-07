import React, { useEffect, useState } from "react";
import Dashboard from "./windows/dashboard";
import InfoWindow from "./windows/info";
import OverlayControl from "./windows/overlay-control";
import TowerOverlay from "./windows/overlay/tower/index";
import DisconnectNotice from "./windows/system/disconnect-notice";
import QuitConfirm from "./windows/system/quit-confirm";

const ROUTES: Record<string, React.ReactElement> = {
  "": <Dashboard />,
  "info": <InfoWindow />,
  "overlay-control": <OverlayControl />,
  "overlay/tower": <TowerOverlay />,
  "system/disconnect-notice": <DisconnectNotice />,
  "system/quit-confirm": <QuitConfirm />,
};

const App = (): React.ReactElement => {
  const [route, setRoute] = useState(() =>
    globalThis.location.hash.replace("#", "").toLowerCase()
  );

  useEffect(() => {
    const onHashChange = (): void => {
      setRoute(globalThis.location.hash.replace("#", "").toLowerCase());
    };
    globalThis.addEventListener("hashchange", onHashChange);
    return () => globalThis.removeEventListener("hashchange", onHashChange);
  }, []);

  return ROUTES[route] ?? <Dashboard />;
};

export default App;
