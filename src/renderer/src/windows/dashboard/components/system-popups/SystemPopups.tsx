import React from "react";
import DisconnectNoticePopup from "./DisconnectNoticePopup";
import QuitConfirmPopup from "./QuitConfirmPopup";

interface SystemPopupsProps {
  showDisconnectNotice: boolean;
  showQuitConfirm: boolean;
  dontAskAgain: boolean;
  isBusy: boolean;
  errorMessage: string | null;
  onDontAskAgainChange: (value: boolean) => void;
  onDismissDisconnect: () => void | Promise<void>;
  onCancelQuit: () => void | Promise<void>;
  onConfirmQuit: () => void | Promise<void>;
}

const SystemPopups = ({
  showDisconnectNotice,
  showQuitConfirm,
  dontAskAgain,
  isBusy,
  errorMessage,
  onDontAskAgainChange,
  onDismissDisconnect,
  onCancelQuit,
  onConfirmQuit,
}: SystemPopupsProps): React.ReactElement | null => {
  const activePopup = showQuitConfirm
    ? "quit"
    : showDisconnectNotice
      ? "disconnect"
      : null;

  if (!activePopup) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/45 px-4 py-6"
      aria-live="assertive"
    >
      {activePopup === "disconnect" ? (
        <DisconnectNoticePopup
          isBusy={isBusy}
          errorMessage={errorMessage}
          onDismiss={onDismissDisconnect}
        />
      ) : null}

      {activePopup === "quit" ? (
        <QuitConfirmPopup
          dontAskAgain={dontAskAgain}
          isBusy={isBusy}
          errorMessage={errorMessage}
          onDontAskAgainChange={onDontAskAgainChange}
          onCancel={onCancelQuit}
          onConfirm={onConfirmQuit}
        />
      ) : null}
    </div>
  );
};

export default SystemPopups;
