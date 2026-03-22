import React from "react";
import DisconnectNoticePopup from "./DisconnectNoticePopup";
import QuitConfirmPopup from "./QuitConfirmPopup";

interface SystemPopupsProps {
  showDisconnectNotice: boolean;
  showQuitConfirm: boolean;
  dontAskAgain: boolean;
  onDontAskAgainChange: (value: boolean) => void;
  onDismissDisconnect: () => void | Promise<void>;
  onCancelQuit: () => void | Promise<void>;
  onConfirmQuit: () => void | Promise<void>;
}

const SystemPopups = ({
  showDisconnectNotice,
  showQuitConfirm,
  dontAskAgain,
  onDontAskAgainChange,
  onDismissDisconnect,
  onCancelQuit,
  onConfirmQuit,
}: SystemPopupsProps): React.ReactElement | null => {
  if (!showDisconnectNotice && !showQuitConfirm) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      {showDisconnectNotice ? (
        <DisconnectNoticePopup onDismiss={onDismissDisconnect} />
      ) : null}

      {showQuitConfirm ? (
        <QuitConfirmPopup
          dontAskAgain={dontAskAgain}
          onDontAskAgainChange={onDontAskAgainChange}
          onCancel={onCancelQuit}
          onConfirm={onConfirmQuit}
        />
      ) : null}
    </div>
  );
};

export default SystemPopups;
