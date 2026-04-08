import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { useLowerCanon } from "@/hooks/api/useCanon";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "lucide-react-native";
import React from "react";
import { Dimensions, FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NUM_COLUMNS = 6;
const CARD_GAP = 8;
const SECTION_GAP = 24;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;
const CARD_HEIGHT = CARD_WIDTH * 1.35;

export default function LowerCanon() {
  const router = useRouter();
  const { user } = useUser();
  const { data, isLoading, error } = useLowerCanon();
  const cards = React.useMemo(
    () => (data ?? []).filter((i) => !!i.image),
    [data],
  );

  const keyExtractor = React.useCallback(
    (item: (typeof cards)[number]) => String(item.id ?? item.path),
    [],
  );

  const renderItem = React.useCallback(
    ({ item, index }: { item: (typeof cards)[number]; index: number }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/(onboarding)/cardDetail",
            params: {
              type: "lower",
              cardId: String(
                (item as any).card_id ?? (item as any).cardId ?? "",
              ),
              id: String(item.id ?? item.path ?? ""),
            },
          })
        }
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          marginRight: (index + 1) % NUM_COLUMNS === 0 ? 0 : CARD_GAP,

          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: item.image }}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          variant="square"
          contentFit="fill"
          transition={0}
          showLoadingIndicator={false}
        />
      </TouchableOpacity>
    ),
    [router],
  );

  const handleCompleteOnboarding = async () => {
    const alreadyDone = user?.unsafeMetadata?.onboarding_completed === true;
    if (alreadyDone) {
      router.replace("/(main)/home");
      return null;
    }
    const existingMeta =
      (user?.unsafeMetadata as Record<string, unknown> | undefined) ?? {};
    await user?.update({
      unsafeMetadata: {
        ...existingMeta,
        onboarding_completed: true,
      },
    });
    router.replace("/(main)/home");
  };
  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 px-5 pt-16">
      {error ? (
        <View style={{ marginBottom: 16 }}>
          <Text variant="body" lightColor="white">
            {error instanceof Error
              ? error.message
              : "Failed to load lower canon"}
          </Text>
        </View>
      ) : null}
      <FlatList
        data={cards}
        numColumns={NUM_COLUMNS}
        keyExtractor={keyExtractor}
        initialNumToRender={18}
        maxToRenderPerBatch={18}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        removeClippedSubviews
        columnWrapperStyle={{ marginBottom: CARD_GAP }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View
            className="w-full flex-col gap-1"
            style={{ marginBottom: SECTION_GAP }}
          >
            <Text variant="title" lightColor="white">
              Human Compass
            </Text>
            <Text
              variant="subtitle"
              style={{ fontSize: 14 }}
              lightColor="white"
            >
              THE JOURNEY OF SELF-DISCOVERY AND CONNECTION
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ paddingVertical: 16 }}>
              <Text variant="body" lightColor="white">
                Loading...
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View
            className="flex-col gap-2"
            style={{ marginTop: SECTION_GAP, marginBottom: 40 }}
          >
            <View
              className="w-full flex-col gap-1"
              style={{ marginBottom: SECTION_GAP }}
            >
              <Text variant="title" lightColor="white">
                Lower Canon
              </Text>
              <View className="flex-col gap-4">
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Now, you begin to understand that life is no longer only about
                  you. You start to feel how deeply people influence one another
                  - how presence, words, and actions quietly shape outcomes,
                  even when nothing is said aloud.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You learn about commitment. About staying. About continuity.
                  About what it means to remain through time, even when things
                  are no longer exciting, easy, or new.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  But life also teaches you restraint. You learn when to step
                  back, when retreat is wiser than pushing forward, and that not
                  every situation is meant to be met head-on.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Along the way, you discover a different kind of strength. Not
                  forceful. Not loud. But steady, grounded, and enduring.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  With this, clarity begins to form. You move through life with
                  more confidence now. You sense direction more clearly, even
                  when the road ahead is not fully visible.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Yet wisdom reminds you that brightness must sometimes be
                  dimmed to be protected. You learn discretion. You learn
                  conservation. You learn how to guard your energy instead of
                  spending it everywhere.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You begin to understand responsibility - within family, roles,
                  and structure. You see how harmony starts from within a
                  household, within daily order, within how one carries oneself.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Then differences appear. Opposition. Disagreement.
                  Perspective. You learn that not all conflict is meant to be
                  fought, and not all differences require resolution.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  There are seasons where life feels blocked. Where nothing
                  seems to move. And then, unexpectedly, relief arrives.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You learn how to breathe again. You realise that sometimes
                  growth comes from reducing -- from letting go, simplifying,
                  and releasing what no longer belongs.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  And sometimes growth comes from increasing - from nurturing
                  what truly matters. You find the courage to eliminate what no
                  longer serves your life.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  {`New people appear. New situations unfold. Some stay. Some don't. All teach. You experience the power of community - of gathering, shared direction, and collective strength.`}
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Progress slows, and you learn that advancement is gradual.
                  Step by step. Day by day.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  There are moments of exhaustion, where you realise that rest
                  is not weakness, but wisdom. You return to your source - to
                  what sustains you deeply.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Then comes a turning point. A transformation. A necessary
                  change. Life refines you through experience, slowly cooking
                  you into wisdom. Some moments shake you awake. Moments you
                  cannot ignore.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You learn stillness. You learn the power of stopping. You stop
                  rushing. You trust the natural pace of life.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You understand roles within relationships more clearly now.
                  There are times of abundance, and you learn how to hold
                  fullness without excess.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You step into unfamiliar places. You become the wanderer once
                  more. And you discover that gentle influence is sometimes more
                  powerful than force.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Joy returns. Old tensions dissolve. You feel lighter. You
                  learn the importance of limits - of boundaries that protect
                  balance rather than restrict life.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You return to sincerity. To honesty within yourself. You
                  realise that small actions matter. Tiny steps shape the path
                  ahead.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  When you look back, you see how far you have come. And you
                  understand something profound: You are never truly finished.
                  You are always becoming.
                </Text>
                <Text
                  variant="subtitle"
                  lightColor="white"
                  style={{ lineHeight: 22, marginTop: 4 }}
                >
                  Closing line for your app library
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  {`"Every human walks this path - not once, but many times in different forms. This is not a prediction. This is the story of how we grow with the world.`}
                </Text>
              </View>
            </View>

            <View className="max-w-lg mx-auto flex-row flex-wrap gap-2">
              <Button
                disabled={isLoading}
                variant="secondary"
                onPress={() => router.back()}
              >
                <ArrowLeftIcon size={16} />
              </Button>
              <Button disabled={isLoading} onPress={handleCompleteOnboarding}>
                Continue the Journey
              </Button>
            </View>
          </View>
        }
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}
