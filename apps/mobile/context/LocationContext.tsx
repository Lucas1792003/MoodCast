import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";

type LocationState = {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: Location.PermissionStatus | null;
};

type LocationContextType = LocationState & {
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
};

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    locationName: null,
    isLoading: true,
    error: null,
    permissionStatus: null,
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setState((prev) => ({ ...prev, permissionStatus: status }));
      return status === "granted";
    } catch {
      return false;
    }
  }, []);

  const fetchLocationName = useCallback(async (lat: number, lon: number) => {
    try {
      // Use reverse geocoding API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        "Unknown";
      return city;
    } catch {
      return "Unknown Location";
    }
  }, []);

  const refreshLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Location permission not granted",
          permissionStatus: status,
        }));
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const locationName = await fetchLocationName(latitude, longitude);

      setState({
        latitude,
        longitude,
        locationName,
        isLoading: false,
        error: null,
        permissionStatus: status,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to get location",
      }));
    }
  }, [fetchLocationName]);

  // Initial location fetch
  useEffect(() => {
    const initLocation = async () => {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        await refreshLocation();
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };
    initLocation();
  }, [requestPermission, refreshLocation]);

  return (
    <LocationContext.Provider
      value={{
        ...state,
        requestPermission,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
