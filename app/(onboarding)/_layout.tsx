import { useSyncOverlay } from "@/hooks/useSyncOverlay";
import { Stack } from "expo-router";
import React from "react";

export default function OnboardingLayout() {
  useSyncOverlay();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="upperCanon" />
      <Stack.Screen name="lowerCanon" />
      <Stack.Screen
        name="cardDetail"
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
