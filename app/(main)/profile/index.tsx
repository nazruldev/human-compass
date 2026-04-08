import { SnakeBorderCard } from "@/components/components/snakeBorderCard";
import { AlertDialog, useAlertDialog } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { env } from "@/config";
import { useColor } from "@/hooks/useColor";
import { usePremiumFlow } from "@/providers/premium-flow-provider";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  Calendar1Icon,
  ChevronRight,
  FileText,
  MapPin,
  PencilIcon,
  Star,
} from "lucide-react-native";
import React, { useState } from "react";
import { Linking, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SETTINGS_ITEMS = [
  // {
  //   id: "help",
  //   label: "Help",
  //   icon: HelpCircle,
  //   href: "/profile/help",
  //   externalUrl: "https://example.com/help",
  // },
  {
    id: "terms",
    label: "Terms and Conditions",
    icon: FileText,
    href: "/profile/terms",
    externalUrl: env.termsOfServiceUrl,
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    icon: MapPin,
    href: "/profile/privacy",
    externalUrl: env.privacyPolicyUrl,
  },
  { id: "rate", label: "Rate Us", icon: Star, href: "/profile/rate" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { openPremiumSheet } = usePremiumFlow();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const logoutDialog = useAlertDialog();
  const birthDate = (user?.unsafeMetadata?.birthDate ??
    user?.unsafeMetadata?.birth_date) as string | undefined;
  const displayDate = birthDate ?? "—";
  const handleConfirmLogout = () => {
    setLoadingBtn(true);
    void (async () => {
      try {
        await signOut();
        router.replace("/(auth)");
      } finally {
        setLoadingBtn(false);
      }
    })();
  };

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-16 pb-6">
          <Text
            variant="subtitle"
            lightColor="white"
            style={{ marginBottom: 24 }}
          >
            My Profile
          </Text>

          {/* Profile Card */}
          <View
            className="relative"
            style={{
              backgroundColor: "rgba(0,0,0,0.25)",
              padding: 20,
              borderRadius: 10,
              marginBottom: 24,
            }}
          >
            <View className="absolute top-2 right-2">
              <Button
                onPress={() => router.push("/profile/edit-profile" as any)}
                size="icon"
                style={{ borderRadius: 10 }}
                variant="outline"
                icon={PencilIcon}
              />
            </View>
            <View className="flex-row items-center gap-4">
              <Avatar
                size={72}
                style={{
                  borderWidth: 3,
                  borderColor: useColor("primary"),
                }}
              >
                {user?.imageUrl ? (
                  <AvatarImage source={{ uri: user.imageUrl }} />
                ) : (
                  <AvatarFallback>{user?.firstName?.[0] ?? "?"}</AvatarFallback>
                )}
              </Avatar>
              <View className="flex-1">
                <Text
                  lightColor="white"
                  variant="title"
                  style={{ fontSize: 18 }}
                >
                  {user?.firstName ?? "Nicholas"} {user?.lastName ?? "Saputra"}
                </Text>
                <View className="flex-row items-center  gap-2 ">
                  <Icon name={Calendar1Icon} size={14} color="#71717a" />
                  <Text variant="caption" style={{ fontSize: 12 }}>
                    {displayDate}
                  </Text>
                </View>
              </View>
            </View>
            <Separator style={{ marginVertical: 10 }} />
            <View className="flex-row justify-center">
              <Button
                variant="ghost"
                onPress={() => router.push("/profile/detail" as any)}
              >
                <Text
                  style={{
                    fontSize: 14,
                    textDecorationLine: "underline",
                    color: useColor("primary"),
                  }}
                  lightColor="white"
                >
                  See profile detail
                </Text>
              </Button>
            </View>
          </View>
          <SnakeBorderCard>
            <Text
              variant="body"
              className="text-center mb-5"
              lightColor="white"
            >
              Get Premium to unlock your advance interpretation
            </Text>
            <View className="flex-row justify-center gap-2">
              <Button variant="secondary" onPress={openPremiumSheet}>
                Subscribe Now
              </Button>
            </View>
          </SnakeBorderCard>
          {/* Settings */}
          <Text
            variant="subtitle"
            lightColor="white"
            style={{ marginBottom: 12, fontWeight: "600" }}
          >
            Setting
          </Text>
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.25)",
              borderRadius: 10,
            }}
          >
            {SETTINGS_ITEMS.map((item) => (
              <View key={item.id} style={{ paddingVertical: 5 }}>
                <Button
                  variant="ghost"
                  style={{ paddingHorizontal: 16 }}
                  onPress={() =>
                    "externalUrl" in item && item.externalUrl
                      ? Linking.openURL(item.externalUrl)
                      : router.push(item.href as any)
                  }
                >
                  <View className="flex-1 justify-between flex-row items-center">
                    <View className="flex-row gap-1 items-center">
                      <Icon name={item.icon} size={20} lightColor="white" />
                      <Text lightColor="white">{item.label}</Text>
                    </View>
                    <Icon name={ChevronRight} size={20} lightColor="white" />
                  </View>
                </Button>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 24, maxWidth: 250, alignSelf: "center" }}>
            <Button
              loading={loadingBtn}
              onPress={logoutDialog.open}
              disabled={loadingBtn}
            >
              Logout
            </Button>
          </View>

          <AlertDialog
            style={{ backgroundColor: useColor("secondary") }}
            isVisible={logoutDialog.isVisible}
            onClose={logoutDialog.close}
            title="Log out?"
            description="You will need to sign in again to access your profile and data."
            confirmText="Log out"
            cancelText="Cancel"
            onConfirm={handleConfirmLogout}
            onCancel={logoutDialog.close}
          />
          <Text
            variant="caption"
            lightColor="white"
            style={{
              marginTop: 24,
              textAlign: "center",
              opacity: 0.6,
            }}
          >
            Version {env.version}
          </Text>
          <Text
            variant="caption"
            lightColor="white"
            style={{
              textAlign: "center",
              opacity: 0.6,
            }}
          >
            The Constantine Consulting
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
