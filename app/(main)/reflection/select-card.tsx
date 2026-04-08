import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { useColor } from "@/hooks/useColor";
import { getHexagramByNumber } from "@/services/hexagramService";
import { createJournalEntry } from "@/services/journalService";
import {
  getCurrentSeason,
  getHexagramYesNo,
} from "@/services/reflectionService";
import { useUser } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import type { ImageSource } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, RefreshCw } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  type ListRenderItemInfo,
  Pressable,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = Math.floor(SCREEN_WIDTH / 5);
const CARD_WIDTH = Math.floor(ITEM_WIDTH * 1.55);
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.35);
const CARDS = Array.from({ length: 64 }, (_, i) => i + 1);
const CARD_BACK_SOURCE =
  require("@/assets/images/back-card.png") as ImageSource;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<number>);

function SelectCardScreen() {
  const router = useRouter();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ question?: string | string[] }>();
  const question = Array.isArray(params.question)
    ? params.question[0]
    : params.question;
  const [selected, setSelected] = useState<number[]>([]);
  const carouselData = React.useMemo(() => {
    const available = CARDS.filter((c) => !selected.includes(c));
    return [...available, ...available, ...available];
  }, [selected]);
  const initialIndex = carouselData.length / 3;
  const [centerIndex, setCenterIndex] = useState(initialIndex);
  const [flyingCard, setFlyingCard] = useState<{
    num: number;
    slotIndex: number;
  } | null>(null);
  const [centeredIndex, setCenteredIndex] = useState<number | null>(
    initialIndex,
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [holdingCardIndex, setHoldingCardIndex] = useState<number | null>(null);
  const hapticIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spinCancelledRef = useRef(false);
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (holdingCardIndex != null) {
      hapticIntervalRef.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 400);
    }
    return () => {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
        hapticIntervalRef.current = null;
      }
    };
  }, [holdingCardIndex]);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(initialIndex * ITEM_WIDTH);
  const carouselOpacity = useSharedValue(1);

  useAnimatedReaction(
    () => scrollX.value,
    (x) => {
      const nearestIdx = Math.round(x / ITEM_WIDTH);
      const dist = Math.abs(x - nearestIdx * ITEM_WIDTH);
      const progress = dist / ITEM_WIDTH;
      runOnJS(setCenteredIndex)(progress < 0.3 ? nearestIdx : -1);
    },
  );

  React.useEffect(() => {
    if (selected.length === 3) {
      carouselOpacity.value = withTiming(0, { duration: 500 });
    } else {
      carouselOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [selected.length, carouselOpacity]);

  React.useEffect(() => {
    if (carouselData.length > 0) {
      flatListRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
      setCenterIndex(initialIndex);
    }
  }, [selected, initialIndex, carouselData.length]);
  const seed = selected.reduce((a, b) => a + b, 0);
  const hexagram = selected.length === 3 ? (seed % 64) + 1 : 0;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0) {
        const center = viewableItems[Math.floor(viewableItems.length / 2)];
        if (center?.index != null) setCenterIndex(center.index);
      }
    },
    [],
  );

  const availableLen = carouselData.length / 3;
  const handleScrollBeginDrag = useCallback(() => {
    spinCancelledRef.current = true;
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }
    setIsSpinning(false);
  }, []);

  const handleScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.round(x / ITEM_WIDTH);
      const mid = availableLen;
      if (idx < Math.floor(availableLen / 2)) {
        const target = mid + idx;
        setCenterIndex(target);
        flatListRef.current?.scrollToIndex({
          index: target,
          animated: false,
        });
      } else if (idx >= 2 * availableLen) {
        const target = mid + (idx - 2 * availableLen);
        setCenterIndex(target);
        flatListRef.current?.scrollToIndex({
          index: target,
          animated: false,
        });
      } else {
        setCenterIndex(idx);
      }
    },
    [availableLen],
  );

  const handleSelectCard = useCallback(
    (num: number) => {
      if (selected.length >= 3 || selected.includes(num)) return;
      setSelected((prev) => [...prev, num]);
    },
    [selected],
  );

  const handleRemoveCard = useCallback((index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleChooseAgain = useCallback(() => {
    setSelected([]);
  }, []);

  const handleShuffle = useCallback(() => {
    if (selected.length >= 3 || isSpinning) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    spinCancelledRef.current = false;
    setIsSpinning(true);
    const spinOffset = 24 + Math.floor(Math.random() * 30);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const targetIdx = Math.max(
      0,
      Math.min(carouselData.length - 1, centerIndex + spinOffset * direction),
    );
    const steps = Math.abs(targetIdx - centerIndex);
    const minDuration = 8;
    const maxDuration = 180;
    let current = centerIndex;
    let stepIndex = 0;
    const spin = () => {
      if (spinCancelledRef.current) return;
      current += direction;
      stepIndex += 1;
      flatListRef.current?.scrollToIndex({
        index: current,
        animated: true,
      });
      if (
        (direction > 0 && current < targetIdx) ||
        (direction < 0 && current > targetIdx)
      ) {
        const t = stepIndex / steps;
        const smooth = t * t * (3 - 2 * t);
        const duration = Math.round(
          minDuration + (maxDuration - minDuration) * smooth,
        );
        spinTimeoutRef.current = setTimeout(spin, Math.max(duration, 8));
      } else {
        spinTimeoutRef.current = setTimeout(
          () => setIsSpinning(false),
          maxDuration + 120,
        );
      }
    };
    if (steps > 0) spin();
    else setIsSpinning(false);
  }, [centerIndex, selected.length, isSpinning, carouselData.length]);

  const carouselAnimatedStyle = useAnimatedStyle(() => ({
    opacity: carouselOpacity.value,
  }));

  const handleReveal = useCallback(async () => {
    if (hexagram <= 0) return;
    if (!user?.id) {
      Alert.alert(
        "Sign in required",
        "Please sign in to save your reflection to the journal.",
      );
      return;
    }
    const q = question?.trim() || "";
    setIsSaving(true);
    try {
      const [yesNo, hexRow] = await Promise.all([
        getHexagramYesNo({ hexagramNumber: hexagram }),
        getHexagramByNumber(hexagram),
      ]);
      const hexName =
        yesNo?.hexagram_name ?? hexRow?.name ?? `Hexagram ${hexagram}`;
      const answerType = yesNo?.answer_type ?? "Guidance";
      const desc = yesNo?.description ?? hexRow?.description ?? null;
      const responseText = yesNo?.response ?? yesNo?.description ?? desc ?? "";
      const season =
        (yesNo?.season as string | undefined) ?? getCurrentSeason();

      const row = await createJournalEntry(user.id, {
        question: q || "—",
        hexagram_number: hexagram,
        hexagram_name: hexName,
        answer_type: answerType,
        description: desc,
        response: responseText?.trim() ? responseText : null,
        drawing_style: "browse",
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
      setIsSaving(false);
    }
  }, [hexagram, question, router, queryClient, user?.id]);

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 pt-16">
      <View className="flex-row items-center gap-2 px-5 pb-4">
        <Button size="icon" variant="ghost" onPress={() => router.back()}>
          <Icon name={ArrowLeft} size={24} lightColor="white" />
        </Button>
        <Text variant="title" lightColor="white" style={{ fontSize: 20 }}>
          Choose Three Cards
        </Text>
      </View>

      <View className="px-5 pb-4">
        <Text
          variant="body"
          lightColor="white"
          style={{ fontSize: 14, opacity: 0.9, textAlign: "center" }}
        >
          An Annual Forecast offers insights into the year ahead based on
          astrological patterns.
        </Text>
      </View>

      <View style={{ flex: 1, minHeight: 260, position: "relative" }}>
        <Animated.View
          style={[
            {
              flex: 1,
              minHeight: 260,
              justifyContent: "center",
            },
            carouselAnimatedStyle,
          ]}
          pointerEvents={selected.length === 3 ? "none" : "auto"}
        >
          {selected.length < 3 && !isSpinning && (
            <Pressable
              onPress={handleShuffle}
              style={{
                position: "absolute",
                top: 8,
                left: SCREEN_WIDTH / 2 - 24,
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "rgba(0,0,0,0.5)",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
              }}
            >
              <Icon name={RefreshCw} size={24} lightColor="white" />
            </Pressable>
          )}
          <AnimatedFlatList
            ref={flatListRef}
            data={carouselData}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal"
            contentContainerStyle={{
              paddingHorizontal: (SCREEN_WIDTH - ITEM_WIDTH) / 2,
              paddingVertical: 24,
            }}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: ITEM_WIDTH,
              offset: ITEM_WIDTH * index,
              index,
            })}
            onScroll={scrollHandler}
            scrollEventThrottle={8}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEnd}
            onMomentumScrollEnd={handleScrollEnd}
            onScrollToIndexFailed={(info) => {
              setTimeout(
                () =>
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: false,
                  }),
                100,
              );
            }}
            keyExtractor={(_, i) => `card-${i}`}
            renderItem={({ item, index }: ListRenderItemInfo<number>) => (
              <CarouselCard
                num={item}
                index={index}
                centerIndex={centerIndex}
                centeredIndex={centeredIndex}
                canSelect={selected.length < 3}
                scrollX={scrollX}
                isHolding={holdingCardIndex === index}
                onPressIn={() => {
                  if (centeredIndex === index && selected.length < 3)
                    setHoldingCardIndex(index);
                }}
                onPressOut={() => setHoldingCardIndex(null)}
                onLongPress={() => {
                  if (selected.length >= 3 || selected.includes(item)) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  const slotIndex = selected.length;
                  handleSelectCard(item);
                  setFlyingCard({ num: item, slotIndex });
                  setTimeout(() => {
                    spinCancelledRef.current = false;
                    setIsSpinning(true);
                    const spinOffset = 24 + Math.floor(Math.random() * 30);
                    const direction = Math.random() > 0.5 ? 1 : -1;
                    const targetIdx = Math.max(
                      0,
                      Math.min(
                        carouselData.length - 1,
                        centerIndex + spinOffset * direction,
                      ),
                    );
                    const steps = Math.abs(targetIdx - centerIndex);
                    const minDuration = 8;
                    const maxDuration = 180;
                    let current = centerIndex;
                    let stepIndex = 0;
                    const spin = () => {
                      if (spinCancelledRef.current) return;
                      current += direction;
                      stepIndex += 1;
                      flatListRef.current?.scrollToIndex({
                        index: current,
                        animated: true,
                      });
                      if (
                        (direction > 0 && current < targetIdx) ||
                        (direction < 0 && current > targetIdx)
                      ) {
                        const t = stepIndex / steps;
                        const smooth = t * t * (3 - 2 * t);
                        const duration = Math.round(
                          minDuration + (maxDuration - minDuration) * smooth,
                        );
                        spinTimeoutRef.current = setTimeout(
                          spin,
                          Math.max(duration, 8),
                        );
                      } else {
                        spinTimeoutRef.current = setTimeout(
                          () => setIsSpinning(false),
                          maxDuration + 120,
                        );
                      }
                    };
                    if (steps > 0) spin();
                    else setIsSpinning(false);
                  }, 200);
                  setHoldingCardIndex(null);
                }}
                disabled={selected.length >= 3 || selected.includes(item)}
              />
            )}
          />
          {flyingCard && (
            <FlyingCard
              num={flyingCard.num}
              slotIndex={flyingCard.slotIndex}
              onComplete={() => setFlyingCard(null)}
            />
          )}
          <View
            style={{
              position: "absolute",
              bottom: 24,
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            {isSpinning ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <ActivityIndicator size="small" color="white" />
                <Text
                  variant="caption"
                  lightColor="white"
                  style={{ fontSize: 13 }}
                >
                  Shuffling...
                </Text>
              </View>
            ) : (
              selected.length < 3 && (
                <Text
                  variant="caption"
                  lightColor="white"
                  style={{ opacity: 0.7, fontSize: 13 }}
                >
                  Swipe to browse • Hold center card 1s to select
                </Text>
              )
            )}
          </View>
        </Animated.View>

        {selected.length === 3 && (
          <Animated.View
            entering={FadeIn.delay(400).duration(400)}
            exiting={FadeOut}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Button
              onPress={handleReveal}
              disabled={isSaving}
              style={{ minWidth: 200 }}
            >
              {isSaving ? <ActivityIndicator color="#fff" /> : "Reveal Result"}
            </Button>
            <Button
              variant="outline"
              onPress={handleChooseAgain}
              style={{ minWidth: 200 }}
            >
              Choose Again
            </Button>
          </Animated.View>
        )}
      </View>

      <View
        className="px-5 pb-8 pt-4"
        style={{
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.1)",
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <Text
          variant="subtitle"
          lightColor="white"
          style={{ marginBottom: 12, fontSize: 14 }}
        >
          Selected ({selected.length}/3)
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginBottom: 20,
            minHeight: CARD_HEIGHT * 0.5,
          }}
        >
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                minHeight: 100,
                borderRadius: 12,
                backgroundColor: "rgba(255,255,255,0.08)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.15)",
                borderStyle: "dashed",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selected[i] !== undefined ? (
                <SelectedCardSlot
                  number={selected[i]}
                  onRemove={() => handleRemoveCard(i)}
                />
              ) : (
                <Text
                  variant="caption"
                  lightColor="white"
                  style={{ opacity: 0.5, fontSize: 12 }}
                >
                  —
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const SLOT_OFFSET_X = [-SCREEN_WIDTH / 3, 0, SCREEN_WIDTH / 3];

function FlyingCard({
  num,
  slotIndex,
  onComplete,
}: {
  num: number;
  slotIndex: number;
  onComplete: () => void;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    const targetX = SLOT_OFFSET_X[slotIndex] ?? 0;
    translateX.value = withTiming(targetX, {
      duration: 450,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    translateY.value = withTiming(
      260,
      { duration: 450, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
      () => {
        opacity.value = withTiming(0, { duration: 80 }, () => {
          runOnJS(onComplete)();
        });
      },
    );
    scale.value = withTiming(0.32, {
      duration: 450,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values + onComplete are stable
  }, [num, slotIndex, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: SCREEN_WIDTH / 2 - CARD_WIDTH / 2,
          top: 160,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          overflow: "hidden",
          borderRadius: 14,
          backgroundColor: "#1a1a1a",
          zIndex: 100,
        },
        animatedStyle,
      ]}
    >
      <Image
        source={CARD_BACK_SOURCE}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        style={{ borderRadius: 12 }}
        contentFit="cover"
      />
    </Animated.View>
  );
}

function CarouselCard({
  num,
  index,
  centerIndex,
  centeredIndex,
  canSelect,
  scrollX,
  isHolding,
  onPressIn,
  onPressOut,
  onLongPress,
  disabled,
}: {
  num: number;
  index: number;
  centerIndex: number;
  centeredIndex: number | null;
  canSelect: boolean;
  scrollX: { value: number };
  isHolding: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  onLongPress: () => void;
  disabled: boolean;
}) {
  const isTappable = centeredIndex === index && canSelect;
  const primaryColor = useColor("primary");
  const holdScale = useSharedValue(1);

  React.useEffect(() => {
    if (isHolding) {
      cancelAnimation(holdScale);
      holdScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 250 }),
          withTiming(1, { duration: 250 }),
        ),
        -1,
      );
    } else {
      cancelAnimation(holdScale);
      holdScale.value = withTiming(1, { duration: 150 });
    }
  }, [isHolding, holdScale]);

  const cellZIndexStyle = useAnimatedStyle(() => {
    const dist = Math.abs(scrollX.value - index * ITEM_WIDTH);
    const progress = Math.min(dist / ITEM_WIDTH, 2);
    const isCenterCard = progress < 0.3;
    const zIndex = isCenterCard
      ? 999
      : Math.max(1, Math.round(12 - progress * 5));
    return { zIndex };
  });

  const animatedStyle = useAnimatedStyle(() => {
    const dist = Math.abs(scrollX.value - index * ITEM_WIDTH);
    const progress = Math.min(dist / ITEM_WIDTH, 2);
    const baseScale = 1.3 - progress * 0.38;
    const scale = baseScale * holdScale.value;
    const translateY = progress * 12;
    const isCenterCard = progress < 0.3;
    return {
      transform: [{ scale }, { translateY }],
      borderWidth: isCenterCard ? 2 : 0,
      borderColor: isCenterCard ? primaryColor : "transparent",
      elevation: isCenterCard ? 16 : 4,
    };
  }, [primaryColor]);

  return (
    <Animated.View
      style={[
        { width: ITEM_WIDTH, alignItems: "center", justifyContent: "center" },
        cellZIndexStyle,
      ]}
    >
      <Pressable
        onPressIn={isTappable ? onPressIn : undefined}
        onPressOut={onPressOut}
        onLongPress={isTappable ? onLongPress : undefined}
        delayLongPress={1000}
        disabled={!isTappable || disabled}
        pointerEvents={isTappable ? "auto" : "none"}
        style={{
          width: ITEM_WIDTH,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={[
            {
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              overflow: "hidden",
              backgroundColor: "#1a1a1a",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              borderRadius: 14,
            },
            animatedStyle,
          ]}
        >
          <Image
            source={CARD_BACK_SOURCE}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            style={{ borderRadius: 12 }}
            contentFit="cover"
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function SelectedCardSlot({
  number,
  onRemove,
}: {
  number: number;
  onRemove: () => void;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const translateY = useSharedValue(-60);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSpring(1, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Reanimated shared values are stable
  }, [number]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Pressable onPress={onRemove} style={{ flex: 1, width: "100%" }}>
      <Animated.View
        style={[
          animatedStyle,
          {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Image
          source={CARD_BACK_SOURCE}
          width={60}
          height={84}
          style={{ borderRadius: 8 }}
          contentFit="fill"
        />
      </Animated.View>
    </Pressable>
  );
}

export default SelectCardScreen;
