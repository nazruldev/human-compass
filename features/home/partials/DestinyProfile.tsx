import { ANIMAL_SIGNS, getAnimalImage } from "@/assets/images/animal";
import { ELEMENTS, getElementImage } from "@/assets/images/element";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useColor } from "@/hooks/useColor";
import { getHexagramById } from "@/utils/hexagrams";

import { Moon, Sun } from "lucide-react-native";
import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import Svg, { Line } from "react-native-svg";

import { useRouter } from "expo-router";

import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedLine = Animated.createAnimatedComponent(Line);

const SIZE = 320;
const RADIUS = 95;
const CENTER_AVATAR_SIZE = 100;
const AVATAR_SIZE = 64;
const LABEL_BLOCK_HEIGHT = 36; // name + label + margins - offset so avatar center aligns with line endpoint
const FONT_PoppinsRegular = "Poppins_400Regular";
const FONT_PoppinsSemiBold = "Poppins_600SemiBold";

function HexagramSymbol({
  symbol,
  size = 48,
  color = "white",
}: {
  symbol: readonly number[];
  size?: number;
  color?: string;
}) {
  const lineH = Math.max(2, size / 10);
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
            marginVertical: 1,
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

/* ----------------------------- Destiny Line ----------------------------- */

function DestinyLine({
  centerX,
  centerY,
  targetX,
  targetY,
  delay,
  color,
}: any) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    x.value = withDelay(
      delay,
      withSpring(targetX, { damping: 14, stiffness: 100 }),
    );
    y.value = withDelay(
      delay,
      withSpring(targetY, { damping: 14, stiffness: 100 }),
    );
  }, [delay, targetX, targetY]);

  const animatedProps = useAnimatedProps(() => ({
    x2: centerX + x.value,
    y2: centerY + y.value,
  }));

  return (
    <AnimatedLine
      x1={centerX}
      y1={centerY}
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      animatedProps={animatedProps}
    />
  );
}

/* ----------------------------- Destiny Node ----------------------------- */

function DestinyNode({ item, centerX, centerY, delay, onPress }: any) {
  const primary = useColor("primary");

  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    x.value = withDelay(
      delay,
      withSpring(item.x, { damping: 14, stiffness: 100 }),
    );
    y.value = withDelay(
      delay,
      withSpring(item.y, { damping: 14, stiffness: 100 }),
    );
    opacity.value = withDelay(delay + 400, withTiming(1, { duration: 350 }));
  }, [delay, item.x, item.y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const isBottom = item.y > 0;
  const textBlock = (
    <>
      {item.name && !isBottom ? (
        <Animated.Text
          style={[
            labelStyle,
            {
              color: "rgba(255,255,255,0.8)",
              fontSize: 10,
              fontFamily: FONT_PoppinsRegular,
              marginBottom: 2,
              lineHeight: 8,
              textAlign: "center",
              width: "100%",
            },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Animated.Text>
      ) : null}
      <Animated.Text
        style={[
          labelStyle,
          {
            color: "white",
            fontSize: 12,
            fontFamily: FONT_PoppinsSemiBold,
            fontWeight: "normal",
            marginBottom: isBottom ? 2 : 6,
            marginTop: isBottom ? 6 : 0,
            textAlign: "center",
            width: "100%",
          },
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Animated.Text>
      {item.name && isBottom ? (
        <Animated.Text
          style={[
            labelStyle,
            {
              color: "rgba(255,255,255,0.8)",
              fontSize: 10,
              fontFamily: FONT_PoppinsRegular,
              textAlign: "center",
              lineHeight: 8,
              width: "100%",
            },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Animated.Text>
      ) : null}
    </>
  );

  const nodeContent = (
    <>
      {!isBottom && textBlock}

      {item.icon ? (
        <View
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: AVATAR_SIZE / 2,
            borderWidth: 3,
            borderColor: primary,
            backgroundColor: "rgba(0,0,0,0.9)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={item.icon} size={28} color={primary} />
        </View>
      ) : item.hexagramId ? (
        <View
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: AVATAR_SIZE / 2,
            borderWidth: 3,
            borderColor: primary,
            backgroundColor: "rgba(0,0,0,0.9)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HexagramSymbol
            symbol={getHexagramById(item.hexagramId).symbol}
            size={AVATAR_SIZE * 0.8}
            color={primary}
          />
        </View>
      ) : (
        <Avatar
          size={AVATAR_SIZE}
          style={{
            borderWidth: 3,
            borderColor: primary,
            ...(item.name === "Element"
              ? { backgroundColor: "rgba(0,0,0,0.9)" }
              : {}),
          }}
        >
          <AvatarImage source={item.imageSource} />
          <AvatarFallback>{item.fallback}</AvatarFallback>
        </Avatar>
      )}

      {isBottom && textBlock}
    </>
  );

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: centerX - AVATAR_SIZE / 2,
          top: centerY - AVATAR_SIZE / 2 - (isBottom ? 0 : LABEL_BLOCK_HEIGHT),
          width: AVATAR_SIZE,
          alignItems: "center",
          zIndex: 10,
        },
        style,
      ]}
    >
      {onPress ? (
        <Pressable onPress={onPress} hitSlop={8}>
          {nodeContent}
        </Pressable>
      ) : (
        nodeContent
      )}
    </Animated.View>
  );
}

const POLARITIES = ["Yang", "Yin"] as const;
const POLARITY_ICONS = [Sun, Moon] as const;

function getAnimalIndexFromUser(user: any): number {
  const ast = user?.unsafeMetadata?.astrology as
    | { animalSign?: string }
    | undefined;
  const sign = (ast?.animalSign ?? user?.unsafeMetadata?.animal_sign) as
    | string
    | undefined;
  if (!sign) return 0;
  const i = ANIMAL_SIGNS.indexOf(sign as (typeof ANIMAL_SIGNS)[number]);
  return i >= 0 ? i : 0;
}

function getElementIndexFromUser(user: any): number {
  const ast = user?.unsafeMetadata?.astrology as
    | { element?: string }
    | undefined;
  const el = (ast?.element ?? user?.unsafeMetadata?.element) as
    | string
    | undefined;
  if (!el) return 0;
  const i = ELEMENTS.indexOf(el as (typeof ELEMENTS)[number]);
  return i >= 0 ? i : 0;
}

function getPolarityIndexFromUser(user: any): number {
  const ast = user?.unsafeMetadata?.astrology as
    | { polarity?: string }
    | undefined;
  const p = (ast?.polarity ?? user?.unsafeMetadata?.polarity) as
    | string
    | undefined;
  if (!p) return 0;
  const i = POLARITIES.indexOf(p as (typeof POLARITIES)[number]);
  return i >= 0 ? i : 0;
}

function getHexagramIdFromUser(user: any): number {
  const ast = user?.unsafeMetadata?.astrology as
    | { hexagramId?: number }
    | undefined;
  const id = (ast?.hexagramId ?? user?.unsafeMetadata?.hexagram_id) as
    | number
    | undefined;
  if (id == null || id < 1 || id > 64) return 1;
  return id;
}

/* ----------------------------- Main Layout ----------------------------- */

export default function DestinyLayout({ user }: any) {
  const router = useRouter();
  const primary = useColor("primary");

  const center = SIZE / 2;
  const animalIndex = getAnimalIndexFromUser(user);
  const elementIndex = getElementIndexFromUser(user);
  const polarityIndex = getPolarityIndexFromUser(user);
  const hexagramId = getHexagramIdFromUser(user);

  const vertices = [
    { x: -RADIUS, y: -RADIUS },
    { x: RADIUS, y: -RADIUS },
    { x: RADIUS, y: RADIUS },
    { x: -RADIUS, y: RADIUS },
  ];

  const items = [
    {
      name: "Animal Sign",
      label: ANIMAL_SIGNS[animalIndex] ?? "Animal Sign",
      x: vertices[0].x,
      y: vertices[0].y,
      imageSource: getAnimalImage(animalIndex),
      fallback: "A",
    },
    {
      name: "Polarity",
      label: POLARITIES[polarityIndex] ?? "Yang",
      icon: POLARITY_ICONS[polarityIndex] ?? Sun,
      x: vertices[1].x,
      y: vertices[1].y,
      fallback: "P",
    },
    {
      name: "Element",
      label: ELEMENTS[elementIndex] ?? "Element",
      x: vertices[3].x,
      y: vertices[3].y,
      imageSource: getElementImage(elementIndex),
      fallback: "E",
    },
    {
      name: "Hexagram",
      label: getHexagramById(hexagramId).name,
      hexagramId,
      x: vertices[2].x,
      y: vertices[2].y,
      fallback: "H",
      onPressPath: "/home/ProfileScreen",
    },
  ];

  return (
    <View style={{ width: SIZE, height: SIZE }}>
      {/* Diagonal lines - di belakang */}
      <Svg
        style={{
          position: "absolute",
          width: SIZE,
          height: SIZE,
          zIndex: 0,
        }}
      >
        {items.map((item, i) => (
          <DestinyLine
            key={i}
            centerX={center}
            centerY={center}
            targetX={item.x}
            targetY={item.y}
            delay={i * 120}
            color={primary}
          />
        ))}
      </Svg>

      {/* Center avatar */}
      <Pressable
        onPress={() => router.replace("/(main)/profile")}
        style={{
          position: "absolute",
          left: center - CENTER_AVATAR_SIZE / 2,
          top: center - CENTER_AVATAR_SIZE / 2,
          zIndex: 10,
        }}
      >
        <Avatar
          size={CENTER_AVATAR_SIZE}
          style={{
            borderWidth: 3,
            borderColor: primary,
          }}
        >
          <AvatarImage source={{ uri: user?.imageUrl }} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </Pressable>

      {/* Nodes */}
      {items.map((item, i) => (
        <DestinyNode
          key={i}
          item={item}
          centerX={center}
          centerY={center}
          delay={i * 120}
          onPress={
            item.onPressPath
              ? () =>
                  router.push({
                    pathname: item.onPressPath as any,
                    params: {
                      node: item.name,
                      value: item.label,
                      ...(item.hexagramId
                        ? { hexagramId: String(item.hexagramId) }
                        : {}),
                    },
                  })
              : null
          }
        />
      ))}
    </View>
  );
}
