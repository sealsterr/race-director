import React from "react";
import { motion } from "framer-motion";
import { Download, Settings2 } from "lucide-react";
import type { AppUpdaterState } from "../../../types/updater";

interface SidebarSettingsButtonProps {
  onSettingsClick?: () => void;
  updaterState: AppUpdaterState | null;
  onDownloadUpdate: () => void;
}

interface UpdateActionState {
  title: string;
  canDownload: boolean;
}

const getUpdateActionState = (
  updaterState: AppUpdaterState | null
): UpdateActionState => {
  const hasNewVersion = Boolean(
    updaterState?.hasUpdate
  );

  if (hasNewVersion) {
    const latestVersion = updaterState?.latestVersion;
    return {
      title: `New version ${latestVersion ?? ""} is available.`,
      canDownload: Boolean(
        updaterState &&
          !updaterState.checking &&
          !updaterState.downloading
      ),
    };
  }

  return {
    title: "App is up to date.",
    canDownload: false,
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
          group flex min-w-0 flex-1 items-center gap-3 rounded border border-transparent
          px-1.5 py-1 text-left transition-colors duration-150 hover:border-rd-border/70
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
        disabled={!actionState.canDownload}
        title={actionState.title}
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded bg-transparent
          transition-colors duration-150
          ${
            actionState.canDownload
              ? "cursor-pointer text-rd-gold hover:bg-rd-gold/10"
              : "cursor-not-allowed text-rd-subtle opacity-45"
          }
        `}
      >
        <Download size={16} />
      </button>
    </div>
  );
};

export default SidebarSettingsButton;
