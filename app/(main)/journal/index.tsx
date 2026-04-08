import { AlertDialog, useAlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SearchBar } from "@/components/ui/searchbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useHistoricalJournalEntriesInfinite } from "@/hooks/api/useJournalEntries";
import { useColor } from "@/hooks/useColor";
import {
  deleteAllHistoricalEntries,
  updateJournalEntry,
  type HistoricalJournalItem,
} from "@/services/journalService";
import { useUser } from "@clerk/clerk-expo";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ChevronRight, Heart, Inbox } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View as RNView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CARD_PADDING = 20;
const ITEM_GAP = 12;

function JournalListItem({
  item,
  onPress,
  onFavoritePress,
  isFavoriteLoading,
}: {
  item: HistoricalJournalItem;
  onPress: () => void;
  onFavoritePress: () => void;
  isFavoriteLoading?: boolean;
}) {
  const heartColor = item.is_favorite ? "#ef4444" : "rgba(255,255,255,0.6)";
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.35)",
        borderRadius: 12,
        padding: 14,
        marginBottom: ITEM_GAP,
        gap: 14,
      }}
    >
      <RNView
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          backgroundColor: "#E8DCC8",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={Inbox} size={24} color="#C47B2C" />
      </RNView>
      <RNView style={{ flex: 1, minWidth: 0 }}>
        <Text
          variant="body"
          lightColor="white"
          numberOfLines={2}
          style={{ fontSize: 14, marginBottom: 2 }}
        >
          {item.title}
        </Text>
        <Text
          variant="caption"
          lightColor="white"
          style={{ fontSize: 12, opacity: 0.8 }}
        >
          {item.generateDate}
        </Text>
      </RNView>
      <Pressable
        onPress={onFavoritePress}
        hitSlop={8}
        disabled={isFavoriteLoading}
        style={({ pressed }) => [
          {
            padding: 4,
            minWidth: 28,
            minHeight: 28,
            alignItems: "center",
            justifyContent: "center",
          },
          pressed && { opacity: 0.6 },
        ]}
      >
        {isFavoriteLoading ? (
          <ActivityIndicator size="small" color={heartColor} />
        ) : (
          <Icon
            name={Heart}
            size={20}
            color={heartColor}
            fill={item.is_favorite ? heartColor : "transparent"}
          />
        )}
      </Pressable>
      <Icon name={ChevronRight} size={20} color="rgba(255,255,255,0.6)" />
    </TouchableOpacity>
  );
}

function JournalListItemSkeleton() {
  return (
    <RNView
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.35)",
        borderRadius: 12,
        padding: 14,
        marginBottom: ITEM_GAP,
        gap: 14,
      }}
    >
      <Skeleton width={48} height={48} style={{ borderRadius: 12 }} />
      <RNView style={{ flex: 1 }}>
        <Skeleton width="90%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="45%" height={12} />
      </RNView>
      <Skeleton width={20} height={20} style={{ borderRadius: 10 }} />
      <Skeleton width={20} height={20} style={{ borderRadius: 10 }} />
    </RNView>
  );
}

type FilterTab = "all" | "favorite";

const IndexJournal = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const router = useRouter();
  const { user } = useUser();
  const { isVisible, open, close } = useAlertDialog();
  const primaryColor = useColor("primary");
  const dialogCardBg = useColor("secondary");
  const tabBarHeight = useBottomTabBarHeight();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isHistoricalInitialLoading,
    refetch: refetchHistorical,
    isRefetching: historicalRefetching,
  } = useHistoricalJournalEntriesInfinite();

  const isRefreshing = historicalRefetching;
  const showSkeleton = isHistoricalInitialLoading;

  const onRefresh = () => {
    refetchHistorical();
  };

  const allHistorical = useMemo(
    () => data?.pages.flatMap((p) => p.entries) ?? [],
    [data],
  );
  const favoriteCount = useMemo(
    () => allHistorical.filter((i) => i.is_favorite).length,
    [allHistorical],
  );

  const filteredItems = useMemo(() => {
    let items = allHistorical.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (filterTab === "favorite") {
      items = items.filter((i) => i.is_favorite);
    }
    return items;
  }, [allHistorical, searchQuery, filterTab]);
  const listData = showSkeleton
    ? Array.from({ length: 8 }, (_, i) => ({ id: `skeleton-${i}` }))
    : filteredItems;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const queryClient = useQueryClient();
  const favoriteMutation = useMutation({
    mutationFn: ({ id, is_favorite }: { id: string; is_favorite: boolean }) =>
      updateJournalEntry(id, { is_favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
  });

  const handleFavorite = (item: HistoricalJournalItem) => {
    favoriteMutation.mutate({ id: item.id, is_favorite: !item.is_favorite });
  };

  const favoriteLoadingId =
    favoriteMutation.isPending && favoriteMutation.variables
      ? favoriteMutation.variables.id
      : null;

  const clearHistoricalMutation = useMutation({
    mutationFn: () => {
      const id = user?.id;
      if (!id) throw new Error("You must be signed in to clear history.");
      return deleteAllHistoricalEntries(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      close();
    },
  });

  const handleClearHistorical = () => {
    if (!user?.id) return;
    clearHistoricalMutation.mutate();
  };

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 pt-16">
      <View className="px-5 flex-row items-center justify-between mb-4">
        <Text variant="subtitle" lightColor="white" style={{ fontSize: 24 }}>
          Journal
        </Text>
        <Button
          variant="ghost"
          size="xs"
          onPress={open}
          disabled={!user?.id || clearHistoricalMutation.isPending}
        >
          Clear Historical
        </Button>
      </View>
      <View className="px-5 py-4">
        <View
          className="flex-row items-center gap-2 "
          style={{ paddingBottom: 20 }}
        >
          <Button
            variant={filterTab === "all" ? "default" : "outline"}
            size="sm"
            onPress={() => setFilterTab("all")}
          >
            All Entries
          </Button>
          <Button
            variant={filterTab === "favorite" ? "default" : "outline"}
            size="sm"
            onPress={() => setFilterTab("favorite")}
          >
            {`Favorite (${favoriteCount})`}
          </Button>
        </View>
        <SearchBar
          placeholder="Find your historical reflection."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={{ borderRadius: 12 }}
          debounceMs={0}
        />
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
          />
        }
        renderItem={({ item }) =>
          showSkeleton ? (
            <View style={{ paddingHorizontal: CARD_PADDING }}>
              <JournalListItemSkeleton />
            </View>
          ) : (
            <View style={{ paddingHorizontal: CARD_PADDING }}>
              <JournalListItem
                item={item as HistoricalJournalItem}
                onPress={() =>
                  router.push({
                    pathname: "/journal/jurnalDetail",
                    params: { id: item.id },
                  })
                }
                onFavoritePress={() =>
                  handleFavorite(item as HistoricalJournalItem)
                }
                isFavoriteLoading={favoriteLoadingId === item.id}
              />
            </View>
          )
        }
        contentContainerStyle={{
          paddingBottom: Math.max(80, (tabBarHeight ?? 0) + 24),
          paddingHorizontal: 0,
          flexGrow: 1,
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          !showSkeleton && isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator color={primaryColor} size="small" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          showSkeleton ? null : (
            <View className="px-5 py-12 items-center">
              <Text
                variant="caption"
                lightColor="white"
                style={{ opacity: 0.6 }}
              >
                {filterTab === "favorite"
                  ? "No favorite entries yet"
                  : "No historical entries yet"}
              </Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />

      <AlertDialog
        isVisible={isVisible}
        onClose={close}
        title="Clear all historical entries?"
        description="This action cannot be undone. All your historical journal entries will be permanently deleted."
        confirmText="Clear"
        style={{ backgroundColor: dialogCardBg }}
        onConfirm={handleClearHistorical}
      />
    </SafeAreaView>
  );
};

export default IndexJournal;
