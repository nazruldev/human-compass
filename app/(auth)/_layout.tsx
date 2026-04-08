import { useSyncOverlay } from "@/hooks/useSyncOverlay";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, Stack, useSegments } from "expo-router";

export default function AuthLayout() {
  useSyncOverlay();

  const { user, isLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const segments = useSegments();

  if (!isLoaded || !authLoaded) return null;

  const verified = user?.unsafeMetadata?.verified_account === true;

  const inVerifyAccount = (segments as string[]).includes(
    "complete-your-account",
  );

  // 🔥 redirect logic (tanpa useEffect)
  if (isSignedIn && !verified && !inVerifyAccount) {
    return <Redirect href="/(auth)/complete-your-account" />;
  }

  if (isSignedIn && verified) {
    return <Redirect href="/(main)/home" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="complete-your-account"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
