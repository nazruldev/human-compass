import { getOverlayDarkness } from "@/config/overlay";
import { useGlobalStore } from "@/store/global";
import { useSegments } from "expo-router";
import { useLayoutEffect } from "react";

/** Panggil di layout/screen yang punya akses route - sync overlay darkness ke store */
export function useSyncOverlay() {
  const segments = useSegments();
  const setOverlayDarkness = useGlobalStore((s) => s.setOverlayDarkness);
  // useSegments() returns a new array each render; use a stable key for the effect.
  const segmentKey = segments.join("/");

  useLayoutEffect(() => {
    const darkness = getOverlayDarkness(segmentKey || "/");
    const prev = useGlobalStore.getState().overlayDarkness;
    if (prev !== darkness) {
      setOverlayDarkness(darkness);
    }
  }, [segmentKey, setOverlayDarkness]);
}
