import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useSyncOverlay } from "@/hooks/useSyncOverlay";
import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

const SSOCallback = () => {
  useSyncOverlay();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    const verified = user?.unsafeMetadata?.verified_account === true;
    router.replace(verified ? "/(main)/home" : "/(auth)/complete-your-account");
  }, [isLoaded, user]);

  return (
    <View className="flex-1 items-center justify-center">
      <Spinner color="white" size="lg" />
      <Text variant="body" style={{ paddingTop: 5 }} lightColor="white">
        Loading...
      </Text>
    </View>
  );
};

export default SSOCallback;
