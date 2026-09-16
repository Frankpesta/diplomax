import { create } from "zustand";
import type { ShipmentFilters } from "@/types";

interface ShipmentStore {
  filters: ShipmentFilters;
  setFilters: (filters: Partial<ShipmentFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: ShipmentFilters = {
  trackingCode: "",
  senderName: "",
  receiverName: "",
  status: "",
  shipmentType: "",
  dateFrom: "",
  dateTo: "",
  country: "",
  archived: false,
};

export const useShipmentStore = create<ShipmentStore>((set) => ({
  filters: defaultFilters,
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  resetFilters: () => set({ filters: defaultFilters }),
}));
