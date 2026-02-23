import React, { useEffect, useState, useMemo } from "react";
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

type OverlayInsets = { left: number; right: number; height: number };

// -- compute how much of titlebar area is NOT safe for content --
const computeOverlayInsets = (): OverlayInsets => {
  const fallback: OverlayInsets = { left: 0, right: 160, height: 56 };

  // -- navigator.windowControlsOverlay exists only when titleBarOverlay is enabled --
  const wco = (navigator as any).windowControlsOverlay;
  if (!wco?.visible) return { left: 0, right: 0, height: 56 };

  const rect = wco.getTitlebarAreaRect();

  // -- rect is safe titlebar area for web contents
  // -- anything outside it (left/right) is where native buttons live
  const left = Math.max(0, Math.round(rect.x));
  const right = Math.max(
    0,
    Math.round(window.innerWidth - (rect.x + rect.width))
  );
  const height = Math.max(0, Math.round(rect.height));

  // -- if something looks off, use safe fallback padding so UI won't overlap --
  const looksInvalid = height === 0 || (left === 0 && right === 0);
  if (looksInvalid) return fallback;

  return { left, right, height };
};

const TopBar = ({ connection }: TopBarProps): React.ReactElement => {
  const [time, setTime] = useState(new Date());

  // -- window controls overlay safe-area insets --
  const [overlayInsets, setOverlayInsets] = useState<OverlayInsets>(() => ({
    left: 0,
    right: 160,
    height: 56,
  }));

  const BASE_PAD_PX = 20;

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const update = (): void => {
      setOverlayInsets(computeOverlayInsets());
    };

    update();

    const wco = (navigator as any).windowControlsOverlay;
    if (!wco) return;

    // -- keep it updated when DPI / window state changes --
    wco.addEventListener("geometrychange", update);
    window.addEventListener("resize", update);

    return () => {
      wco.removeEventListener("geometrychange", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const cfg = connectionConfig[connection];

  const pad = (n: number): string => String(n).padStart(2, "0");
  const timeString = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(
    time.getSeconds()
  )}`;
  const dateString = time.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const containerStyle = useMemo(() => {
    return {
      WebkitAppRegion: "drag" as const,
      paddingLeft: overlayInsets.left + BASE_PAD_PX,
      paddingRight: overlayInsets.right + BASE_PAD_PX,
    };
  }, [overlayInsets.left, overlayInsets.right]);

  return (
    <div
      style={containerStyle}
      className="relative flex h-14 w-full shrink-0 items-center justify-between border-b border-rd-border bg-rd-surface px-5"
      >

        {/* -- window controls overlay chrome strip (visual reserved area) -- */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-full bg-rd-surface"
          style={{ width: overlayInsets.right}}
        >

        {/* -- separator aligned with start of native window buttons -- */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-full border-1 border-rd-border"
        />

        {/* -- subtle top highlight -- */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-px w-full bg-white/5"
        >
        </div>

        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-px w-full bg-rd-border"
        >
        </div>
      </div>

      {/* -- left overlay strip -- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-full border-r border-rd-border bg-rd-elevated/50"
        style={{ width: overlayInsets.left }}
      />

      {/* -- left: branding -- */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          
          <span className="text-sm font-bold tracking-[0.2em] text-rd-logo-primary">
            Race
          </span>
          <span className="text-sm font-light tracking-[0.2em] text-rd-logo-secondary">
            Director
          </span>
        </div>
        <div className="h-4 w-px bg-rd-border" />
        <span className="font-mono text-xs text-rd-subtle">v0.1.0-devbuild</span>
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

        <div className="h-4 w-px bg-rd-border" />
      </div>
    </div>
  );
};

export default TopBar;