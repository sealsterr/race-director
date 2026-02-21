import React from "react";
import { useRaceStore } from "../../store/raceStore";

const InfoWindow = (): React.ReactElement => {
  const { connection, session, standings } = useRaceStore();

  const title = session ? session.trackName : "No active session";

  return (
    <div className="flex h-screen w-screen flex-col bg-rd-bg text-rd-text">
      {/* -- header -- */}
      <div className="flex h-12 items-center justify-between border-b border-rd-border bg-rd-surface px-4">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Info Window (WIP)
          </span>
          <span className="font-mono text-xs text-rd-subtle">{title}</span>
        </div>

        <span className="font-mono text-xs text-rd-subtle">{connection}</span>
      </div>

      {/* -- content -- */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {standings.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <p className="text-sm text-rd-muted">No standings yet</p>
            <p className="font-mono text-xs text-rd-subtle">
              Connect to LMU and load into a session
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {standings
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((d) => (
                <div
                  key={`${d.carNumber}-${d.driverName}`}
                  className="flex items-center justify-between rounded border border-rd-border bg-rd-surface px-3 py-2"
                >
                  <span className="font-mono text-xs text-rd-muted">
                    P{d.position}
                  </span>
                  <span className="text-xs">{d.driverName}</span>
                  <span className="font-mono text-xs text-rd-subtle">
                    #{d.carNumber}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoWindow;