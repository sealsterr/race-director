import { useEffect, useRef, useState } from "react";
import type { AppState, ConnectionStatus } from "../../../types/lmu";

const INITIAL_APP_STATE: AppState = {
    connection: "DISCONNECTED",
    session: null,
    standings: [],
    lastUpdated: null,
};

export function useBufferedAppState(refreshMs: number): AppState {
    const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);
    const latestStateRef = useRef<AppState>(INITIAL_APP_STATE);

    useEffect(() => {
        globalThis.api.getState().then((state) => {
            latestStateRef.current = state;
            setAppState(state);
        }).catch(() => undefined);

        const unsubState = globalThis.api.onStateUpdate((state) => {
            latestStateRef.current = state;
        });
        const unsubConnection = globalThis.api.onConnectionChange(
            (connection: ConnectionStatus) => {
                latestStateRef.current = {
                    ...latestStateRef.current,
                    connection,
                };
                setAppState((current) => ({ ...current, connection }));
            }
        );

        return () => {
            unsubState();
            unsubConnection();
        };
    }, []);

    useEffect(() => {
        setAppState(latestStateRef.current);

        const intervalId = globalThis.setInterval(() => {
            setAppState((current) => {
                if (current.lastUpdated === latestStateRef.current.lastUpdated) {
                    return current.connection === latestStateRef.current.connection
                        ? current
                        : latestStateRef.current;
                }

                return latestStateRef.current;
            });
        }, refreshMs);

        return () => {
            globalThis.clearInterval(intervalId);
        };
    }, [refreshMs]);

    return appState;
}
