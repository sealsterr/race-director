import React from "react";
import { motion } from "framer-motion";
import { Download, RotateCw, Settings2 } from "lucide-react";
import type { AppUpdaterState } from "../../../types/updater";

interface SidebarSettingsButtonProps {
  onSettingsClick?: () => void;
  updaterState: AppUpdaterState | null;
  onDownloadUpdate: () => void;
}

interface UpdateActionState {
  title: string;
  canClick: boolean;
  mode: "download" | "apply";
}

const getUpdateActionState = (
  updaterState: AppUpdaterState | null
): UpdateActionState => {
  if (updaterState?.hasUpdate && updaterState.downloading) {
    return {
      title: "Downloading update in background.",
      canClick: false,
      mode: "download",
    };
  }

  if (updaterState?.hasUpdate && updaterState.downloaded) {
    return {
      title: "Update is ready. Click to apply and restart!",
      canClick: true,
      mode: "apply",
    };
  }

  if (updaterState?.hasUpdate) {
    const latestVersion = updaterState.latestVersion;
    return {
      title: `${latestVersion ?? ""} is available. Click to download!`,
      canClick: Boolean(
        updaterState &&
          !updaterState.checking &&
          !updaterState.downloading
      ),
      mode: "download",
    };
  }

  return {
    title: "Up to date!",
    canClick: false,
    mode: "download",
  };
};

const SidebarSettingsButton = ({
  onSettingsClick,
  updaterState,
  onDownloadUpdate,
}: SidebarSettingsButtonProps): React.ReactElement => {
  const actionState = getUpdateActionState(updaterState);

  return (
    <div
      className="
        relative flex items-center gap-2 rounded border border-rd-border
        bg-rd-elevated px-2 py-2
      "
    >
      <motion.button
        type="button"
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.985 }}
        onClick={onSettingsClick}
        className="
          group flex min-w-0 flex-1 items-center gap-3 rounded
          px-1.5 py-1 text-left transition-colors duration-150
        "
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-rd-border/50 text-rd-muted">
          <Settings2 size={15} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-rd-text">
            Settings
          </p>
        </div>
      </motion.button>

      <button
        type="button"
        onClick={onDownloadUpdate}
        disabled={!actionState.canClick}
        title={actionState.title}
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center bg-transparent
          ${
            actionState.canClick
              ? "cursor-pointer text-rd-gold"
              : "cursor-not-allowed text-rd-subtle opacity-45"
          }
        `}
      >
        {actionState.mode === "apply" ? (
          <RotateCw size={16} />
        ) : (
          <Download size={16} />
        )}
      </button>
    </div>
  );
};

export default SidebarSettingsButton;
