import React, { useState, useEffect } from "react";
import Dashboard from "./windows/dashboard";
import InfoWindow from "./windows/info";
import OverlayControl from "./windows/overlay-control";
import TowerOverlay from "./windows/overlay/tower/index";

const ROUTES: Record<string, React.ReactElement> = {
  "": <Dashboard />,
  "info": <InfoWindow />,
  "overlay-control": <OverlayControl />,
  "overlay/tower": <TowerOverlay />,
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