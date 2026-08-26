import { create } from "zustand";
import { ApiError } from "@/types/api";

export interface ApiErrorState {
  error: ApiError | null;
  isTransient: boolean;
  setError: (error: ApiError | null, isTransient?: boolean) => void;
  clearError: () => void;
  retry?: () => Promise<void>;
  setRetry: (retry?: () => Promise<void>) => void;
}

export const useErrorStore = create<ApiErrorState>((set) => ({
  error: null,
  isTransient: false,
  setError: (error, isTransient = false) => set({ error, isTransient }),
  clearError: () => set({ error: null, isTransient: false }),
  retry: undefined,
  setRetry: (retry) => set({ retry }),
}));
