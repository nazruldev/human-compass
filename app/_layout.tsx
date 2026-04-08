import { clerkConfig } from "@/config/clerk";
import { ExpoUpdatesProvider } from "@/providers/expo-updates-provider";
import { PremiumFlowProvider } from "@/providers/premium-flow-provider";
import { QueryProvider } from "@/providers/query-provider";
import { useGlobalStore } from "@/store/global";
import "@/styles/global.css";
import { ThemeProvider } from "@/theme/theme-provider";
import { tokenCache } from "@/utils/cache";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
  useFonts,
} from "@expo-google-fonts/poppins";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export const unstable_settings = {
  anchor: "(onboarding)",
};

SplashScreen.preventAutoHideAsync().catch(() => {});

function overlayColorsFromDarkness(darkness: number) {
  const opacity = darkness / 100;
  return [
    `rgba(0,0,0,${opacity * 0.8})`,
    `rgba(0,0,0,${opacity * 0.9})`,
    `rgba(0,0,0,${opacity})`,
  ] as const;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  missingEnvRoot: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  missingEnvTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  missingEnvBody: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  const overlayDarkness = useGlobalStore((s) => s.overlayDarkness);
  const overlayColors = useMemo(
    () => overlayColorsFromDarkness(overlayDarkness),
    [overlayDarkness],
  );

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!clerkConfig.publishableKey) {
    return (
      <View style={styles.missingEnvRoot}>
        <StatusBar style="light" />
        <Text style={styles.missingEnvTitle}>Configuration Error</Text>
        <Text style={styles.missingEnvBody}>
          EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing in this build/update.
        </Text>
      </View>
    );
  }

  const content = (
    <ThemeProvider>
      <ImageBackground
        source={require("../assets/background/main.png")}
        style={styles.root}
        resizeMode="cover"
      >
        <LinearGradient
          key={overlayDarkness}
          colors={overlayColors}
          style={styles.overlay}
          pointerEvents="none"
        />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: "transparent" },
            animation: "fade",
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen name="sso-callback" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </ImageBackground>
    </ThemeProvider>
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ExpoUpdatesProvider>
          <ClerkProvider
            publishableKey={clerkConfig.publishableKey}
            tokenCache={tokenCache}
          >
            <ClerkLoaded>
              <QueryProvider>
                <PremiumFlowProvider>{content}</PremiumFlowProvider>
              </QueryProvider>
            </ClerkLoaded>
          </ClerkProvider>
        </ExpoUpdatesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
