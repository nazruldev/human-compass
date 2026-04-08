import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { getHexagramByNumber } from "@/services/hexagramService";
import { createJournalEntry } from "@/services/journalService";
import {
  getCurrentSeason,
  getHexagramYesNo,
} from "@/services/reflectionService";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeftIcon, Shuffle } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Animated, {
  Easing,
  makeMutable,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const NUM_COLUMNS = 4;
const GAP = 8;
const PADDING = 20;

const CARD_WIDTH =
  (width - PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

const TOTAL = 64;

// 🔧 Shuffle animation config (edit here)
const SHUFFLE_CONFIG = {
  durationMs: 3000,
  steps: 80,
  stepDelayMs: 25,
  moveMs: 90,
  liftMs: 35,
  dropMs: 45,
  liftPx: 40,
} as const;

const MOVE_MS = SHUFFLE_CONFIG.moveMs;
const LIFT_MS = SHUFFLE_CONFIG.liftMs;
const DROP_MS = SHUFFLE_CONFIG.dropMs;
const LIFT_PX = SHUFFLE_CONFIG.liftPx;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

function getPosition(index: number) {
  const row = Math.floor(index / NUM_COLUMNS);
  const col = index % NUM_COLUMNS;

  return {
    x: col * (CARD_WIDTH + GAP),
    y: row * (CARD_HEIGHT + GAP),
  };
}

function CardCell({
  item,
  index,
  onPress,
  disabled,
}: {
  item: { x: any; y: any; z: any };
  index: number;
  onPress: () => void;
  disabled: boolean;
}) {
  const style = useAnimatedStyle(() => ({
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    transform: [
      { translateX: item.x.value },
      { translateY: item.y.value + item.z.value },
    ],
  }));

  return (
    <Animated.View style={style} pointerEvents={disabled ? "none" : "auto"}>
      <Pressable onPress={onPress} disabled={disabled}>
        <Image
          source={require("@/assets/background/bg-card.png")}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          contentFit="cover"
          containerStyle={{ borderRadius: 12 }}
        />
      </Pressable>
    </Animated.View>
  );
}

export default function ChooseCardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = React.useState(false);
  const isPickLockedRef = React.useRef(false);

  const params = useLocalSearchParams<{ question?: string | string[] }>();
  const question = Array.isArray(params.question)
    ? params.question[0]
    : params.question;

  const positions = React.useRef(
    Array.from({ length: TOTAL }, (_, i) => getPosition(i)),
  ).current;

  const shared = React.useRef(
    Array.from({ length: TOTAL }, (_, i) => ({
      x: makeMutable(positions[i].x),
      y: makeMutable(positions[i].y),
      z: makeMutable(0),
    })),
  ).current;

  // Hexagram code deck (randomized). This is what will be sent on press.
  const deckRef = React.useRef<number[]>(
    shuffleArray(Array.from({ length: TOTAL }, (_, i) => i + 1)),
  );

  const swapDeck = React.useCallback((i: number, j: number) => {
    const deck = deckRef.current;
    const temp = deck[i];
    deck[i] = deck[j]!;
    deck[j] = temp!;
  }, []);

  const [isShuffling, setIsShuffling] = React.useState(false);
  const isShufflingRef = React.useRef(false);
  const timeoutsRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const stepTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepIndexRef = React.useRef(0);
  const busyIndexesRef = React.useRef<Set<number>>(new Set());

  const rowCount = Math.ceil(TOTAL / NUM_COLUMNS);
  const gridHeight = rowCount * CARD_HEIGHT + Math.max(0, rowCount - 1) * GAP;

  const swap = React.useCallback(
    (i: number, j: number) => {
      const temp = positions[i];
      positions[i] = positions[j];
      positions[j] = temp;
    },
    [positions],
  );

  const animateSwap = React.useCallback(
    (i: number, j: number) => {
      if (!isShufflingRef.current) return;
      if (i === j) return;
      if (busyIndexesRef.current.has(i) || busyIndexesRef.current.has(j))
        return;
      busyIndexesRef.current.add(i);
      busyIndexesRef.current.add(j);

      const posA = positions[i];
      const posB = positions[j];

      // Reserve the slots immediately so subsequent swaps see updated layout.
      swap(i, j);
      // Keep the hexagram code attached to the moving card.
      // When two cards swap positions, their assigned hexagram codes swap too.
      swapDeck(i, j);

      // lift -> move -> drop (drop is delayed so it doesn't override lift)
      shared[i].z.value = withSequence(
        withTiming(-LIFT_PX, { duration: LIFT_MS }),
        withDelay(MOVE_MS, withTiming(0, { duration: DROP_MS })),
      );
      shared[j].z.value = withSequence(
        withTiming(-LIFT_PX, { duration: LIFT_MS }),
        withDelay(MOVE_MS, withTiming(0, { duration: DROP_MS })),
      );

      // move
      shared[i].x.value = withTiming(posB.x, {
        duration: MOVE_MS,
        easing: Easing.out(Easing.cubic),
      });
      shared[i].y.value = withTiming(posB.y, { duration: MOVE_MS });

      shared[j].x.value = withTiming(posA.x, { duration: MOVE_MS });
      shared[j].y.value = withTiming(posA.y, { duration: MOVE_MS });

      const t = setTimeout(() => {
        if (!isShufflingRef.current) return;
        busyIndexesRef.current.delete(i);
        busyIndexesRef.current.delete(j);
      }, MOVE_MS);
      timeoutsRef.current.push(t);
    },
    [positions, shared, swap, swapDeck],
  );

  const stopShuffle = React.useCallback(() => {
    if (!isShufflingRef.current && timeoutsRef.current.length === 0) return;
    isShufflingRef.current = false;
    // avoid redundant state updates that can cause effect loops in dev/HMR
    setIsShuffling((prev) => (prev ? false : prev));
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    stepIndexRef.current = 0;
    for (const t of timeoutsRef.current) clearTimeout(t);
    timeoutsRef.current = [];
    busyIndexesRef.current.clear();
  }, []);

  const doShuffle = React.useCallback(
    (durationMs = SHUFFLE_CONFIG.durationMs) => {
      if (isShufflingRef.current) return;
      stopShuffle(); // clear any pending timers (safety)

      isShufflingRef.current = true;
      setIsShuffling(true);

      const steps = SHUFFLE_CONFIG.steps;
      const stepDelayMs = SHUFFLE_CONFIG.stepDelayMs;
      stepIndexRef.current = 0;

      const runStep = () => {
        if (!isShufflingRef.current) return;
        if (stepIndexRef.current >= steps) return;

        const i = Math.floor(Math.random() * TOTAL);
        const j = Math.floor(Math.random() * TOTAL);
        animateSwap(i, j);

        stepIndexRef.current += 1;
        stepTimerRef.current = setTimeout(runStep, stepDelayMs);
      };

      // start immediately
      stepTimerRef.current = setTimeout(runStep, 0);

      const stopT = setTimeout(() => {
        stopShuffle();
      }, durationMs);
      timeoutsRef.current.push(stopT);
    },
    [animateSwap, stopShuffle],
  );

  React.useEffect(() => {
    doShuffle(SHUFFLE_CONFIG.durationMs);
    return () => stopShuffle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePickCard = React.useCallback(
    async (index: number) => {
      if (isPickLockedRef.current || isShufflingRef.current) return;
      if (!user?.id) {
        Alert.alert(
          "Sign in required",
          "Please sign in to save your reflection to the journal.",
        );
        return;
      }
      isPickLockedRef.current = true;
      const hexNum = deckRef.current[index] ?? index + 1;
      const q = question?.trim() || "";
      stopShuffle();
      setIsSaving(true);
      try {
        const [yesNo, hexRow] = await Promise.all([
          getHexagramYesNo({ hexagramNumber: hexNum }),
          getHexagramByNumber(hexNum),
        ]);
        const hexName =
          yesNo?.hexagram_name ?? hexRow?.name ?? `Hexagram ${hexNum}`;
        const answerType = yesNo?.answer_type ?? "Guidance";
        const desc = yesNo?.description ?? hexRow?.description ?? null;
        const responseText =
          yesNo?.response ?? yesNo?.description ?? desc ?? "";
        const season =
          (yesNo?.season as string | undefined) ?? getCurrentSeason();

        const row = await createJournalEntry(user.id, {
          question: q || "—",
          hexagram_number: hexNum,
          hexagram_name: hexName,
          answer_type: answerType,
          description: desc,
          response: responseText?.trim() ? responseText : null,
          drawing_style: "random",
          season,
        });

        queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
        queryClient.invalidateQueries({
          queryKey: ["journal-entry", row.id],
        });

        router.push({
          pathname: "/reflection/reflection-detail",
          params: { journalId: row.id },
        });
      } catch (e) {
        console.error(e);
        Alert.alert(
          "Could not save",
          e instanceof Error ? e.message : "Please try again.",
        );
      } finally {
        isPickLockedRef.current = false;
        setIsSaving(false);
      }
    },
    [user?.id, question, stopShuffle, router, queryClient],
  );

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{ flex: 1, paddingHorizontal: 20, paddingTop: 60 }}
    >
      {/* HEADER */}
      <View className="w-full flex-row items-center gap-1">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon name={ArrowLeftIcon} size={20} lightColor="white" />
        </Button>

        <Text variant="subtitle" lightColor="white">
          Choose your Card
        </Text>

        <View style={{ flex: 1 }} />

        <Button
          size="icon"
          variant="ghost"
          onPress={() => doShuffle(SHUFFLE_CONFIG.durationMs)}
          disabled={isShuffling || isSaving}
        >
          <Icon name={Shuffle} size={20} lightColor="white" />
        </Button>
      </View>

      {/* INFO */}
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <Text
          variant="title"
          lightColor="white"
          style={{ fontSize: 16, textAlign: "center", marginBottom: 4 }}
        >
          {`QUESTION: '${question?.trim() || ""}'`}
        </Text>

        <Text
          variant="body"
          lightColor="white"
          style={{ fontSize: 12, opacity: 0.8 }}
        >
          All hexagram available
        </Text>

        <Text
          variant="body"
          lightColor="white"
          style={{ fontSize: 14, opacity: 0.95 }}
        >
          {isSaving
            ? "Saving your reflection…"
            : isShuffling
              ? "Please wait — shuffling the cards..."
              : "Choose any card to reveal its hexagram"}
        </Text>
        {isSaving ? (
          <ActivityIndicator
            style={{ marginTop: 12 }}
            color="#fff"
            size="small"
          />
        ) : null}
      </View>

      {/* CARD AREA */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isShuffling && !isSaving}
        pointerEvents={isShuffling || isSaving ? "none" : "auto"}
        contentContainerStyle={{
          height: gridHeight,
          paddingBottom: Math.max(insets.bottom + 100, 160),
        }}
      >
        <View style={{ height: gridHeight }} pointerEvents="box-none">
          {shared.map((item, index) => (
            <CardCell
              key={index}
              item={item}
              index={index}
              disabled={isShuffling || isSaving}
              onPress={() => void handlePickCard(index)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
