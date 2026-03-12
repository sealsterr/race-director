import React from "react";
import { WifiOff, ArrowLeft, X } from "lucide-react";

const DisconnectNotice = (): React.ReactElement => {
  return (
    <div
      className="h-screen w-screen bg-transparent p-3 text-rd-text"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-rd-warning/25 bg-rd-surface shadow-2xl">
        <div
          className="flex items-center gap-3 border-b border-rd-border px-4 py-3"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
          <button
            aria-label="Dismiss notice"
            onClick={async () => {
              await globalThis.api.system.ackDisconnect();
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rd-border bg-rd-elevated text-rd-subtle transition-colors hover:border-rd-muted hover:text-rd-text"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            <X size={15} />
          </button>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-rd-warning">
            Connection Lost
          </p>
        </div>

        <div className="border-b border-rd-border px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rd-warning/15 text-rd-warning">
              <WifiOff size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-rd-warning">
                Connection Lost
              </p>
              <h1 className="mt-0.5 text-xl font-semibold text-rd-text">
                Disconnected from lobby
              </h1>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-rd-muted">
            RaceDirector lost connection to the LMU REST API. Please reconnect and reopen the overlays.
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end border-t border-rd-border px-6 py-4"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <button
            onClick={async () => {
              await globalThis.api.system.ackDisconnect();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-rd-warning/30 bg-rd-warning/10 px-4 py-2 text-sm font-semibold text-rd-warning transition-colors hover:bg-rd-warning/20"
          >
            <ArrowLeft size={15} />
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisconnectNotice;
