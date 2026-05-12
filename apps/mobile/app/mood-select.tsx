import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useWeather } from "@/context/WeatherContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ALL_MOODS, getMoodConfig, type MoodId } from "@moodcast/shared";
import * as Haptics from "expo-haptics";

export default function MoodSelectScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { selectedMood, suggestedMood, setMood } = useWeather();

  const handleSelectMood = (moodId: MoodId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMood(moodId);
    router.back();
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      edges={["bottom"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
      >
        <Text
          className={`mb-2 text-center text-lg ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}
        >
          How are you feeling today?
        </Text>

        {suggestedMood && (
          <Text
            className={`mb-6 text-center text-sm ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            Weather suggests: {getMoodConfig(suggestedMood).emoji}{" "}
            {getMoodConfig(suggestedMood).label}
          </Text>
        )}

        <View className="gap-3">
          {ALL_MOODS.map((moodId) => {
            const config = getMoodConfig(moodId);
            const isSelected = selectedMood === moodId;
            const isSuggested = suggestedMood === moodId;

            return (
              <Pressable
                key={moodId}
                onPress={() => handleSelectMood(moodId)}
                className={`flex-row items-center rounded-2xl p-4 ${
                  isSelected
                    ? "border-2"
                    : isDark
                    ? "bg-gray-800"
                    : "bg-white"
                }`}
                style={[
                  {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                  },
                  isSelected && {
                    borderColor: config.accent,
                    backgroundColor: isDark
                      ? `${config.accent}20`
                      : `${config.accent}10`,
                  },
                ]}
              >
                <View
                  className="h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${config.accent}30` }}
                >
                  <Text className="text-3xl">{config.emoji}</Text>
                </View>

                <View className="ml-4 flex-1">
                  <View className="flex-row items-center">
                    <Text
                      className={`text-lg font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {config.label}
                    </Text>
                    {isSuggested && (
                      <View
                        className="ml-2 rounded-full px-2 py-0.5"
                        style={{ backgroundColor: config.accent }}
                      >
                        <Text className="text-xs font-medium text-white">
                          Suggested
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    className={`mt-1 text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                    numberOfLines={2}
                  >
                    {config.suggestion}
                  </Text>

                  {/* Energy bar */}
                  <View className="mt-2 flex-row items-center">
                    <Ionicons name="flash" size={12} color={config.accent} />
                    <View
                      className={`ml-1 h-1.5 flex-1 overflow-hidden rounded-full ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${config.energy}%`,
                          backgroundColor: config.accent,
                        }}
                      />
                    </View>
                    <Text
                      className={`ml-2 text-xs ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {config.energy}%
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={config.accent}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
