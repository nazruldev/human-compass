import { BottomTabBarHeightContext } from "@react-navigation/bottom-tabs";
import { useContext } from "react";
import { Platform } from "react-native";

/**
 * Safe outside Bottom Tab Navigator: `useBottomTabBarHeight()` throws there;
 * context is undefined, so we use 0 for scroll insets / padding.
 */
export function useBottomTabOverflow() {
  const height = useContext(BottomTabBarHeightContext);
  if (Platform.OS !== "ios") {
    return 0;
  }
  return height ?? 0;
}
