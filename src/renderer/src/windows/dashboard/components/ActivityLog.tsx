import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";
import type { LogEntry, LogType } from "../../../types/dashboard";

interface ActivityLogProps {
  entries: LogEntry[];
}

const typeConfig: Record<LogType, { label: string; color: string }> = {
  INFO: { label: "INFO", color: "text-rd-muted" },
  SUCCESS: { label: "OK  ", color: "text-rd-success" },
  WARNING: { label: "WARN", color: "text-rd-gold" },
  ERROR: { label: "ERR ", color: "text-rd-error" },
  SYSTEM: { label: "SYS ", color: "text-rd-accent" },
};

const pad = (n: number): string => String(n).padStart(2, "0");

const formatTimestamp = (date: Date): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

const ActivityLog = ({ entries }: ActivityLogProps): React.ReactElement => {
  const bottomRef = useRef<HTMLDivElement>(null);

  //  -- auto-scroll to bottom on new entry --
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded border border-rd-border bg-rd-surface">
      {/* -- header -- */}
      <div className="flex items-center gap-2 border-b border-rd-border px-4 py-3">
        <Terminal size={14} className="text-rd-muted" />
        <span className="text-xs font-semibold uppercase tracking-wider text-rd-text">
          Activity Log
        </span>
        <span className="ml-auto font-mono text-xs text-rd-subtle">
          {entries.length} events
        </span>
      </div>

      {/* -- log entries -- */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
        {entries.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="font-mono text-xs text-rd-subtle">
              Waiting for events...
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {entries.map((entry) => {
              const cfg = typeConfig[entry.type];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-baseline gap-3 rounded px-2 py-1 hover:bg-rd-elevated"
                >
                  {/* -- timestamp -- */}
                  <span className="shrink-0 font-mono text-xs text-rd-subtle">
                    {formatTimestamp(entry.timestamp)}
                  </span>

                  {/* -- type badge -- */}
                  <span
                    className={`shrink-0 font-mono text-xs font-semibold ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>

                  {/* -- message -- */}
                  <span className="font-mono text-xs text-rd-text">
                    {entry.message}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ActivityLog;