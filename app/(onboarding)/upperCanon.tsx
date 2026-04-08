import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { useUpperCanon } from "@/hooks/api/useCanon";
import { useRouter } from "expo-router";
import { ChevronRightIcon } from "lucide-react-native";
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

export default function UpperCanon() {
  const router = useRouter();
  const { data, isLoading, error } = useUpperCanon();
  const cards = React.useMemo(
    () => (data ?? []).filter((i) => !!i.image),
    [data],
  );

  const keyExtractor = React.useCallback(
    (item: (typeof cards)[number]) => String(item.id ?? item.path),
    [],
  );

  const renderItem = React.useCallback(
    ({
      item,
      index,
    }: {
      item: (typeof cards)[number];
      index: number;
    }) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/(onboarding)/cardDetail",
            params: {
              type: "upper",
              cardId: String((item as any).card_id ?? (item as any).cardId ?? ""),
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

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 px-5 pt-16">
      {error ? (
        <View style={{ marginBottom: 16 }}>
          <Text variant="body" lightColor="white">
            {error instanceof Error
              ? error.message
              : "Failed to load upper canon"}
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
                Upper Canon
              </Text>
              <View className="flex-col gap-4">
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You begin in a world full of potential. You are born into
                  possibility, into a vast sky you do not yet understand. At
                  first, everything feels open and undefined - wide, promising,
                  and slightly overwhelming. Then you learn that life requires
                  grounding. You must learn to stand on Earth before you can
                  reach for Heaven. Before movement, there is balance. Before
                  ambition, there is stability.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  In the beginning, everything feels difficult. You do not know
                  how to start. You make mistakes. You learn. You watch. You
                  wait. You observe how the world works before you move within
                  it.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Slowly, you realise that life is not lived alone. You meet
                  people. You learn to cooperate. You find belonging. You
                  discover that relationships shape your path as much as your
                  choices do.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You begin to build small things - small habits, small efforts,
                  quiet routines. From these small accumulations, confidence
                  grows. You learn to walk carefully. You learn caution. You
                  learn respect for boundaries. And you discover that peace
                  comes when Heaven and Earth align within you.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  But life does not remain peaceful forever. There are moments
                  when things stagnate, when progress halts, when you feel
                  stuck. In those moments, you learn the power of fellowship -
                  of community - of standing with others around a shared fire.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You discover your inner strength. And you also learn humility,
                  realising that true strength is often quiet. You experience
                  joy. You learn to follow when needed. You learn to repair what
                  has been damaged.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Along the way, you realise that danger in life is not always
                  obvious. Sometimes it appears as old habits. Old thinking. Old
                  wounds that have never fully healed. You begin to approach new
                  opportunities with care. You observe before acting. You learn
                  to see more clearly. You learn how to speak. How to cut
                  through obstacles with clarity rather than force.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You learn beauty - not as appearance, but as harmony. You
                  witness things falling apart. You learn that endings are not
                  failures, but part of a larger cycle.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Eventually, you return to yourself. You correct your path. You
                  realign with what is true. You rediscover innocence - not as
                  naivety, but as clarity. You learn to accumulate nourishment -
                  knowledge, experience, wisdom. You feed your body. You feed
                  your mind. You feed your spirit.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  You take on more than you once believed you could carry. You
                  face deep fears, dark waters, and uncertainty. And through
                  this, you discover your inner fire. You learn how influence
                  flows between people. You learn endurance. Constancy.
                  Long-term commitment. And you realise this is only the first
                  half of the journey.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Because by now, you are no longer a child of life. You are a
                  participant in it.
                </Text>
                <Text
                  variant="subtitle"
                  lightColor="white"
                  style={{ lineHeight: 22, marginTop: 4 }}
                >
                  Closing Reflection
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Throughout this journey, four silent anchors shape the entire
                  path: the sky above, the earth below, the deep waters within,
                  and the light that allows us to see. All human experiences
                  unfold between these four forces.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Every person will walk through these situations in life - not
                  in the same order, not for the same duration, and not with the
                  same intensity. What differs is never the experience itself,
                  but how long we remain in each chapter before moving on.
                </Text>
                <Text
                  variant="body"
                  lightColor="white"
                  style={{ lineHeight: 24 }}
                >
                  Every human walks this path - not once, but many times, in
                  different forms. This is not a prediction. This is the story
                  of how we grow with the world.
                </Text>
              </View>
            </View>

            <View className="max-w-lg mx-auto">
              <Button
                disabled={isLoading}
                onPress={() => router.push("/(onboarding)/lowerCanon")}
              >
                <View className="flex-row items-center gap-1">
                  <Text variant="body" darkColor="black">
                    Lower Canon Story
                  </Text>
                  <ChevronRightIcon color="black" size={16} />
                </View>
              </Button>
            </View>
          </View>
        }
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}
