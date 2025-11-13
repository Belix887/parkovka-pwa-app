"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getUserLocation,
  watchUserLocation,
  clearWatch,
  getCachedLocation,
  getLocationByIP,
  type GeolocationCoordinates,
  type GeolocationError,
} from "@/lib/geolocation";

interface UseGeolocationOptions {
  autoRequest?: boolean;
  watch?: boolean;
  fallbackToIP?: boolean;
  fallbackToCache?: boolean;
}

interface UseGeolocationReturn {
  coordinates: GeolocationCoordinates | null;
  loading: boolean;
  error: GeolocationError | null;
  requestLocation: () => Promise<void>;
  clearError: () => void;
}

/**
 * React hook для работы с геолокацией
 */
export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationReturn {
  const {
    autoRequest = false,
    watch = false,
    fallbackToIP = true,
    fallbackToCache = true,
  } = options;

  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Сначала пробуем получить из кэша
      if (fallbackToCache) {
        const cached = getCachedLocation();
        if (cached) {
          setCoordinates(cached);
          setLoading(false);
          // Продолжаем обновлять в фоне
        }
      }

      // Запрашиваем актуальную геолокацию
      const location = await getUserLocation();
      setCoordinates(location);
      setError(null);
    } catch (err: any) {
      setError(err);

      // Fallback на IP-геолокацию
      if (fallbackToIP && err.code === 1) {
        // Только если пользователь отклонил разрешение
        try {
          const ipLocation = await getLocationByIP();
          if (ipLocation) {
            setCoordinates(ipLocation);
            setError(null);
          }
        } catch {
          // Игнорируем ошибки IP-геолокации
        }
      }
    } finally {
      setLoading(false);
    }
  }, [fallbackToIP, fallbackToCache]);

  // Автоматический запрос при монтировании
  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest, requestLocation]);

  // Отслеживание изменений позиции
  useEffect(() => {
    if (watch && coordinates) {
      watchIdRef.current = watchUserLocation((newCoordinates) => {
        setCoordinates(newCoordinates);
      });

      return () => {
        if (watchIdRef.current !== null) {
          clearWatch(watchIdRef.current);
        }
      };
    }
  }, [watch, coordinates]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    coordinates,
    loading,
    error,
    requestLocation,
    clearError,
  };
}

