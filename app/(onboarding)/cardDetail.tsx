import { Text } from "@/components/ui/text";
import { useLowerCanon, useUpperCanon } from "@/hooks/api/useCanon";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Dimensions, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 48 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.35;

export default function CardDetailModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string | string[];
    cardId?: string | string[];
    type?: "upper" | "lower" | ("upper" | "lower")[];
  }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const cardId = Array.isArray(params.cardId)
    ? params.cardId[0]
    : params.cardId;
  const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
  const canonType = typeParam === "lower" ? "lower" : "upper";

  const upperQuery = useUpperCanon();
  const lowerQuery = useLowerCanon();
  const activeQuery = canonType === "lower" ? lowerQuery : upperQuery;

  const { data } = activeQuery;
  const canonItems = useMemo(() => data ?? [], [data]);

  function getRowCardId(row: any): number {
    const raw =
      row?.card_id ??
      row?.cardId ??
      row?.card ??
      row?.number ??
      row?.index ??
      null;
    const n = typeof raw === "string" ? Number.parseInt(raw, 10) : Number(raw);
    return Number.isFinite(n) ? n : NaN;
  }

  const maxCardId = useMemo(() => {
    const ids = canonItems
      .map((i) => getRowCardId(i))
      .filter((n) => Number.isFinite(n) && n > 0);
    return ids.length ? Math.max(...ids) : 30;
  }, [canonItems]);

  const selectedCardId = useMemo(() => {
    const fromCardId = cardId ? Number.parseInt(cardId, 10) : NaN;
    if (Number.isFinite(fromCardId)) return fromCardId;

    if (id) {
      const row = canonItems.find(
        (i) =>
          String(i.id ?? "") === id ||
          String(i.path ?? "") === id ||
          String((i as any).uuid ?? "") === id,
      );
      const rowCardId = row ? getRowCardId(row) : NaN;
      if (Number.isFinite(rowCardId)) return rowCardId;
    }

    return 1;
  }, [cardId, canonItems, id]);

  // canon is 1..maxCardId (1-based)
  const selected = Math.min(Math.max(1, selectedCardId), maxCardId);

  // Upper & lower canon share this rule: (1,2), (3,4), … — odd N → N & N+1; even N → N−1 & N.
  const [first, second] = useMemo<[number, number]>(() => {
    if (selected % 2 === 1) {
      const hi = Math.min(selected + 1, maxCardId);
      return [selected, hi];
    }
    return [Math.max(1, selected - 1), selected];
  }, [maxCardId, selected]);

  function pickDescription(row: any): string {
    const candidates = [
      row?.description,
      row?.text,
      row?.content,
      row?.story,
      row?.details,
      row?.detail,
    ];
    const found = candidates.find(
      (v) => typeof v === "string" && v.trim().length > 0,
    );
    return (found as string | undefined)?.trim() ?? "";
  }

  const description = useMemo(() => {
    const match: any =
      canonItems.find(
        (i) => getRowCardId(i) === selected && pickDescription(i).length > 0,
      ) ??
      canonItems.find(
        (i) =>
          String(i.id ?? "") === String(id ?? "") &&
          pickDescription(i).length > 0,
      ) ??
      canonItems.find(
        (i) =>
          String(i.path ?? "") === String(id ?? "") &&
          pickDescription(i).length > 0,
      );

    return match ? pickDescription(match) : "";
  }, [canonItems, id, selected]);

  const firstImage = useMemo(() => {
    const row = canonItems.find((i) => getRowCardId(i) === first && !!i.image);
    return row?.image
      ? { uri: row.image }
      : require("@/assets/background/bg-card.png");
  }, [canonItems, first]);

  const secondImage = useMemo(() => {
    const row = canonItems.find((i) => getRowCardId(i) === second && !!i.image);
    return row?.image
      ? { uri: row.image }
      : require("@/assets/background/bg-card.png");
  }, [canonItems, second]);

  return (
    <SafeAreaView edges={["top"]} className="flex-1">
      <Pressable
        className="flex-1"
        onPress={() => router.back()}
        style={({ pressed }) => ({ opacity: pressed ? 0.98 : 1 })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap justify-center gap-2 pt-16">
            <Image
              source={firstImage}
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: 20,
              }}
              contentFit="contain"
            />
            <Image
              source={secondImage}
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: 20,
              }}
              contentFit="contain"
            />
          </View>
          <View className="p-5">
            <Text
              lightColor="white"
              style={{ textAlign: "center", lineHeight: 24 }}
            >
              {description || "—"}
            </Text>
          </View>
          <Text
            lightColor="white"
            style={{ marginTop: 24, textAlign: "center", opacity: 0.8 }}
          >
            Tap anywhere to close
          </Text>
        </ScrollView>
      </Pressable>
    </SafeAreaView>
  );
}
