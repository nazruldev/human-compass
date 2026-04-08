import { AlertDialog, useAlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import DestinyProfile from "@/features/home/partials/DestinyProfile";
import { useColor } from "@/hooks/useColor";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Calendar1Icon } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { BackHandler, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatBirthDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-") as [string, string?, string?];
  if (!y || !m || !d) return dateStr;
  const monthIdx = parseInt(m, 10) - 1;
  return `${parseInt(d, 10)} ${MONTHS[monthIdx] ?? m} ${y}`;
}

/** Local device time */
function getTimeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning!";
  if (h >= 12 && h < 17) return "Good afternoon!";
  if (h >= 17 && h < 22) return "Good evening!";
  return "Hello!"; // late night / early morning (22:00–04:59)
}

const IndexHome = () => {
  const router = useRouter();
  const { user } = useUser();
  const {
    isVisible: exitVisible,
    open: openExitDialog,
    close: closeExitDialog,
  } = useAlertDialog();
  const [greeting, setGreeting] = useState(getTimeOfDayGreeting);
  const dialogCardBg = useColor("secondary");

  useFocusEffect(
    useCallback(() => {
      setGreeting(getTimeOfDayGreeting());

      const onBackPress = () => {
        openExitDialog();
        return true;
      };

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => {
        sub.remove();
        closeExitDialog();
      };
    }, [openExitDialog, closeExitDialog, setGreeting]),
  );

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 64,
          paddingBottom: 100,
          gap: 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full ">
          <Text
            variant="subtitle"
            style={{ lineHeight: 14 }}
            lightColor="white"
          >
            {greeting}
          </Text>
          <Text
            variant="title"
            lightColor="white"
            style={{ maxWidth: 280, lineHeight: 35 }}
            numberOfLines={2}
          >
            {user?.fullName ?? "User"}
          </Text>
          <View className="flex gap-2 flex-row items-center">
            <Icon name={Calendar1Icon} size={16} lightColor="white" />
            <Text variant="body" lightColor="white">
              {formatBirthDate(user?.unsafeMetadata?.birthDate as string)}
            </Text>
          </View>
        </View>
        <DestinyProfile user={user} />
        <View className="flex-col gap-4 w-full items-center">
          <View className="max-w-lg mx-auto">
            <Text variant="subtitle" lightColor="white">
              Reflect on Your Situation
            </Text>
            <Text variant="caption" lightColor="white">
              This is a guided reflection tool inspired by classical philosophy,
              not a prediction system.
            </Text>
          </View>
          <View className="flex-row gap-2 max-w-xl mx-auto flex-wrap justify-center">
            <Button
              onPress={() => router.replace("/(onboarding)/upperCanon")}
              variant="secondary"
            >
              View Life Journey
            </Button>
            <Button onPress={() => router.replace("/(main)/reflection")}>
              Begin Reflection
            </Button>
          </View>
        </View>
      </ScrollView>

      <AlertDialog
        isVisible={exitVisible}
        onClose={closeExitDialog}
        title="Close app?"
        description="Are you sure you want to exit the application?"
        confirmText="Exit"
        cancelText="Stay"
        style={{ backgroundColor: dialogCardBg }}
        onConfirm={() => BackHandler.exitApp()}
        onCancel={closeExitDialog}
      />
    </SafeAreaView>
  );
};

export default IndexHome;
