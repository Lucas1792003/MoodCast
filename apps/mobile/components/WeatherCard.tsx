import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { weatherCodeToIcon, weatherCodeToLabel, getThemeColors, themeFromWeather } from "@moodcast/shared";
import type { WeatherResult } from "@moodcast/shared";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  weather: WeatherResult | null;
  isLoading: boolean;
};

// Map weather code to Ionicons
function getWeatherIcon(code: number, isDay?: boolean): keyof typeof Ionicons.glyphMap {
  if (code === 0) return isDay === false ? "moon" : "sunny";
  if (code <= 3) return isDay === false ? "cloudy-night" : "partly-sunny";
  if (code <= 48) return "cloudy";
  if (code <= 67) return "rainy";
  if (code <= 77) return "snow";
  if (code <= 82) return "rainy";
  if (code <= 99) return "thunderstorm";
  return "cloud";
}

export function WeatherCard({ weather, isLoading }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (isLoading || !weather) {
    return (
      <View
        className={`rounded-3xl p-6 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="h-48 items-center justify-center">
          <ActivityIndicator size="large" color="#6B9C89" />
          <Text
            className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            Loading weather...
          </Text>
        </View>
      </View>
    );
  }

  const theme = themeFromWeather(weather.weatherCode, weather.isDay);
  const colors = getThemeColors(theme);
  const weatherLabel = weatherCodeToLabel(weather.weatherCode);
  const iconName = getWeatherIcon(weather.weatherCode, weather.isDay);

  return (
    <View
      className="overflow-hidden rounded-3xl"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <LinearGradient
        colors={[colors.bg1, colors.bg2, colors.bg3]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-6"
      >
        {/* Temperature and Icon Row */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-7xl font-light text-white">
              {Math.round(weather.temperature)}°
            </Text>
            <Text className="mt-1 text-lg text-white/80">
              Feels like {Math.round(weather.feelsLike)}°
            </Text>
          </View>
          <View className="items-center">
            <Ionicons
              name={iconName}
              size={72}
              color="rgba(255,255,255,0.9)"
            />
            <Text className="mt-2 text-lg font-medium text-white">
              {weatherLabel}
            </Text>
          </View>
        </View>

        {/* Additional Info Row */}
        <View className="mt-6 flex-row justify-between">
          <View className="flex-row items-center">
            <Ionicons name="water-outline" size={18} color="rgba(255,255,255,0.8)" />
            <Text className="ml-1 text-white/80">{weather.humidity}%</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="speedometer-outline" size={18} color="rgba(255,255,255,0.8)" />
            <Text className="ml-1 text-white/80">{Math.round(weather.windSpeed)} km/h</Text>
          </View>
          {weather.uvIndex !== null && weather.uvIndex !== undefined && (
            <View className="flex-row items-center">
              <Ionicons name="sunny-outline" size={18} color="rgba(255,255,255,0.8)" />
              <Text className="ml-1 text-white/80">UV {weather.uvIndex}</Text>
            </View>
          )}
        </View>

        {/* High/Low if available from daily forecast */}
        {weather.dailyForecast && weather.dailyForecast.length > 0 && (
          <View className="mt-4 flex-row items-center justify-center">
            <Text className="text-white/70">
              H: {Math.round(weather.dailyForecast[0].tempMax)}°
            </Text>
            <Text className="mx-2 text-white/50">|</Text>
            <Text className="text-white/70">
              L: {Math.round(weather.dailyForecast[0].tempMin)}°
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
