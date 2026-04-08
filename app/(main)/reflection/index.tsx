import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useColor } from "@/hooks/useColor";
import { usePremiumFlow } from "@/providers/premium-flow-provider";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_QUESTION_LENGTH = 5;

const ReflectionScreen = () => {
  const router = useRouter();
  const { user } = useUser();

  const { openPremiumSheet } = usePremiumFlow();
  const [question, setQuestion] = React.useState("");
  const [isStarting, setIsStarting] = React.useState(false);
  const trimmedLen = question.trim().length;
  const canBeginReflection = trimmedLen >= MIN_QUESTION_LENGTH && !isStarting;

  const handleBeginReflection = React.useCallback(() => {
    if (!user?.id || !canBeginReflection) return;

    setIsStarting(true);
    void (async () => {
      try {
        const meta =
          (user.unsafeMetadata as Record<string, unknown> | undefined) ?? {};
        const rawLimit = meta.reflection_limit;
        const parsedLimit =
          typeof rawLimit === "number" ? rawLimit : Number(rawLimit);
        const currentLimit = Number.isFinite(parsedLimit) ? parsedLimit : 10;

        if (currentLimit <= 0) {
          openPremiumSheet();
          return;
        }

        // Premium users: treat 100+ as unlimited, no decrement.
        if (currentLimit < 100) {
          await user.update({
            unsafeMetadata: {
              ...meta,
              reflection_limit: currentLimit - 1,
            },
          });
        }

        router.push({
          pathname: "/reflection/choose-card",
          params: { question: question.trim() },
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to start reflection.";
        Alert.alert("Cannot start reflection", message);
      } finally {
        setIsStarting(false);
      }
    })();
  }, [user, canBeginReflection, router, question, openPremiumSheet]);

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1  px-5 pt-16">
      <View className=" w-full  flex-row items-center justify-between">
        <Text variant="subtitle" lightColor="white">
          Your Reflection
        </Text>
      </View>
      <View
        style={{
          width: "100%",
          paddingTop: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Avatar
          size={170}
          style={{
            borderWidth: 3,
            borderColor: useColor("primary"),
          }}
        >
          <AvatarImage source={require("@/assets/background/main2.png")} />
          <AvatarFallback>NS</AvatarFallback>
        </Avatar>
      </View>
      <View
        style={{
          marginTop: 50,
          paddingHorizontal: 20,
          alignSelf: "center",
        }}
      >
        <Text variant="title" style={{ fontSize: 20 }} lightColor="white">
          Clarify Your Situation
        </Text>
      </View>
      <View className="px-5 " style={{ marginVertical: 20 }}>
        <Input
          type="textarea"
          containerStyle={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 0,
          }}
          inputStyle={{ color: "white", fontFamily: "Poppins_400Regular" }}
          variant="glass"
          placeholder="Describe the situation you are reflecting on."
          rows={6}
          value={question}
          onChangeText={setQuestion}
        />
        <Text
          variant="caption"
          lightColor="white"
          style={{
            marginTop: 8,
            opacity: canBeginReflection ? 0.65 : 0.9,
          }}
        >
          {canBeginReflection
            ? `${trimmedLen} characters`
            : `At least ${MIN_QUESTION_LENGTH} characters (${trimmedLen}/${MIN_QUESTION_LENGTH})`}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "center",
          maxWidth: 400,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text
            variant="caption"
            lightColor="white"
            style={{ textAlign: "center", marginTop: 4 }}
          >
            This is a guided reflection tool inspired by classical philosophy,
            not a prediction system.
          </Text>
        </View>
        <View style={{ marginTop: 16, gap: 12 }}>
          <Button
            disabled={!canBeginReflection}
            loading={isStarting}
            onPress={handleBeginReflection}
          >
            Begin Reflection
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReflectionScreen;
