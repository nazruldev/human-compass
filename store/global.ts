import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GlobalState {
  isLoading: boolean;
  theme: "light" | "dark" | "system";
  overlayDarkness: number;
  /** Local flag; persist across app restarts. */
  onboardingCompleted: boolean;
  setLoading: (loading: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setOverlayDarkness: (darkness: number) => void;
  setOnboardingCompleted: (completed: boolean) => void;
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      isLoading: false,
      theme: "system",
      overlayDarkness: 95,
      onboardingCompleted: false,
      setLoading: (isLoading) => set({ isLoading }),
      setTheme: (theme) => set({ theme }),
      setOverlayDarkness: (overlayDarkness) => set({ overlayDarkness }),
      setOnboardingCompleted: (onboardingCompleted) =>
        set({ onboardingCompleted }),
    }),
    {
      name: "iching-global",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboardingCompleted: state.onboardingCompleted,
      }),
    },
  ),
);
