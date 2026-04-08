import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, useSegments } from "expo-router";
import { View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useColor } from "@/hooks/useColor";
import { useSyncOverlay } from "@/hooks/useSyncOverlay";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  useSyncOverlay();

  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const primaryColor = useColor("primary");
  const primaryForeground = useColor("primaryForeground");
  const tabBarInactive = useColor("secondary");

  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  // =========================
  // 🧠 STATE
  // =========================
  const onboardingDone = user?.unsafeMetadata?.onboarding_completed === true;

  const verified = user?.unsafeMetadata?.verified_account === true;

  const currentGroup = segments[0]; // "(main)" | "(auth)" | "(onboarding)"

  // =========================
  // ⏳ LOADING
  // =========================
  if (!userLoaded || !authLoaded) {
    return (
      <View className="flex-1 items-center justify-center">
        <Spinner color="white" size="lg" />
        <Text variant="body" style={{ paddingTop: 5 }} lightColor="white">
          Loading...
        </Text>
      </View>
    );
  }

  // =========================
  // 🔐 REDIRECT (ANTI LOOP)
  // =========================

  // belum login
  if (!isSignedIn && currentGroup !== "(auth)") {
    return <Redirect href="/(auth)" />;
  }

  // belum verifikasi
  if (isSignedIn && !verified && currentGroup !== "(auth)") {
    // console.log("belum verifikasi");
    // return null;
    return <Redirect href="/(auth)/complete-your-account" />;
  }

  // belum onboarding
  if (
    isSignedIn &&
    verified &&
    !onboardingDone &&
    currentGroup !== "(onboarding)"
  ) {
    return <Redirect href="/(onboarding)" />;
  }

  // =========================
  // 🎯 TAB BAR CONTROL
  // =========================

  const rootTabs = new Set([
    "home",
    "journal",
    "reflection",
    "library",
    "profile",
  ]);

  const currentTab = segments[1];

  const isRootTabScreen =
    segments.length === 2 && rootTabs.has(currentTab ?? "");

  const hideTabBar = !isRootTabScreen;

  /** Extra space above Android gesture / 3-button nav so tabs aren’t drawn under system UI */
  const tabBarBottomInset = Math.max(insets.bottom, 6);

  const baseTabBarStyle = {
    backgroundColor: primaryColor,
    borderTopWidth: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 3,
    paddingBottom: tabBarBottomInset,
    // Default tab bar height + our bottom inset so labels/icons stay centered above the inset
    minHeight: 52 + tabBarBottomInset,
    elevation: 0,
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
  } as const;

  // =========================
  // 🚀 UI
  // =========================

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryForeground,
        tabBarInactiveTintColor: tabBarInactive,
        tabBarLabelStyle: {
          fontFamily: "Poppins_600SemiBold",
          fontWeight: "normal",
          fontSize: 11,
        },
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: hideTabBar ? { display: "none" } : baseTabBarStyle,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "planet" : "planet-outline"}
              size={focused ? 30 : 26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "file-tray" : "file-tray-outline"}
              size={focused ? 30 : 26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reflection"
        options={{
          title: "Reflection",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={focused ? 30 : 26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "albums" : "albums-outline"}
              size={focused ? 30 : 26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                borderRadius: 22,
                padding: 1,
                borderWidth: 2,
                borderColor: focused ? "#fff" : "rgba(255,255,255,0.5)",
                marginTop: 10,
              }}
            >
              <Avatar size={36}>
                {user?.imageUrl ? (
                  <AvatarImage source={{ uri: user.imageUrl }} />
                ) : (
                  <AvatarFallback>
                    {user?.firstName?.[0] ??
                      user?.emailAddresses?.[0]?.emailAddress?.[0] ??
                      "?"}
                  </AvatarFallback>
                )}
              </Avatar>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
