import { create } from "zustand";
import type { TrashBinApiItem } from "@/types/trashBin";

type TrashBinStoreState = {
  trashBins: TrashBinApiItem[];
  setTrashBins: (items: TrashBinApiItem[]) => void;
  clearTrashBins: () => void;
};

export const useTrashBinStore = create<TrashBinStoreState>((set) => ({
  trashBins: [],
  setTrashBins: (items) => set({ trashBins: items }),
  clearTrashBins: () => set({ trashBins: [] }),
}));

