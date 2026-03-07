import React from "react";
import { WifiOff, ArrowLeft } from "lucide-react";

const DisconnectNotice = (): React.ReactElement => {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center bg-transparent p-4 text-rd-text"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div className="w-[420px] rounded-2xl border border-rd-warning/25 bg-rd-surface shadow-2xl">
        {/* Header */}
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
              await globalThis.api.window.focus("main");
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