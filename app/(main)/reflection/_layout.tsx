import { Stack } from "expo-router";
import React from "react";

export default function ReflectionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="choose-card" />
      <Stack.Screen name="reflection-detail" />
    </Stack>
  );
}
