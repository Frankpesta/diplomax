import { create } from "zustand";
import type { Shipment, RouteCheckpoint } from "@/types";

interface TrackingStore {
  trackingResult: Shipment | null;
  routeSimulationState: {
    currentCheckpointIndex: number;
    checkpoints: RouteCheckpoint[];
    isAnimating: boolean;
  };
  setTrackingResult: (shipment: Shipment | null) => void;
  setRouteSimulationState: (
    state: Partial<TrackingStore["routeSimulationState"]>
  ) => void;
  resetTracking: () => void;
}

export const useTrackingStore = create<TrackingStore>((set) => ({
  trackingResult: null,
  routeSimulationState: {
    currentCheckpointIndex: 0,
    checkpoints: [],
    isAnimating: false,
  },
  setTrackingResult: (shipment) => set({ trackingResult: shipment }),
  setRouteSimulationState: (partial) =>
    set((state) => ({
      routeSimulationState: { ...state.routeSimulationState, ...partial },
    })),
  resetTracking: () =>
    set({
      trackingResult: null,
      routeSimulationState: {
        currentCheckpointIndex: 0,
        checkpoints: [],
        isAnimating: false,
      },
    }),
}));
