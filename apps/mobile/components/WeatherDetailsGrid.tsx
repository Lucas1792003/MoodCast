import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import type { WeatherResult } from "@moodcast/shared";

type Props = {
  weather: WeatherResult | null;
};

type DetailItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  subValue?: string;
  isDark: boolean;
};

function DetailItem({ icon, label, value, subValue, isDark }: DetailItemProps) {
  return (
    <View
      className={`flex-1 rounded-xl p-3 ${isDark ? "bg-gray-800" : "bg-white"}`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center">
        <Ionicons
          name={icon}
          size={16}
          color="#6B9C89"
        />
        <Text
          className={`ml-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          {label}
        </Text>
      </View>
      <Text
        className={`mt-1 text-lg font-semibold ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </Text>
      {subValue && (
        <Text
          className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          {subValue}
        </Text>
      )}
    </View>
  );
}

function getUVLevel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function WeatherDetailsGrid({ weather }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!weather) return null;

  return (
    <View className="gap-3">
      {/* Row 1 */}
      <View className="flex-row gap-3">
        <DetailItem
          icon="water"
          label="Humidity"
          value={`${weather.humidity}%`}
          isDark={isDark}
        />
        <DetailItem
          icon="speedometer"
          label="Wind"
          value={`${Math.round(weather.windSpeed)} km/h`}
          subValue={
            weather.windDirection !== null && weather.windDirection !== undefined
              ? getWindDirection(weather.windDirection)
              : undefined
          }
          isDark={isDark}
        />
      </View>

      {/* Row 2 */}
      <View className="flex-row gap-3">
        {weather.uvIndex !== null && weather.uvIndex !== undefined && (
          <DetailItem
            icon="sunny"
            label="UV Index"
            value={String(weather.uvIndex)}
            subValue={getUVLevel(weather.uvIndex)}
            isDark={isDark}
          />
        )}
        <DetailItem
          icon="eye"
          label="Visibility"
          value={`${Math.round(weather.visibility / 1000)} km`}
          isDark={isDark}
        />
      </View>

      {/* Row 3 */}
      <View className="flex-row gap-3">
        {weather.pressureMsl !== null && weather.pressureMsl !== undefined && (
          <DetailItem
            icon="analytics"
            label="Pressure"
            value={`${Math.round(weather.pressureMsl)} hPa`}
            isDark={isDark}
          />
        )}
        {weather.dewPoint !== null && weather.dewPoint !== undefined && (
          <DetailItem
            icon="thermometer"
            label="Dew Point"
            value={`${Math.round(weather.dewPoint)}°`}
            isDark={isDark}
          />
        )}
      </View>

      {/* Row 4 - Sunrise/Sunset */}
      {(weather.sunrise || weather.sunset) && (
        <View className="flex-row gap-3">
          {weather.sunrise && (
            <DetailItem
              icon="sunny"
              label="Sunrise"
              value={new Date(weather.sunrise).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              isDark={isDark}
            />
          )}
          {weather.sunset && (
            <DetailItem
              icon="moon"
              label="Sunset"
              value={new Date(weather.sunset).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              isDark={isDark}
            />
          )}
        </View>
      )}
    </View>
  );
}
