import { View, Text, ScrollView, Pressable, Linking, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

import { useLocation } from "@/context/LocationContext";
import { useWeather } from "@/context/WeatherContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as Haptics from "expo-haptics";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://moodcast.vercel.app";

type Suggestion = {
  name: string;
  type: string;
  distance: number;
  lat: number;
  lon: number;
  address?: string;
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  restaurant: "restaurant",
  cafe: "cafe",
  park: "leaf",
  museum: "business",
  cinema: "film",
  gym: "fitness",
  mall: "cart",
  market: "basket",
  bar: "wine",
  default: "location",
};

export default function ActivitiesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { latitude, longitude, refreshLocation } = useLocation();
  const { weather } = useWeather();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    if (!latitude || !longitude) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        lat: String(latitude),
        lon: String(longitude),
      });
      if (weather?.weatherCode !== undefined) {
        params.set("weatherCode", String(weather.weatherCode));
      }

      const response = await fetch(`${API_BASE_URL}/api/suggestion?${params}`);
      if (!response.ok) throw new Error("Failed to fetch suggestions");

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activities");
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, weather?.weatherCode]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshLocation();
    await fetchSuggestions();
    setRefreshing(false);
  }, [refreshLocation, fetchSuggestions]);

  const openInMaps = (suggestion: Suggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = `https://maps.apple.com/?daddr=${suggestion.lat},${suggestion.lon}&dirflg=w`;
    Linking.openURL(url);
  };

  const region = latitude && longitude ? {
    latitude,
    longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  } : null;

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      edges={["top"]}
    >
      {/* Map View */}
      {region && (
        <View className="h-64">
          <MapView
            style={{ flex: 1 }}
            provider={PROVIDER_DEFAULT}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton
          >
            {suggestions.map((suggestion, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: suggestion.lat,
                  longitude: suggestion.lon,
                }}
                title={suggestion.name}
                description={suggestion.type}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedSuggestion(suggestion);
                }}
              />
            ))}
          </MapView>
        </View>
      )}

      {/* Suggestions List */}
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
          Nearby Activities
        </Text>

        {isLoading ? (
          <View className="items-center py-8">
            <Text className={isDark ? "text-gray-400" : "text-gray-500"}>
              Loading suggestions...
            </Text>
          </View>
        ) : error ? (
          <View className="items-center py-8">
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={isDark ? "#6B7280" : "#9CA3AF"}
            />
            <Text
              className={`mt-2 text-center ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {error}
            </Text>
            <Pressable
              onPress={fetchSuggestions}
              className="mt-4 rounded-full bg-primary px-6 py-2"
            >
              <Text className="font-medium text-white">Try Again</Text>
            </Pressable>
          </View>
        ) : suggestions.length === 0 ? (
          <View className="items-center py-8">
            <Ionicons
              name="map-outline"
              size={48}
              color={isDark ? "#6B7280" : "#9CA3AF"}
            />
            <Text
              className={`mt-2 text-center ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No activities found nearby
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {suggestions.map((suggestion, index) => (
              <Pressable
                key={index}
                onPress={() => openInMaps(suggestion)}
                className={`flex-row items-center rounded-2xl p-4 ${
                  isDark ? "bg-gray-800" : "bg-white"
                } ${
                  selectedSuggestion === suggestion
                    ? "border-2 border-primary"
                    : ""
                }`}
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-full bg-primary/10"
                >
                  <Ionicons
                    name={CATEGORY_ICONS[suggestion.type] || CATEGORY_ICONS.default}
                    size={24}
                    color="#6B9C89"
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className={`font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                    numberOfLines={1}
                  >
                    {suggestion.name}
                  </Text>
                  <Text
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {suggestion.type} • {(suggestion.distance / 1000).toFixed(1)} km
                  </Text>
                </View>
                <Ionicons
                  name="navigate"
                  size={20}
                  color="#6B9C89"
                />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
