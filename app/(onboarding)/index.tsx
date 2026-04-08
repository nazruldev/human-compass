import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IndexJournal = () => {
  const router = useRouter();
  return (
    <SafeAreaView
      edges={["left", "right"]}
      className="flex-1 flex-col items-center justify-between px-5 pt-16 pb-16"
    >
      <View className="p-5">
        <View>
          <Text
            variant="subtitle"
            lightColor="white"
            style={{
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8,
            }}
          >
            Welcome to
          </Text>
          <Text
            variant="title"
            style={{
              fontSize: 48,
              lineHeight: 55,
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8,
            }}
            lightColor="white"
          >
            Human Compass
          </Text>
        </View>
      </View>

      <View className="flex-col gap-2 mb-10 ">
        <View className="max-w-lg mx-auto">
          <Button onPress={() => router.push("/(onboarding)/upperCanon")}>
            Start The Journey
          </Button>
        </View>
        <View className="px-10">
          <Text
            variant="body"
            style={{ textAlign: "center" }}
            lightColor="white"
          >
            THIS IS A REFLECTION TOOL INSPIRED BY THE I CHING TO HELP YOU THINK,
            NOT PREDICT.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IndexJournal;
