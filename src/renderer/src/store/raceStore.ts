import { create } from "zustand";
import type {
    AppState,
    ConnectionStatus,
    DriverStanding,
    SessionInfo,
} from "../types/lmu";

interface RaceStore extends AppState {
    // -- functions that update the state --
    setConnection: (status: ConnectionStatus) => void;
    setSession: (session: SessionInfo | null) => void;
    setStandings: (standings: DriverStanding[]) => void;
}

export const useRaceStore = create<RaceStore>((set) => ({
    // -- initial state --
    connection: "DISCONNECTED",
    session: null,
    standings: [],
    lastUpdated: null,

    // -- actions --
    setConnection: (status) => set({ connection: status }),
    setSession: (session) => set({ session }),
    setStandings: (standings) => set({ standings, lastUpdated: Date.now() }),
}));