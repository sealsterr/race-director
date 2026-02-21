import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw, Settings2 } from "lucide-react";
import type { ConnectionStatus } from "../../../types/lmu";
import type { LogType } from "../../../types/dashboard";

interface ConnectionPanelProps {
  connection: ConnectionStatus;
  onConnectionChange: (status: ConnectionStatus) => void;
  onLog: (message: string, type?: LogType) => void;
}

const getStatusValue = (connection: ConnectionStatus): string => {
  if (connection === "CONNECTED") return "Active";
  if (connection === "CONNECTING") return "Connecting...";
  if (connection === "ERROR") return "Error";
  return "Offline";
};

const getButtonClass = (connection: ConnectionStatus): string => {
  if (connection === "CONNECTED") {
    return "bg-rd-success/20 text-rd-success hover:bg-rd-success/30 border border-rd-success/30";
  }
  if (connection === "CONNECTING" || connection === "ERROR") {
    return "cursor-not-allowed bg-rd-gold/10 text-rd-gold border border-rd-gold/30";
  }
  return "bg-rd-accent/20 text-rd-accent hover:bg-rd-accent/30 border border-rd-accent/30";
};

const getButtonLabel = (connection: ConnectionStatus): string => {
  if (connection === "CONNECTED") return "Disconnect";
  if (connection === "CONNECTING") return "Connecting...";
  return "Connect to LMU";
};

const ConnectionPanel = ({
  connection,
  onConnectionChange,
  onLog,
}: ConnectionPanelProps): React.ReactElement => {
  const [apiUrl, setApiUrl] = useState("http://localhost:5397");
  const [pollRate, setPollRate] = useState(200);
  const [isEditing, setIsEditing] = useState(false);

  const handleConnect = async (): Promise<void> => {
    if (connection === "CONNECTED") {
      await globalThis.api.disconnect();
      onLog("Disconnected from LMU API.", "WARNING");
      onConnectionChange("DISCONNECTED");
      return;
    }

    onLog(`Attempting connection to ${apiUrl}...`, "INFO");
    // -- real status updates will arrive via onConnectionChange --
    // -- listener set up in dashboard/index.tsx, we just fire call here
    await globalThis.api.connect(apiUrl, pollRate);
  };

  const statusRows = [
    { label: "API Endpoint", value: apiUrl, mono: true },
    { label: "Poll Rate", value: `${pollRate}ms`, mono: true },
    { label: "Status", value: getStatusValue(connection), mono: false },
    {
      label: "Last Ping",
      value: connection === "CONNECTED" ? "—" : "N/A",
      mono: true,
    },
  ];

  return (
    <div className="flex flex-col rounded border border-rd-border bg-rd-surface">
      <div className="flex items-center justify-between border-b border-rd-border px-4 py-3">
        <div className="flex items-center gap-2">
          {connection === "CONNECTED" ? (
            <Wifi size={14} className="text-rd-success" />
          ) : (
            <WifiOff size={14} className="text-rd-muted" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-rd-text">
            LMU Connection
          </span>
        </div>
        <button
          onClick={() => setIsEditing((v) => !v)}
          className="text-rd-subtle transition-colors hover:text-rd-text"
        >
          <Settings2 size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-px p-1">
        {statusRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded px-3 py-2 hover:bg-rd-elevated"
          >
            <span className="text-xs text-rd-subtle">{row.label}</span>
            <span
              className={`text-xs ${row.mono ? "font-mono" : ""} text-rd-text`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isEditing ? "auto" : 0,
          opacity: isEditing ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-3 border-t border-rd-border px-4 py-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="api-url" className="text-xs text-rd-subtle">
              API URL
            </label>
            <input
              id="api-url"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="
                w-full rounded border border-rd-border bg-rd-elevated
                px-3 py-1.5 font-mono text-xs text-rd-text
                outline-none focus:border-rd-accent/60
              "
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="poll-rate" className="text-xs text-rd-subtle">
              Poll Rate (ms)
            </label>
            <input
              id="poll-rate"
              type="number"
              value={pollRate}
              min={100}
              max={2000}
              step={50}
              onChange={(e) => setPollRate(Number(e.target.value))}
              className="
                w-full rounded border border-rd-border bg-rd-elevated
                px-3 py-1.5 font-mono text-xs text-rd-text
                outline-none focus:border-rd-accent/60
              "
            />
          </div>
        </div>
      </motion.div>

      <div className="border-t border-rd-border p-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => void handleConnect()}
          disabled={connection === "CONNECTING"}
          className={`
            flex w-full items-center justify-center gap-2 rounded
            py-2 text-xs font-semibold uppercase tracking-wider
            transition-colors duration-150
            ${getButtonClass(connection)}
          `}
        >
          {connection === "CONNECTING" && (
            <RefreshCw size={12} className="animate-spin" />
          )}
          {getButtonLabel(connection)}
        </motion.button>
      </div>
    </div>
  );
};

export default ConnectionPanel;