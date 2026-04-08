const lightColors = {
  // Base colors
  background: "#FFFFFF",
  foreground: "#000000",

  // Card colors
  card: "#F2F2F7",
  cardForeground: "#000000",

  // Popover colors
  popover: "#F2F2F7",
  popoverForeground: "#000000",

  // Primary colors
  primary: "#F77E5B",
  primaryForeground: "#000000",

  // Secondary colors
  secondary: "#FFD5C8",
  secondaryForeground: "#000000",

  // Muted colors
  muted: "#78788033",
  mutedForeground: "#71717a",

  // Accent colors
  accent: "#F2F2F7",
  accentForeground: "#18181b",

  // Destructive colors
  destructive: "#ef4444",
  destructiveForeground: "#FFFFFF",

  // Border and input
  border: "#C6C6C8",
  input: "#e4e4e7",
  ring: "#a1a1aa",

  // Text colors
  text: "#FFFFFF",
  textMuted: "#71717a",

  // Legacy support for existing components
  tint: "#18181b",
  icon: "#71717a",
  tabIconDefault: "#71717a",
  tabIconSelected: "#18181b",
  tabBarInactive: "rgba(255,255,255,0.75)",

  // Default buttons, links, Send button, selected tabs
  blue: "#007AFF",

  // Success states, FaceTime buttons, completed tasks
  green: "#34C759",

  // Delete buttons, error states, critical alerts
  red: "#FF3B30",

  // VoiceOver highlights, warning states
  orange: "#FF9500",

  // Notes app accent, Reminders highlights
  yellow: "#FFCC00",

  // Pink accent color for various UI elements
  pink: "#FF2D92",

  // Purple accent for creative apps and features
  purple: "#AF52DE",

  // Teal accent for communication features
  teal: "#5AC8FA",

  // Indigo accent for system features
  indigo: "#5856D6",
};

const darkColors = {
  // Base colors
  background: "#FFFFFF",
  foreground: "#000000",

  // Card colors
  card: "#F2F2F7",
  cardForeground: "#000000",

  // Popover colors
  popover: "#F2F2F7",
  popoverForeground: "#000000",

  // Primary colors
  primary: "#F77E5B",
  primaryForeground: "#000000",

  // Secondary colors
  secondary: "#FFD5C8",
  secondaryForeground: "#000000",

  // Muted colors
  muted: "#78788033",
  mutedForeground: "#71717a",

  // Accent colors
  accent: "#F2F2F7",
  accentForeground: "#18181b",

  // Destructive colors
  destructive: "#ef4444",
  destructiveForeground: "#FFFFFF",

  // Border and input
  border: "#C6C6C8",
  input: "#e4e4e7",
  ring: "#a1a1aa",

  // Text colors
  text: "#FFFFFF",
  textMuted: "#71717a",

  // Legacy support for existing components
  tint: "#18181b",
  icon: "#71717a",
  tabIconDefault: "#71717a",
  tabIconSelected: "#18181b",
  tabBarInactive: "rgba(255,255,255,0.75)",

  // Default buttons, links, Send button, selected tabs
  blue: "#007AFF",

  // Success states, FaceTime buttons, completed tasks
  green: "#34C759",

  // Delete buttons, error states, critical alerts
  red: "#FF3B30",

  // VoiceOver highlights, warning states
  orange: "#FF9500",

  // Notes app accent, Reminders highlights
  yellow: "#FFCC00",

  // Pink accent color for various UI elements
  pink: "#FF2D92",

  // Purple accent for creative apps and features
  purple: "#AF52DE",

  // Teal accent for communication features
  teal: "#5AC8FA",

  // Indigo accent for system features
  indigo: "#5856D6",
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
};

// Export individual color schemes for easier access
export { darkColors, lightColors };

// Utility type for color keys
export type ColorKeys = keyof typeof lightColors;
