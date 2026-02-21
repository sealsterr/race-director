import { Flag } from "lucide-react";
import type { SessionInfo, FlagState } from "../../../types/lmu";
import React from "react";

interface SessionPanelProps {
  session: SessionInfo | null;
}

const flagConfig: Record<FlagState, { label: string; color: string }> = {
  GREEN: { label: "GREEN FLAG", color: "text-rd-success" },
  YELLOW: { label: "YELLOW FLAG", color: "text-rd-gold" },
  FULL_COURSE_YELLOW: { label: "FULL COURSE YELLOW", color: "text-rd-gold" },
  SAFETY_CAR: { label: "SAFETY CAR", color: "text-rd-gold" },
  RED: { label: "RED FLAG", color: "text-rd-error" },
  CHEQUERED: { label: "CHEQUERED", color: "text-rd-text" },
  NONE: { label: "NO FLAG", color: "text-rd-subtle" },
};

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

interface DataRowProps {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}

const DataRow = ({
  label,
  value,
  mono = false,
  valueClass = "text-rd-text",
}: DataRowProps): React.ReactElement => (
  <div className="flex items-center justify-between rounded px-3 py-2 hover:bg-rd-elevated">
    <span className="text-xs text-rd-subtle">{label}</span>
    <span className={`text-xs ${mono ? "font-mono" : ""} ${valueClass}`}>
      {value}
    </span>
  </div>
);

const SessionPanel = ({ session }: SessionPanelProps): React.ReactElement => {
  const flag = session ? flagConfig[session.flagState] : null;

  return (
    <div className="flex flex-col rounded border border-rd-border bg-rd-surface">
      {/* -- panel header -- */}
      <div className="flex items-center gap-2 border-b border-rd-border px-4 py-3">
        <Flag size={14} className="text-rd-muted" />
        <span className="text-xs font-semibold uppercase tracking-wider text-rd-text">
          Session Info
        </span>
        {flag && (
          <span
            className={`ml-auto font-mono text-xs font-semibold ${flag.color}`}
          >
            {flag.label}
          </span>
        )}
      </div>

      {/* -- session data -- */}
      <div className="flex flex-col gap-px p-1">
        {session ? (
          <>
            <DataRow label="Track" value={session.trackName} />
            <DataRow label="Session" value={session.sessionType} />
            <DataRow
              label="Lap"
              value={`${session.currentLap} / ${session.totalLaps}`}
              mono
            />
            <DataRow
              label="Time Remaining"
              value={formatTime(session.timeRemaining)}
              mono
            />
            <DataRow
              label="Session Time"
              value={formatTime(session.sessionTime)}
              mono
            />
            <DataRow
              label="Flag"
              value={flag?.label ?? "—"}
              valueClass={flag?.color ?? "text-rd-text"}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <p className="text-xs text-rd-subtle">No active session detected</p>
            <p className="font-mono text-xs text-rd-subtle/60">
              Launch Le Mans Ultimate to begin!
            </p>
          </div>
        )}
      </div>
    </div>
    );
};

export default SessionPanel;