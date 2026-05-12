import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import type { HourlyForecastItem } from "@moodcast/shared";

type Props = {
  forecast: HourlyForecastItem[];
};

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

function formatHour(timeStr: string): string {
  const date = new Date(timeStr);
  const now = new Date();

  // Check if this is the current hour
  if (
    date.getHours() === now.getHours() &&
    date.getDate() === now.getDate()
  ) {
    return "Now";
  }

  return date.toLocaleTimeString([], { hour: "numeric" });
}

export function HourlyForecast({ forecast }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Show next 24 hours
  const hourlyData = forecast.slice(0, 24);

  return (
    <View>
      <Text
        className={`mb-2 px-4 text-sm font-semibold uppercase tracking-wide ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        Hourly Forecast
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {hourlyData.map((hour, index) => (
          <View
            key={index}
            className={`mr-3 items-center rounded-2xl px-4 py-3 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 1,
              minWidth: 70,
            }}
          >
            <Text
              className={`text-xs font-medium ${
                formatHour(hour.time) === "Now"
                  ? "text-primary"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              {formatHour(hour.time)}
            </Text>
            <Ionicons
              name={getWeatherIcon(hour.weatherCode)}
              size={24}
              color={isDark ? "#E5E7EB" : "#4B5563"}
              style={{ marginVertical: 8 }}
            />
            <Text
              className={`text-base font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {Math.round(hour.temperature)}°
            </Text>
            {hour.precipitationProbability !== null &&
              hour.precipitationProbability !== undefined &&
              hour.precipitationProbability > 0 && (
                <View className="mt-1 flex-row items-center">
                  <Ionicons name="water" size={10} color="#3B82F6" />
                  <Text className="ml-0.5 text-xs text-blue-500">
                    {hour.precipitationProbability}%
                  </Text>
                </View>
              )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
