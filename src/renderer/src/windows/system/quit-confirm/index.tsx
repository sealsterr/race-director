import React, { useEffect, useState } from "react";
import { AlertTriangle, Power, X } from "lucide-react";

const QuitConfirm = (): React.ReactElement => {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  useEffect(() => {
    globalThis.api.system
      .getQuitConfirmPreference()
      .then((showConfirm) => {
        setDontAskAgain(!showConfirm);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div
      className="h-screen w-screen bg-transparent p-3 text-rd-text"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-rd-accent/25 bg-rd-surface shadow-2xl">
        <div
          className="flex items-start justify-between gap-4 border-b border-rd-border px-6 py-5"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rd-accent/12 text-rd-accent">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-rd-accent">
                Confirm Quit
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-rd-text">
                Quit RaceDirector?
              </h1>
            </div>
          </div>
          <button
            aria-label="Cancel quit"
            onClick={async () => {
              await globalThis.api.system.cancelQuit();
            }}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rd-border bg-rd-elevated text-rd-subtle transition-colors hover:border-rd-muted hover:text-rd-text"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 px-6 py-5">
          <p className="text-sm leading-6 text-rd-muted">
            This action will close everything.
          </p>

          <label
            className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-rd-border bg-rd-elevated px-4 py-3"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="h-4 w-4 rounded border border-rd-border bg-rd-surface appearance-none
                         checked:bg-rd-accent checked:border-rd-accent
                         shadow-inner outline-none ring-0 focus:outline-none focus:ring-0"
            />
            <span className="text-sm text-rd-text">Don’t ask me again</span>
          </label>
        </div>

        <div
          className="flex justify-end gap-3 border-t border-rd-border px-6 py-4"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <button
            onClick={async () => {
              await globalThis.api.system.cancelQuit();
            }}
            className="inline-flex items-center rounded-lg border border-rd-border bg-rd-elevated px-4 py-2 text-sm font-semibold text-rd-text transition-colors hover:border-rd-muted hover:bg-rd-bg"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await globalThis.api.system.confirmQuit(dontAskAgain);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-rd-accent/30 bg-rd-accent/10 px-4 py-2 text-sm font-semibold text-rd-accent transition-colors hover:bg-rd-accent/20"
          >
            <Power size={16} />
            Quit RaceDirector
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuitConfirm;
