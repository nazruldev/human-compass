import { useColor } from "@/hooks/useColor";
import { FONT_SIZE } from "@/theme/globals";
import React, { forwardRef } from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from "react-native";

/** Matches fonts loaded in `app/_layout.tsx` (`useFonts`). */
const POPPINS = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
  black: "Poppins_900Black",
} as const;

type TextVariant =
  | "body"
  | "title"
  | "subtitle"
  | "subtitle-semibold"
  | "caption"
  | "heading"
  | "caption-small"
  | "link";

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  lightColor?: string;
  darkColor?: string;
  children: React.ReactNode;
}

export const Text = forwardRef<RNText, TextProps>(
  (
    { variant = "body", lightColor, darkColor, style, children, ...props },
    ref,
  ) => {
    const textColor = useColor("text", { light: lightColor, dark: darkColor });
    const mutedColor = useColor("textMuted");

    const getTextStyle = (): TextStyle => {
      const baseStyle: TextStyle = {
        color: textColor,
      };

      switch (variant) {
        case "heading":
          return {
            ...baseStyle,
            fontFamily: POPPINS.bold,
            fontSize: 28,
            // Weight is in the font file name; extra fontWeight breaks many Android builds.
            fontWeight: "normal",
          };
        case "title":
          return {
            ...baseStyle,
            fontFamily: POPPINS.bold,
            fontSize: 24,
            fontWeight: "normal",
          };
        case "subtitle":
          return {
            ...baseStyle,
            fontFamily: POPPINS.semiBold,
            fontSize: 19,
            fontWeight: "normal",
          };
        case "subtitle-semibold":
          return {
            ...baseStyle,
            fontFamily: POPPINS.semiBold,
            fontSize: FONT_SIZE,
            fontWeight: "normal",
          };
        case "caption":
          return {
            ...baseStyle,
            fontFamily: POPPINS.regular,
            fontSize: FONT_SIZE,
            fontWeight: "normal",
            color: mutedColor,
          };
        case "caption-small":
          return {
            ...baseStyle,
            fontFamily: POPPINS.regular,
            fontSize: FONT_SIZE - 2,
            fontWeight: "normal",
            color: mutedColor,
          };
        case "link":
          return {
            ...baseStyle,
            fontFamily: POPPINS.medium,
            fontSize: FONT_SIZE,
            fontWeight: "normal",
            textDecorationLine: "underline",
          };
        default: // 'body'
          return {
            ...baseStyle,
            fontFamily: POPPINS.regular,
            fontSize: FONT_SIZE,
            fontWeight: "normal",
          };
      }
    };

    return (
      <RNText ref={ref} style={[getTextStyle(), style]} {...props}>
        {children}
      </RNText>
    );
  },
);

Text.displayName = "Text";
