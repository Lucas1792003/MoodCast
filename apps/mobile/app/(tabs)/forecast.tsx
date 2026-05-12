import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";

import { useWeather } from "@/context/WeatherContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { weatherCodeToLabel } from "@moodcast/shared";

function getWeatherIcon(code: number): keyof typeof Ionicons.glyphMap {
  if (code === 0) return "sunny";
  if (code <= 3) return "partly-sunny";
  if (code <= 48) return "cloudy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "snow";
  if (code <= 82) return "rainy";
  if (code <= 99) return "thunderstorm";
  return "cloud";
}

function formatDay(dateStr: string, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";

  const date = new Date(dateStr);
  return date.toLocaleDateString([], { weekday: "short" });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ForecastScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { weather, refreshWeather, isLoading } = useWeather();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshWeather();
    setRefreshing(false);
  }, [refreshWeather]);

  const dailyForecast = weather?.dailyForecast || [];

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      edges={["top"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6B9C89"
          />
        }
      >
        <Text
          className={`mb-4 text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          7-Day Forecast
        </Text>

        {dailyForecast.length === 0 ? (
          <View
            className={`items-center justify-center rounded-2xl p-8 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <Ionicons
              name="calendar-outline"
              size={48}
              color={isDark ? "#6B7280" : "#9CA3AF"}
            />
            <Text
              className={`mt-2 text-center ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Forecast data not available
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {dailyForecast.map((day, index) => (
              <View
                key={index}
                className={`flex-row items-center justify-between rounded-2xl p-4 ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                {/* Day name */}
                <View className="w-20">
                  <Text
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatDay(day.date, index)}
                  </Text>
                  <Text
                    className={`text-xs ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {formatDate(day.date)}
                  </Text>
                </View>

                {/* Weather icon and condition */}
                <View className="flex-1 flex-row items-center justify-center">
                  <Ionicons
                    name={getWeatherIcon(day.weatherCode)}
                    size={28}
                    color={isDark ? "#E5E7EB" : "#4B5563"}
                  />
                  <Text
                    className={`ml-2 text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {weatherCodeToLabel(day.weatherCode)}
                  </Text>
                </View>

                {/* Precipitation */}
                {day.precipitationProbabilityMax !== null &&
                  day.precipitationProbabilityMax !== undefined &&
                  day.precipitationProbabilityMax > 0 && (
                    <View className="mr-4 flex-row items-center">
                      <Ionicons name="water" size={14} color="#3B82F6" />
                      <Text className="ml-1 text-sm text-blue-500">
                        {day.precipitationProbabilityMax}%
                      </Text>
                    </View>
                  )}

                {/* Temperature range */}
                <View className="flex-row items-center">
                  <Text
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {Math.round(day.tempMax)}°
                  </Text>
                  <Text
                    className={`ml-2 text-lg ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {Math.round(day.tempMin)}°
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
