import { View, Text, ScrollView, Pressable, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import * as Haptics from "expo-haptics";

type SettingsItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  showArrow?: boolean;
  onPress?: () => void;
  isDark: boolean;
};

function SettingsItem({
  icon,
  label,
  value,
  showArrow = true,
  onPress,
  isDark,
}: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between rounded-xl p-4 ${
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
      <View className="flex-row items-center">
        <Ionicons name={icon} size={22} color="#6B9C89" />
        <Text
          className={`ml-3 text-base ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {label}
        </Text>
      </View>
      <View className="flex-row items-center">
        {value && (
          <Text
            className={`mr-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {value}
          </Text>
        )}
        {showArrow && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
        )}
      </View>
    </Pressable>
  );
}

type SettingsToggleProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isDark: boolean;
};

function SettingsToggle({
  icon,
  label,
  value,
  onValueChange,
  isDark,
}: SettingsToggleProps) {
  return (
    <View
      className={`flex-row items-center justify-between rounded-xl p-4 ${
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
      <View className="flex-row items-center">
        <Ionicons name={icon} size={22} color="#6B9C89" />
        <Text
          className={`ml-3 text-base ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {label}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          Haptics.selectionAsync();
          onValueChange(val);
        }}
        trackColor={{ false: "#767577", true: "#6B9C89" }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [notifications, setNotifications] = useState(true);
  const [celsius, setCelsius] = useState(true);

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to auth flow
    Alert.alert("Coming Soon", "Authentication will be available in a future update.");
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      edges={["top"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
      >
        {/* User Section */}
        <View
          className={`items-center rounded-2xl p-6 ${
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
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primary/20">
            <Ionicons name="person" size={40} color="#6B9C89" />
          </View>
          <Text
            className={`mt-4 text-xl font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Guest User
          </Text>
          <Text
            className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            Sign in to sync your preferences
          </Text>
          <Pressable
            onPress={handleSignIn}
            className="mt-4 rounded-full bg-primary px-6 py-2"
          >
            <Text className="font-semibold text-white">Sign In</Text>
          </Pressable>
        </View>

        {/* Preferences Section */}
        <Text
          className={`mb-3 mt-6 text-sm font-semibold uppercase tracking-wide ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Preferences
        </Text>
        <View className="gap-2">
          <SettingsToggle
            icon="notifications"
            label="Weather Alerts"
            value={notifications}
            onValueChange={setNotifications}
            isDark={isDark}
          />
          <SettingsToggle
            icon="thermometer"
            label="Use Celsius"
            value={celsius}
            onValueChange={setCelsius}
            isDark={isDark}
          />
        </View>

        {/* App Section */}
        <Text
          className={`mb-3 mt-6 text-sm font-semibold uppercase tracking-wide ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          App
        </Text>
        <View className="gap-2">
          <SettingsItem
            icon="information-circle"
            label="About MoodCast"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert(
                "MoodCast",
                "MoodCast is a weather app that helps you plan your day based on the weather and your mood.\n\nVersion 1.0.0"
              );
            }}
            isDark={isDark}
          />
          <SettingsItem
            icon="shield-checkmark"
            label="Privacy Policy"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            isDark={isDark}
          />
          <SettingsItem
            icon="document-text"
            label="Terms of Service"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            isDark={isDark}
          />
        </View>

        {/* App Info */}
        <View className="mt-8 items-center">
          <Text className={isDark ? "text-gray-500" : "text-gray-400"}>
            MoodCast v1.0.0
          </Text>
          <Text
            className={`mt-1 text-xs ${isDark ? "text-gray-600" : "text-gray-300"}`}
          >
            Made with love
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
