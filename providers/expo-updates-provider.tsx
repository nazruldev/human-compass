import * as Updates from "expo-updates";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  AppState,
  type AppStateStatus,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  children: ReactNode;
};

const RELOAD_SCREEN = {
  backgroundColor: "#000000",
  fade: true,
  image: require("../assets/images/splash-icon.png") as number,
  imageResizeMode: "contain" as const,
  spinner: {
    enabled: true,
    color: "#ffffff",
    size: "large" as const,
  },
};

function UpdateStatusOverlay({
  title,
  subtitle,
  progress,
}: {
  title: string;
  subtitle?: string;
  progress?: number;
}) {
  const pct =
    progress != null && progress >= 0 && progress <= 1
      ? Math.round(progress * 100)
      : null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#ffffff" style={styles.spinner} />
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {pct != null ? (
          <Text style={styles.progress}>{`${pct}%`}</Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Applies OTA updates from EAS Update when a download completes, and checks
 * for a newer bundle when the app returns to the foreground (release builds only).
 * Shows in-app copy while checking/downloading; native reload screen handles reload.
 */
export function ExpoUpdatesProvider({ children }: Props) {
  const {
    isUpdatePending,
    isDownloading,
    isChecking,
    isRestarting,
    downloadProgress,
  } = Updates.useUpdates();

  useEffect(() => {
    if (!isUpdatePending) return;
    void Updates.reloadAsync({ reloadScreenOptions: RELOAD_SCREEN });
  }, [isUpdatePending]);

  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    if (!Updates.isEnabled) return;

    const onAppStateChange = (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev.match(/inactive|background/) && next === "active") {
        void (async () => {
          try {
            const check = await Updates.checkForUpdateAsync();
            if (check.isAvailable) {
              await Updates.fetchUpdateAsync();
            }
          } catch {
            // Dev client, offline, or updates disabled — ignore.
          }
        })();
      }
    };

    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, []);

  const overlay = useMemo(() => {
    if (!Updates.isEnabled) return null;

    if (isDownloading) {
      return (
        <UpdateStatusOverlay
          title="Downloading update"
          subtitle="Please wait—keep the app open."
          progress={downloadProgress}
        />
      );
    }

    if (isUpdatePending || isRestarting) {
      return (
        <UpdateStatusOverlay
          title="Applying update"
          subtitle="The app will restart shortly."
        />
      );
    }

    if (isChecking) {
      return (
        <UpdateStatusOverlay
          title="Checking for updates"
          subtitle="Looking for the latest version."
        />
      );
    }

    return null;
  }, [
    isChecking,
    isDownloading,
    isRestarting,
    isUpdatePending,
    downloadProgress,
  ]);

  return (
    <View style={styles.root}>
      {children}
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.88)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    alignItems: "center",
    maxWidth: 320,
  },
  spinner: {
    marginBottom: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  progress: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginTop: 12,
    fontVariant: ["tabular-nums"],
  },
});
