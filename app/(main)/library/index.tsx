import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { SearchBar } from "@/components/ui/searchbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useHexagrams } from "@/hooks/api/useHexagrams";
import { useColor } from "@/hooks/useColor";
import type { HexagramWithImage } from "@/utils/supabase";
import type { ImageSource } from "expo-image";
import { useRouter } from "expo-router";
import { AlertCircle, Inbox } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Dimensions, FlatList, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
/** Grid columns for hexagram cards (FlatList + skeleton). */
const NUM_COLUMNS = 4;
const GAP = 12;
const PADDING = 20;
const CARD_WIDTH =
  (SCREEN_WIDTH - PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

function filterHexagrams(data: HexagramWithImage[], query: string) {
  if (!data?.length) return [];
  if (!query.trim()) return data;
  const q = query.toLowerCase().trim();
  return data.filter(
    (h) =>
      h.name.toLowerCase().includes(q) ||
      String(h.number).includes(q) ||
      (h.chinese_name?.toLowerCase().includes(q) ?? false) ||
      (h.archetype?.toLowerCase().includes(q) ?? false),
  );
}

function LibrarySkeleton() {
  const rows = 6;
  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 pt-16">
      <View className="px-5 pb-4">
        <Skeleton width={120} height={28} variant="rounded" />
        <Skeleton
          width="100%"
          height={44}
          variant="rounded"
          style={{ marginTop: 16 }}
        />
      </View>
      <View className="flex-row flex-wrap gap-3 px-5">
        {Array.from({ length: rows * NUM_COLUMNS }, (_, i) => (
          <Skeleton
            key={i}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            variant="rounded"
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  const muted = useColor("mutedForeground");
  return (
    <View className="flex-1 items-center justify-center gap-3 py-12">
      <Icon name={Inbox} size={48} color={muted} />
      <Text variant="body" className="text-center text-muted-foreground">
        {hasSearch ? "No cards match your search" : "No cards available"}
      </Text>
    </View>
  );
}

function ErrorState({ message }: { message?: string }) {
  const danger = useColor("red");
  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 pt-4">
      <View className="px-5 pb-4">
        <Text variant="title" lightColor="white" className="mb-4 text-2xl">
          Library
        </Text>
      </View>
      <View className="flex-1 items-center justify-center gap-3 py-12">
        <Icon name={AlertCircle} size={48} color={danger} />
        <Text variant="body" className="text-center text-muted-foreground">
          {message ?? "Something went wrong. Please try again."}
        </Text>
      </View>
    </SafeAreaView>
  );
}

function HexagramCard({
  item,
  onPress,
}: {
  item: HexagramWithImage;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="items-center"
      style={{ width: CARD_WIDTH }}
    >
      <Image
        cachePolicy="memory-disk"
        source={(item.imageUrlBack ?? item.imageUrl) as ImageSource}
        variant="rounded"
        width={CARD_WIDTH}
        aspectRatio={0.65}
        contentFit="fill"
      />
    </Pressable>
  );
}

export default function LibraryScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useHexagrams();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(
    () => filterHexagrams(data ?? [], searchQuery),
    [data, searchQuery],
  );

  if (isLoading) return <LibrarySkeleton />;
  if (error) {
    const msg =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as Error).message)
        : "Failed to load";
    return <ErrorState message={msg} />;
  }

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 pt-16">
      <View className="px-5 pb-4">
        <Text
          variant="subtitle"
          lightColor="white"
          style={{ marginBottom: 20 }}
        >
          Library
        </Text>
        <SearchBar
          placeholder="Find card..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={{ borderRadius: 12 }}
          debounceMs={0}
        />
      </View>

      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <HexagramCard
            item={item}
            onPress={() =>
              router.push({
                pathname: "/library/LibraryCardDetail",
                params: { id: item.id, number: String(item.number) },
              })
            }
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
        contentContainerStyle={{
          paddingHorizontal: PADDING,
          paddingBottom: GAP,
          ...(filteredData.length === 0 && { flexGrow: 1 }),
        }}
        ListEmptyComponent={
          <EmptyState hasSearch={searchQuery.trim().length > 0} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
