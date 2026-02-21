import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wifi, WifiOff, Loader, AlertTriangle } from "lucide-react";
import type { ConnectionStatus } from "../../../types/lmu";

interface TopBarProps {
  connection: ConnectionStatus;
}

const connectionConfig: Record<
  ConnectionStatus,
  { label: string; color: string; borderBg: string; icon: React.ReactElement }
> = {
  CONNECTED: {
    label: "CONNECTED",
    color: "text-rd-success",
    borderBg: "border-rd-success/30 bg-rd-success/10",
    icon: <Wifi size={13} />,
  },
  CONNECTING: {
    label: "CONNECTING",
    color: "text-rd-gold",
    borderBg: "border-rd-gold/30 bg-rd-gold/10",
    icon: <Loader size={13} className="animate-spin" />,
  },
  DISCONNECTED: {
    label: "DISCONNECTED",
    color: "text-rd-error",
    borderBg: "border-rd-error/30 bg-rd-error/10",
    icon: <WifiOff size={13} />,
  },
  ERROR: {
    label: "ERROR",
    color: "text-rd-error",
    borderBg: "border-rd-error/30 bg-rd-error/10",
    icon: <AlertTriangle size={13} />,
  },
};

const TopBar = ({ connection }: TopBarProps): React.ReactElement => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const cfg = connectionConfig[connection];

  const pad = (n: number): string => String(n).padStart(2, "0");
  const timeString = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateString = time.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex h-14 w-full shrink-0 items-center justify-between border-b border-rd-border bg-rd-surface px-5">
      {/* -- left: branding -- */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-rd-accent" />
          <span className="text-sm font-bold tracking-[0.2em] text-rd-text">
            Race
          </span>
          <span className="text-sm font-light tracking-[0.2em] text-rd-muted">
            Director
          </span>
        </div>
        <div className="h-4 w-px bg-rd-border" />
        <span className="font-mono text-xs text-rd-subtle">v0.1.0-dev</span>
      </div>

      {/* -- center: LMU session status -- */}
      <div className="flex items-center gap-2">
        <div className="rounded border border-rd-border bg-rd-elevatedpx-4 py-1.5 text-center">
          <p className="font-mono text-xs text-rd-subtle">NO ACTIVE SESSION</p>
        </div>
      </div>

      {/* -- right: clock + connection -- */}
      <div className="flex items-center gap-4">
        {/* clock */}
        <div className="text-right">
          <p className="font-mono text-sm font-medium text-rd-text">
            {timeString}
          </p>
          <p className="font-mono text-xs text-rd-subtle">{dateString}</p>
        </div>

        <div className="h-6 w-px bg-rd-border" />

        {/* connection pill */}
        <motion.div
          key={connection}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            flex items-center gap-1.5 rounded border px-3 py-1.5
            font-mono text-xs font-medium 
            ${cfg.color}
            ${cfg.borderBg}
          `}
        >
          {cfg.icon}
          <span>{cfg.label}</span>
        </motion.div>
      </div>
    </div>
  );
};

export default TopBar;