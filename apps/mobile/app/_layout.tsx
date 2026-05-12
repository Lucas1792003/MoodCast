import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { WeatherProvider } from "@/context/WeatherContext";
import { LocationProvider } from "@/context/LocationContext";

import "../global.css";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom light theme with MoodCast colors
const MoodCastLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#6B9C89",
    background: "#FAFBF9",
    card: "#FFFFFF",
    text: "#1A1A1A",
    border: "#E5E7EB",
  },
};

const MoodCastDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#6B9C89",
    background: "#0F0F0F",
    card: "#1A1A1A",
    text: "#FFFFFF",
    border: "#374151",
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider
        value={colorScheme === "dark" ? MoodCastDarkTheme : MoodCastLightTheme}
      >
        <LocationProvider>
          <WeatherProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="mood-select"
                options={{
                  presentation: "modal",
                  title: "Select Mood",
                }}
              />
              <Stack.Screen
                name="settings"
                options={{
                  presentation: "card",
                  title: "Settings",
                }}
              />
            </Stack>
          </WeatherProvider>
        </LocationProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
