import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getMoodConfig, type MoodId } from "@moodcast/shared";
import * as Haptics from "expo-haptics";

type Props = {
  selectedMood: MoodId | null;
  onPress: () => void;
};

export function MoodCard({ selectedMood, onPress }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const moodConfig = selectedMood ? getMoodConfig(selectedMood) : null;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`rounded-2xl p-4 ${isDark ? "bg-gray-800" : "bg-white"}`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: moodConfig?.accent || "#6B9C89" }}
          >
            <Text className="text-2xl">{moodConfig?.emoji || "🎭"}</Text>
          </View>
          <View className="ml-3">
            <Text
              className={`text-xs uppercase tracking-wide ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Current Mood
            </Text>
            <Text
              className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {moodConfig?.label || "Select Mood"}
            </Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? "#9CA3AF" : "#6B7280"}
        />
      </View>

      {/* Energy Indicator */}
      {moodConfig && (
        <View className="mt-3">
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Energy Level
            </Text>
            <Text
              className={`text-xs font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {moodConfig.energy}%
            </Text>
          </View>
          <View
            className={`mt-1 h-2 overflow-hidden rounded-full ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${moodConfig.energy}%`,
                backgroundColor: moodConfig.accent,
              }}
            />
          </View>
        </View>
      )}

      {/* Suggestion */}
      {moodConfig && (
        <Text
          className={`mt-3 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {moodConfig.suggestion}
        </Text>
      )}
    </Pressable>
  );
}
