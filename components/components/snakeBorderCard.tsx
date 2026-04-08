import React from "react";
import { LayoutChangeEvent, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import Svg, { Rect } from "react-native-svg";
import { useColor } from "@/hooks/useColor";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export function SnakeBorderCard({ children }: { children: React.ReactNode }) {
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const primaryColor = useColor("primary");
  const radius = 10;
  const stroke = 2;
  const segment = 56; // panjang "ular"

  const rectW = Math.max(1, size.w - stroke);
  const rectH = Math.max(1, size.h - stroke);
  const rectR = Math.max(0, radius - stroke / 2);
  const perimeter =
    size.w > 0 && size.h > 0
      ? 2 * (rectW + rectH - 2 * rectR) + 2 * Math.PI * rectR
      : 1;
  const dashGap = Math.max(1, perimeter - segment);

  const dashOffset = useSharedValue(0);

  React.useEffect(() => {
    if (!size.w || !size.h) return;
    dashOffset.value = 0;
    dashOffset.value = withRepeat(
      withTiming(-perimeter, {
        duration: 2800,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [dashOffset, perimeter, size.w, size.h]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  return (
    <View
      onLayout={onLayout}
      style={{
        backgroundColor: "rgba(0,0,0,0.25)",
        padding: 20,
        borderRadius: radius,
        marginBottom: 24,
        overflow: "hidden",
      }}
      className="pb-5"
    >
      {/* subtle base border */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.18)",
        }}
      />

      {/* animated snake border */}
      {size.w > 0 && size.h > 0 ? (
        <Svg
          pointerEvents="none"
          width={size.w}
          height={size.h}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <AnimatedRect
            x={stroke / 2}
            y={stroke / 2}
            width={rectW}
            height={rectH}
            rx={rectR}
            ry={rectR}
            fill="none"
            stroke={primaryColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${segment} ${dashGap}`}
            animatedProps={animatedProps}
          />
        </Svg>
      ) : null}

      {children}
    </View>
  );
}
