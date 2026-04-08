import { ANIMAL_SIGNS, getAnimalImage } from "@/assets/images/animal";
import { ELEMENTS, getElementImage } from "@/assets/images/element";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useHexagramByNumber } from "@/hooks/api/useHexagrams";
import { useColor } from "@/hooks/useColor";
import { getHexagramById } from "@/utils/hexagrams";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar1Icon,
  Clock,
  Moon,
  Search,
  Sun,
  UserCheck,
  Users,
} from "lucide-react-native";
import React from "react";
import { Image, ScrollView, View } from "react-native";
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

/** 6-bar glyph from `hexagram.symbol` in utils/hexagrams (bottom → top rows). */
function HexagramMiniGlyph({
  symbol,
  size = 28,
  color = "#ffffff",
}: {
  symbol: readonly number[];
  size?: number;
  color?: string;
}) {
  const lineH = Math.max(1.5, size / 14);
  const lineW = size;
  const gap = lineW * 0.18;
  const segW = (lineW - gap) / 2;
  const lines = [...symbol].reverse();

  return (
    <View style={{ alignItems: "center", width: lineW }}>
      {lines.map((v, i) => (
        <View
          key={i}
          style={{
            width: lineW,
            height: lineH,
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 0.5,
          }}
        >
          {v === 1 ? (
            <View
              style={{
                width: lineW,
                height: lineH,
                backgroundColor: color,
                borderRadius: lineH / 2,
              }}
            />
          ) : (
            <View
              style={{
                width: lineW,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  width: segW,
                  height: lineH,
                  backgroundColor: color,
                  borderRadius: lineH / 2,
                }}
              />
              <View style={{ width: gap }} />
              <View
                style={{
                  width: segW,
                  height: lineH,
                  backgroundColor: color,
                  borderRadius: lineH / 2,
                }}
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

export default function ProfileDetailScreen() {
  const router = useRouter();
  const { user } = useUser();
  const primaryColor = useColor("primary");
  const borderColor = useColor("border");

  const birthDate = (user?.unsafeMetadata?.birthDate ??
    user?.unsafeMetadata?.birth_date) as string | undefined;
  const birthTime = user?.unsafeMetadata?.birthTime as string | undefined;
  const gender = user?.unsafeMetadata?.gender as string | undefined;
  const displayDate = formatBirthDate(birthDate);
  const displayTime = birthTime ?? "—";
  const displayGender = gender
    ? gender === "male"
      ? "Male"
      : gender === "female"
        ? "Female"
        : gender
    : "—";

  const ast = user?.unsafeMetadata?.astrology as
    | {
        animalSign?: string;
        element?: string;
        polarity?: string;
        hexagramId?: number;
      }
    | undefined;
  const animalSign =
    ast?.animalSign ?? (user?.unsafeMetadata?.animal_sign as string);
  const element = ast?.element ?? (user?.unsafeMetadata?.element as string);
  const polarity = ast?.polarity ?? (user?.unsafeMetadata?.polarity as string);
  const hexagramId = (ast?.hexagramId ?? user?.unsafeMetadata?.hexagram_id) as
    | number
    | undefined;
  const safeHexagramId =
    hexagramId != null && hexagramId >= 1 && hexagramId <= 64 ? hexagramId : 1;
  const hexagram = getHexagramById(safeHexagramId);

  const { data: hexagramFromDb, isLoading: hexagramDetailLoading } =
    useHexagramByNumber(safeHexagramId);

  const animalIndex = animalSign
    ? Math.max(
        0,
        ANIMAL_SIGNS.indexOf(animalSign as (typeof ANIMAL_SIGNS)[number]),
      )
    : 0;
  const elementIndex = element
    ? Math.max(0, ELEMENTS.indexOf(element as (typeof ELEMENTS)[number]))
    : 0;
  const polarityLabel = polarity === "Yin" ? "Yin" : "Yang";
  const PolarityIcon = polarity === "Yin" ? Moon : Sun;

  const defaultDescription = `Your hexagram ${hexagram.name} reflects aspects of your destiny profile. Explore its meaning through reflection and the I Ching wisdom.`;
  const defaultAffirmation = `Embrace your ${ANIMAL_SIGNS[animalIndex] ?? "path"} nature with ${polarityLabel} energy. Let the ${ELEMENTS[elementIndex] ?? "element"} guide your journey.`;

  const showHexagramDetailSkeleton =
    hexagramDetailLoading && hexagramFromDb == null;

  const hexagramDescription =
    hexagramFromDb?.description?.trim() || defaultDescription;

  const hexagramAffirmation =
    hexagramFromDb?.affirmation?.trim() || defaultAffirmation;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 ">
      <View className="flex-row items-center gap-2  px-5 py-4">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon name={ArrowLeft} lightColor="white" />
        </Button>
        <Text variant="subtitle" lightColor="white">
          Profile Detail
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.25)",
            padding: 20,
            borderRadius: 12,
            marginBottom: 24,
            alignItems: "center",
          }}
        >
          <Avatar
            size={100}
            style={{
              borderWidth: 3,
              borderColor: primaryColor,
              marginBottom: 12,
            }}
          >
            {user?.imageUrl ? (
              <AvatarImage source={{ uri: user.imageUrl }} />
            ) : (
              <AvatarFallback>{user?.firstName?.[0] ?? "?"}</AvatarFallback>
            )}
          </Avatar>
          <Text
            variant="heading"
            lightColor="white"
            style={{ fontSize: 20, textAlign: "center" }}
          >
            {(user?.fullName ??
              `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()) ||
              "User"}
          </Text>
          <View className="flex-row items-center justify-center gap-2  flex-wrap">
            <View className="flex-row items-center gap-2">
              <Icon name={Calendar1Icon} size={14} color="#71717a" />
              <Text
                variant="caption"
                lightColor="white"
                style={{ fontSize: 12 }}
              >
                {displayDate}
              </Text>
            </View>
            <Text
              variant="caption"
              lightColor="white"
              style={{ fontSize: 22, lineHeight: 24, fontWeight: "600" }}
            >
              ·
            </Text>
            <View className="flex-row items-center gap-2">
              <Icon name={Clock} size={14} color="#71717a" />
              <Text
                variant="caption"
                lightColor="white"
                style={{ fontSize: 12 }}
              >
                {displayTime}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2 mb-4">
            <Icon name={Users} size={14} color="#71717a" />
            <Text variant="caption" lightColor="white" style={{ fontSize: 12 }}>
              {displayGender}
            </Text>
          </View>
          <View
            style={{
              width: "100%",
              marginTop: 6,
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <View
              style={{
                width: "48%",
                borderWidth: 1,
                borderColor,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 8,
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  borderWidth: 1,
                  borderColor,
                  backgroundColor: "rgba(0,0,0,0.25)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                }}
              >
                <Image
                  source={getAnimalImage(animalIndex)}
                  style={{ width: 24, height: 24, borderRadius: 12 }}
                  resizeMode="contain"
                />
              </View>
              <Text
                variant="caption"
                lightColor="white"
                style={{ opacity: 0.7, fontSize: 12 }}
              >
                Animal Sign
              </Text>
              <Text
                variant="body"
                lightColor="white"
                style={{ fontSize: 13, marginTop: 2, textAlign: "center" }}
              >
                {ANIMAL_SIGNS[animalIndex] ?? "—"}
              </Text>
            </View>

            <View
              style={{
                width: "48%",
                borderWidth: 1,
                borderColor,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 8,
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  borderWidth: 1,
                  borderColor,
                  backgroundColor: "rgba(0,0,0,0.25)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                }}
              >
                <Icon name={PolarityIcon} size={24} color={primaryColor} />
              </View>
              <Text
                variant="caption"
                lightColor="white"
                style={{ opacity: 0.7, fontSize: 12 }}
              >
                Polarity
              </Text>
              <Text
                variant="body"
                lightColor="white"
                style={{ fontSize: 13, marginTop: 2, textAlign: "center" }}
              >
                {polarityLabel}
              </Text>
            </View>

            <View
              style={{
                width: "48%",
                borderWidth: 1,
                borderColor,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 8,
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  borderWidth: 1,
                  borderColor,
                  backgroundColor: "rgba(0,0,0,0.25)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                }}
              >
                <Image
                  source={getElementImage(elementIndex)}
                  style={{ width: 24, height: 24, borderRadius: 12 }}
                  resizeMode="contain"
                />
              </View>
              <Text
                variant="caption"
                lightColor="white"
                style={{ opacity: 0.7, fontSize: 12 }}
              >
                Element
              </Text>
              <Text
                variant="body"
                lightColor="white"
                style={{ fontSize: 13, marginTop: 2, textAlign: "center" }}
              >
                {ELEMENTS[elementIndex] ?? "—"}
              </Text>
            </View>

            <View
              style={{
                width: "48%",
                borderWidth: 1,
                borderColor,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 8,
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  borderWidth: 1,
                  borderColor,
                  backgroundColor: "rgba(0,0,0,0.25)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                }}
              >
                <HexagramMiniGlyph symbol={hexagram.symbol} size={26} />
              </View>
              <Text
                variant="caption"
                lightColor="white"
                style={{ opacity: 0.7, fontSize: 12 }}
              >
                Hexagram
              </Text>
              <Text
                variant="body"
                lightColor="white"
                style={{ fontSize: 13, marginTop: 2, textAlign: "center" }}
                numberOfLines={1}
              >
                {hexagram.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Description & Affirmation */}
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
            {showHexagramDetailSkeleton ? (
              <View style={{ gap: 10 }}>
                <Skeleton height={14} />
                <Skeleton height={14} width="94%" />
                <Skeleton height={14} width="90%" />
                <Skeleton height={14} width="86%" />
                <Skeleton height={14} width="72%" />
              </View>
            ) : (
              <Text
                variant="body"
                lightColor="white"
                style={{ fontSize: 14, lineHeight: 22, opacity: 0.95 }}
              >
                {hexagramDescription}
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
            {showHexagramDetailSkeleton ? (
              <View style={{ gap: 10 }}>
                <Skeleton height={14} width="88%" />
                <Skeleton height={14} width="92%" />
                <Skeleton height={14} width="70%" />
              </View>
            ) : (
              <Text
                variant="body"
                lightColor="white"
                style={{ fontSize: 14, lineHeight: 22, opacity: 0.95 }}
              >
                {hexagramAffirmation}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
