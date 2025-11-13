/**
 * Библиотека для работы с геолокацией пользователя
 */

export interface GeolocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

const GEOLOCATION_CACHE_KEY = "parkovka_last_location";
const GEOLOCATION_CACHE_TTL = 60 * 60 * 1000; // 1 час

/**
 * Получить последнюю сохраненную геолокацию из localStorage
 */
export function getCachedLocation(): GeolocationCoordinates | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(GEOLOCATION_CACHE_KEY);
    if (!cached) return null;

    const { coordinates, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Проверяем, не устарела ли кэшированная позиция
    if (now - timestamp > GEOLOCATION_CACHE_TTL) {
      localStorage.removeItem(GEOLOCATION_CACHE_KEY);
      return null;
    }

    return coordinates;
  } catch {
    return null;
  }
}

/**
 * Сохранить геолокацию в localStorage
 */
export function cacheLocation(coordinates: GeolocationCoordinates): void {
  if (typeof window === "undefined") return;

  try {
    const data = {
      coordinates,
      timestamp: Date.now(),
    };
    localStorage.setItem(GEOLOCATION_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Игнорируем ошибки сохранения
  }
}

/**
 * Получить текущую геолокацию пользователя
 */
export function getUserLocation(
  options: PositionOptions = {}
): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject({
        code: -1,
        message: "Геолокация недоступна в этом браузере",
      });
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Использовать кэш до 1 минуты
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: GeolocationCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        // Кэшируем позицию
        cacheLocation(coordinates);

        resolve(coordinates);
      },
      (error) => {
        const errorMap: Record<number, string> = {
          1: "Разрешение на геолокацию отклонено",
          2: "Не удалось определить местоположение",
          3: "Превышено время ожидания",
        };

        reject({
          code: error.code,
          message: errorMap[error.code] || "Неизвестная ошибка геолокации",
        });
      },
      defaultOptions
    );
  });
}

/**
 * Отслеживать изменения геолокации
 */
export function watchUserLocation(
  callback: (coordinates: GeolocationCoordinates) => void,
  options: PositionOptions = {}
): number | null {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return null;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000,
    ...options,
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const coordinates: GeolocationCoordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };

      cacheLocation(coordinates);
      callback(coordinates);
    },
    (error) => {
      console.error("Geolocation watch error:", error);
    },
    defaultOptions
  );

  return watchId;
}

/**
 * Остановить отслеживание геолокации
 */
export function clearWatch(watchId: number): void {
  if (typeof window === "undefined" || !navigator.geolocation) return;
  navigator.geolocation.clearWatch(watchId);
}

/**
 * Получить геолокацию через IP (fallback)
 * Использует бесплатный API ipapi.co
 */
export async function getLocationByIP(): Promise<GeolocationCoordinates | null> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    if (data.latitude && data.longitude) {
      return {
        lat: data.latitude,
        lng: data.longitude,
        accuracy: 10000, // Низкая точность для IP-геолокации
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Вычислить расстояние между двумя точками (в км)
 * Использует формулу гаверсинуса
 */
export function calculateDistance(
  from: GeolocationCoordinates,
  to: GeolocationCoordinates
): number {
  const R = 6371; // Радиус Земли в км
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

