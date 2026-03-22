import { useCallback, useEffect, useState } from "react";
import type { AppUpdaterState } from "../../../types/updater";

interface UseAppUpdaterResult {
  updaterState: AppUpdaterState | null;
  downloadUpdate: () => Promise<void>;
}

const useAppUpdater = (): UseAppUpdaterResult => {
  const [updaterState, setUpdaterState] = useState<AppUpdaterState | null>(null);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async (): Promise<void> => {
      try {
        const state = await globalThis.api.updater.getState();
        if (!isMounted) return;
        setUpdaterState(state);
      } catch (error) {
        console.warn("Failed to hydrate updater state:", error);
      }
    };

    void hydrate();

    const unsubscribe = globalThis.api.updater.onStateChange((state) => {
      setUpdaterState(state);
    });

    void globalThis.api.updater.check();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const downloadUpdate = useCallback(async () => {
    try {
      if (updaterState?.downloaded) {
        await globalThis.api.updater.install();
        return;
      }

      await globalThis.api.updater.download();
    } catch (error) {
      console.warn("Failed to start update download:", error);
    }
  }, [updaterState?.downloaded]);

  return {
    updaterState,
    downloadUpdate,
  };
};

export default useAppUpdater;
