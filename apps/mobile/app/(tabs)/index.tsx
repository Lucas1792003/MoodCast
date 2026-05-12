import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";

import { useWeather } from "@/context/WeatherContext";
import { useLocation } from "@/context/LocationContext";
import { WeatherCard } from "@/components/WeatherCard";
import { MoodCard } from "@/components/MoodCard";
import { WeatherDetailsGrid } from "@/components/WeatherDetailsGrid";
import { HourlyForecast } from "@/components/HourlyForecast";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function WeatherScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { weather, isLoading, error, selectedMood, refreshWeather } = useWeather();
  const { locationName, refreshLocation, permissionStatus } = useLocation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLocation();
    await refreshWeather();
    setRefreshing(false);
  }, [refreshLocation, refreshWeather]);

  if (permissionStatus !== "granted") {
    return (
      <SafeAreaView
        className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
        edges={["top"]}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="location-outline"
            size={64}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
          <Text
            className={`mt-4 text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Location Access Required
          </Text>
          <Text
            className={`mt-2 text-center ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            MoodCast needs your location to show weather and activity
            suggestions for your area.
          </Text>
          <Pressable
            onPress={refreshLocation}
            className="mt-6 rounded-full bg-primary px-6 py-3"
          >
            <Text className="font-semibold text-white">Enable Location</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !weather) {
    return (
      <SafeAreaView
        className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
        edges={["top"]}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons
            name="cloud-offline-outline"
            size={64}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
          <Text
            className={`mt-4 text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Unable to Load Weather
          </Text>
          <Text
            className={`mt-2 text-center ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {error}
          </Text>
          <Pressable
            onPress={onRefresh}
            className="mt-6 rounded-full bg-primary px-6 py-3"
          >
            <Text className="font-semibold text-white">Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      edges={["top"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6B9C89"
          />
        }
      >
        {/* Location Header */}
        <View className="px-4 py-2">
          <Pressable
            onPress={() => router.push("/settings")}
            className="flex-row items-center"
          >
            <Ionicons
              name="location"
              size={16}
              color="#6B9C89"
            />
            <Text
              className={`ml-1 text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {locationName || "Loading..."}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
          </Pressable>
        </View>

        {/* Main Weather Card */}
        <View className="px-4">
          <WeatherCard weather={weather} isLoading={isLoading} />
        </View>

        {/* Mood Card */}
        <View className="mt-4 px-4">
          <MoodCard
            selectedMood={selectedMood}
            onPress={() => router.push("/mood-select")}
          />
        </View>

        {/* Hourly Forecast */}
        {weather?.hourlyForecast && (
          <View className="mt-4">
            <HourlyForecast forecast={weather.hourlyForecast} />
          </View>
        )}

        {/* Weather Details Grid */}
        <View className="mt-4 px-4">
          <WeatherDetailsGrid weather={weather} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
