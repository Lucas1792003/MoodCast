import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { useLocation } from "@/context/LocationContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { locationName, refreshLocation, isLoading } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleRefreshLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await refreshLocation();
    router.back();
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      edges={["bottom"]}
    >
      <View className="flex-1 p-4">
        {/* Current Location */}
        <View
          className={`rounded-2xl p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            className={`mb-2 text-sm font-semibold uppercase tracking-wide ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Current Location
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="location" size={20} color="#6B9C89" />
              <Text
                className={`ml-2 text-lg ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {locationName || "Unknown"}
              </Text>
            </View>
            <Pressable
              onPress={handleRefreshLocation}
              disabled={isLoading}
              className="rounded-full bg-primary/10 p-2"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#6B9C89" />
              ) : (
                <Ionicons name="refresh" size={20} color="#6B9C89" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Search Location */}
        <View
          className={`mt-4 rounded-2xl p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            className={`mb-2 text-sm font-semibold uppercase tracking-wide ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Search Location
          </Text>
          <View
            className={`flex-row items-center rounded-xl px-3 py-2 ${
              isDark ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <Ionicons
              name="search"
              size={18}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
            <TextInput
              className={`ml-2 flex-1 text-base ${
                isDark ? "text-white" : "text-gray-900"
              }`}
              placeholder="Search for a city..."
              placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={() => {
                // TODO: Implement city search
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }}
            />
          </View>
          <Text
            className={`mt-2 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
          >
            City search coming soon
          </Text>
        </View>

        {/* Use Current Location Button */}
        <Pressable
          onPress={handleRefreshLocation}
          className="mt-6 flex-row items-center justify-center rounded-full bg-primary py-3"
        >
          <Ionicons name="navigate" size={20} color="#FFFFFF" />
          <Text className="ml-2 font-semibold text-white">
            Use Current Location
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
