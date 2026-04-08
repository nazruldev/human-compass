import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { ScrollView } from "@/components/ui/scroll-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useColor } from "@/hooks/useColor";
import { getHexagramByNumber } from "@/services/hexagramService";
import { useUser } from "@clerk/clerk-expo";

import { ImageSource } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon, Search, UserCheck } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const ProfileScreen = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const primary = useColor("primary");
  const { node, value, hexagramId } = useLocalSearchParams<{
    node?: string;
    value?: string;
    hexagramId?: string;
  }>();
  const [hexagramData, setHexagramData] = useState<{
    name?: string;
    description?: string;
    affirmation?: string;
    imageUrl?: ImageSource;
    imageUrlBack?: ImageSource;
  } | null>(null);
  const [isLoadingHexagram, setIsLoadingHexagram] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageSource | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadHexagram = async () => {
      if (!hexagramId) {
        setHexagramData(null);
        return;
      }
      try {
        setIsLoadingHexagram(true);
        const data = await getHexagramByNumber(Number(hexagramId));
        if (!mounted) return;
        setHexagramData({
          name: data?.name,
          description: data?.description,
          affirmation: data?.affirmation,
          imageUrl: data?.imageUrl,
          imageUrlBack: data?.imageUrlBack,
        });
      } finally {
        if (mounted) setIsLoadingHexagram(false);
      }
    };
    void loadHexagram();
    return () => {
      mounted = false;
    };
  }, [hexagramId]);

  const userImageSource: ImageSource | null = user?.imageUrl
    ? { uri: user.imageUrl }
    : null;
  const hexagramImageSource: ImageSource | null =
    hexagramData?.imageUrlBack ?? null;
  const isScreenLoading =
    !isLoaded || (!!hexagramId && isLoadingHexagram && !hexagramData);

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1  px-5 pt-16">
      <View className=" w-full  flex-row items-center gap-1">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon name={ArrowLeftIcon} size={20} lightColor="white" />
        </Button>
        <Text variant="subtitle" lightColor="white">
          {node ? `${node} Detail` : "Hexagram Detail"}
        </Text>
      </View>
      <View
        className="flex-row w-full pt-10 "
        style={{ justifyContent: "space-between", gap: 24 }}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          {isScreenLoading ? (
            <>
              <Skeleton width={100} height={120} style={{ borderRadius: 8 }} />
              <Skeleton width={140} height={14} style={{ marginTop: 8 }} />
              <Skeleton width={90} height={10} style={{ marginTop: 6 }} />
            </>
          ) : (
            <>
              <Pressable
                onPress={() =>
                  userImageSource && setPreviewImage(userImageSource)
                }
                disabled={!userImageSource}
              >
                {userImageSource ? (
                  <Image
                    style={{ borderWidth: 1, borderColor: primary }}
                    source={userImageSource}
                    height={120}
                    width={100}
                  />
                ) : (
                  <View
                    style={{
                      width: 100,
                      height: 120,
                      borderWidth: 1,
                      borderColor: primary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActivityIndicator color={primary} />
                  </View>
                )}
              </Pressable>
              <Text
                variant="subtitle"
                style={{
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 8,
                  maxWidth: 150,
                }}
                lightColor="white"
                numberOfLines={2}
              >
                {user?.fullName ?? "User"}
              </Text>
              <Text
                variant="body"
                style={{ fontSize: 10, marginTop: 2 }}
                lightColor="white"
              >
                {(user?.unsafeMetadata as { birthDate?: string } | undefined)
                  ?.birthDate ?? "-"}
              </Text>
            </>
          )}
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          {isScreenLoading ? (
            <>
              <Skeleton width={100} height={120} style={{ borderRadius: 8 }} />
              <Skeleton width={95} height={14} style={{ marginTop: 8 }} />
              <Skeleton width={80} height={10} style={{ marginTop: 6 }} />
            </>
          ) : (
            <>
              <Pressable
                onPress={() =>
                  hexagramImageSource && setPreviewImage(hexagramImageSource)
                }
                disabled={!hexagramImageSource}
              >
                {hexagramImageSource ? (
                  <Image
                    style={{ borderWidth: 1, borderColor: primary }}
                    source={hexagramImageSource}
                    contentFit="fill"
                    height={120}
                    width={100}
                  />
                ) : (
                  <View
                    style={{
                      width: 100,
                      height: 120,
                      borderWidth: 1,
                      borderColor: primary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActivityIndicator color={primary} />
                  </View>
                )}
              </Pressable>
              <Text
                variant="subtitle"
                style={{
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 8,
                  maxWidth: 100,
                }}
                lightColor="white"
                numberOfLines={2}
              >
                {node ?? "Hexagram"}
              </Text>
              <Text
                variant="body"
                style={{ fontSize: 10, marginTop: 2 }}
                lightColor="white"
              >
                {hexagramData?.name ?? value ?? "Ding"}
              </Text>
            </>
          )}
        </View>
      </View>
      <View
        style={{
          marginTop: 50,
          paddingHorizontal: 20,
          alignSelf: "center",
          maxWidth: 300,
        }}
      >
        <Text
          variant="body"
          lightColor="white"
          style={{ textAlign: "center", lineHeight: 22 }}
        >
          {isScreenLoading
            ? "Loading hexagram detail..."
            : hexagramId
              ? `Hexagram ${hexagramId} - ${hexagramData?.name ?? value ?? "Ding"}`
              : "Hexagram 50 - DING / The Cauldron Archetype: The Alchemist"}
        </Text>
      </View>
      <ScrollView
        style={{ flex: 1, marginTop: 20 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.35)",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 10,
              gap: 8,
            }}
          >
            <Icon name={Search} size={18} color="#FFD60A" />
            <Text
              variant="subtitle"
              lightColor="white"
              style={{ fontSize: 15 }}
            >
              Description
            </Text>
          </View>
          <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
            {isScreenLoading ? (
              <>
                <Skeleton height={14} style={{ marginBottom: 8 }} />
                <Skeleton height={14} style={{ marginBottom: 8 }} />
                <Skeleton width="80%" height={14} />
              </>
            ) : (
              <Text
                variant="body"
                lightColor="white"
                style={{ fontSize: 14, lineHeight: 22, opacity: 0.95 }}
              >
                {hexagramData?.description ??
                  "Description is not available for this hexagram yet."}
              </Text>
            )}
          </View>
        </View>

        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.35)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 10,
              gap: 8,
            }}
          >
            <Icon name={UserCheck} size={18} color="#64D2FF" />
            <Text
              variant="subtitle"
              lightColor="white"
              style={{ fontSize: 15 }}
            >
              Affirmation
            </Text>
          </View>
          <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
            {isScreenLoading ? (
              <>
                <Skeleton height={14} style={{ marginBottom: 8 }} />
                <Skeleton height={14} style={{ marginBottom: 8 }} />
                <Skeleton width="75%" height={14} />
              </>
            ) : (
              <Text
                variant="body"
                lightColor="white"
                style={{ fontSize: 14, lineHeight: 22, opacity: 0.95 }}
              >
                {hexagramData?.affirmation ??
                  "Affirmation is not available for this hexagram yet."}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable
          onPress={() => setPreviewImage(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          {previewImage ? (
            <Image
              source={previewImage}
              width={300}
              height={500}
              contentFit="fill"
            />
          ) : null}
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
