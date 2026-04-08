import {
  DarkTheme,
  ThemeProvider as RNThemeProvider,
} from "@react-navigation/native";

import { Colors } from "@/theme/colors";

type Props = {
  children: React.ReactNode;
};

export const ThemeProvider = ({ children }: Props) => {
  const themes = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.primary,
      background: "transparent",
      card: "transparent",
      text: Colors.dark.text,
      border: Colors.dark.border,
      notification: Colors.dark.red,
    },
  };

  return <RNThemeProvider value={themes}>{children}</RNThemeProvider>;
};
