import { useCallback, useEffect, useState } from "react";

export interface UseSystemPopupsResult {
  showDisconnectNotice: boolean;
  showQuitConfirm: boolean;
  dontAskAgain: boolean;
  setDontAskAgain: (value: boolean) => void;
  dismissDisconnectNotice: () => Promise<void>;
  cancelQuit: () => Promise<void>;
  confirmQuit: () => Promise<void>;
}

const useSystemPopups = (): UseSystemPopupsResult => {
  const [showDisconnectNotice, setShowDisconnectNotice] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const refreshQuitPreference = useCallback(async () => {
    try {
      const showConfirm = await globalThis.api.system.getQuitConfirmPreference();
      setDontAskAgain(!showConfirm);
    } catch {
      setDontAskAgain(false);
    }
  }, []);

  useEffect(() => {
    void refreshQuitPreference();

    const unsubDisconnect = globalThis.api.system.onDisconnectNoticeVisibilityChange(
      (isVisible) => {
        setShowDisconnectNotice(isVisible);
      }
    );

    const unsubQuit = globalThis.api.system.onQuitConfirmVisibilityChange(
      (isVisible) => {
        setShowQuitConfirm(isVisible);
        if (isVisible) {
          void refreshQuitPreference();
        }
      }
    );

    return () => {
      unsubDisconnect();
      unsubQuit();
    };
  }, [refreshQuitPreference]);

  const dismissDisconnectNotice = useCallback(async () => {
    setShowDisconnectNotice(false);
    await globalThis.api.system.ackDisconnect();
  }, []);

  const cancelQuit = useCallback(async () => {
    setShowQuitConfirm(false);
    await globalThis.api.system.cancelQuit();
  }, []);

  const confirmQuit = useCallback(async () => {
    setShowQuitConfirm(false);
    await globalThis.api.system.confirmQuit(dontAskAgain);
  }, [dontAskAgain]);

  return {
    showDisconnectNotice,
    showQuitConfirm,
    dontAskAgain,
    setDontAskAgain,
    dismissDisconnectNotice,
    cancelQuit,
    confirmQuit,
  };
};

export default useSystemPopups;
