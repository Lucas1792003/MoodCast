import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "./LocationContext";
import type { WeatherResult, MoodId } from "@moodcast/shared";
import { getSuggestedMood } from "@moodcast/shared";

// API base URL - in production, this should be your deployed API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://moodcast.vercel.app";

type WeatherState = {
  weather: WeatherResult | null;
  isLoading: boolean;
  error: string | null;
  selectedMood: MoodId | null;
  suggestedMood: MoodId | null;
};

type WeatherContextType = WeatherState & {
  refreshWeather: () => Promise<void>;
  setMood: (mood: MoodId) => void;
};

const WeatherContext = createContext<WeatherContextType | null>(null);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const { latitude, longitude, locationName } = useLocation();

  const [state, setState] = useState<WeatherState>({
    weather: null,
    isLoading: false,
    error: null,
    selectedMood: null,
    suggestedMood: null,
  });

  const fetchWeather = useCallback(async (lat: number, lon: number, name?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
      });
      if (name) params.set("name", name);

      const response = await fetch(`${API_BASE_URL}/api/weather?${params}`);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const weather: WeatherResult = await response.json();
      const suggestedMood = getSuggestedMood(weather.weatherCode);

      setState((prev) => ({
        ...prev,
        weather,
        isLoading: false,
        suggestedMood,
        selectedMood: prev.selectedMood || suggestedMood,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch weather",
      }));
    }
  }, []);

  const refreshWeather = useCallback(async () => {
    if (latitude && longitude) {
      await fetchWeather(latitude, longitude, locationName || undefined);
    }
  }, [latitude, longitude, locationName, fetchWeather]);

  const setMood = useCallback((mood: MoodId) => {
    setState((prev) => ({ ...prev, selectedMood: mood }));
  }, []);

  // Fetch weather when location changes
  useEffect(() => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude, locationName || undefined);
    }
  }, [latitude, longitude, locationName, fetchWeather]);

  return (
    <WeatherContext.Provider
      value={{
        ...state,
        refreshWeather,
        setMood,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}
