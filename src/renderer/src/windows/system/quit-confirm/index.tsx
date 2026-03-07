import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Power, X } from "lucide-react";

const QuitConfirm = (): React.ReactElement => {
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [overlayRight, setOverlayRight] = useState(160);
  const [overlayHeight, setOverlayHeight] = useState(56);

  useEffect(() => {
    globalThis.api.system
      .getQuitConfirmPreference()
      .then((showConfirm) => {
        setDontAskAgain(!showConfirm);
      })
      .catch(() => undefined);
  }, []);

  // -- align with native window-controls area so we can mask it perfectly --
  useEffect(() => {
    const compute = (): void => {
      const wco: any = (navigator as any).windowControlsOverlay;
      if (!wco?.visible) {
        setOverlayRight(160);
        setOverlayHeight(56);
        return;
      }
      const rect = wco.getTitlebarAreaRect();
      const right = Math.max(0, Math.round(window.innerWidth - (rect.x + rect.width)));
      const height = Math.max(0, Math.round(rect.height));
      setOverlayRight(right || 160);
      setOverlayHeight(height || 56);
    };
    compute();
    const wco: any = (navigator as any).windowControlsOverlay;
    if (!wco) return;
    wco.addEventListener("geometrychange", compute);
    window.addEventListener("resize", compute);
    return () => {
      wco?.removeEventListener?.("geometrychange", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const topRightStyle = useMemo(
    () =>
      ({
        width: `${overlayRight}px`,
        height: `${overlayHeight}px`,
        WebkitAppRegion: "no-drag",
      }) as React.CSSProperties,
    [overlayRight, overlayHeight]
  );

  return (
    <div
      className="relative flex h-screen w-screen items-center justify-center bg-transparent text-rd-text"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* mask and replace the OS close button area with our integrated control */}
      <div
        className="absolute right-0 top-0 rounded-bl-2xl bg-rd-surface/95 backdrop-blur-[1px] shadow-lg"
        style={topRightStyle}
      >
        <div className="absolute bottom-0 left-0 h-px w-full bg-rd-border/80" aria-hidden="true" />
        <button
          aria-label="Cancel"
          onClick={async () => {
            await globalThis.api.system.cancelQuit();
          }}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg text-rd-subtle hover:bg-rd-elevated hover:text-rd-text transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="w-[450px] rounded-2xl border border-rd-accent/25 bg-rd-surface shadow-2xl relative">
        <div className="border-b border-rd-border px-6 py-5">
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
        </div>

        <div className="px-6 py-5">
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
