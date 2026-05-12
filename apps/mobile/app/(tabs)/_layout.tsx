import { Tabs } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6B9C89",
        tabBarInactiveTintColor: isDark ? "#9CA3AF" : "#6B7280",
        tabBarStyle: {
          backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
          borderTopColor: isDark ? "#374151" : "#E5E7EB",
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        headerStyle: {
          backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
        },
        headerTintColor: isDark ? "#FFFFFF" : "#1A1A1A",
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Weather",
          headerTitle: "MoodCast",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "partly-sunny" : "partly-sunny-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="forecast"
        options={{
          title: "Forecast",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: "Activities",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "map" : "map-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
