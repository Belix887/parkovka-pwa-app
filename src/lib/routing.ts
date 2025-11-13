/**
 * Библиотека для работы с маршрутизацией
 */

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteStep {
  distance: number; // в метрах
  duration: number; // в секундах
  instruction: string;
  geometry?: string; // полилиния
}

export interface Route {
  distance: number; // в метрах
  duration: number; // в секундах
  geometry: string; // полилиния для отображения на карте
  steps: RouteStep[];
}

export interface RoutingOptions {
  mode?: "driving" | "walking" | "cycling";
  alternatives?: boolean;
}

/**
 * Получить маршрут через OSRM (Open Source Routing Machine)
 * Бесплатный сервис, не требует API ключа
 */
export async function calculateRouteOSRM(
  from: RoutePoint,
  to: RoutePoint,
  options: RoutingOptions = {}
): Promise<Route | null> {
  const { mode = "driving" } = options;

  try {
    const profile = mode === "walking" ? "foot" : mode === "cycling" ? "bike" : "car";
    const url = `https://router.project-osrm.org/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("OSRM API error");
    }

    const data = await response.json();
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const steps = route.legs[0].steps.map((step: any) => ({
      distance: step.distance,
      duration: step.duration,
      instruction: step.maneuver?.instruction || "",
      geometry: step.geometry,
    }));

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: JSON.stringify(route.geometry),
      steps,
    };
  } catch (error) {
    console.error("OSRM routing error:", error);
    return null;
  }
}

/**
 * Получить маршрут через GraphHopper API
 * Требует API ключ, хорошая альтернатива для маршрутизации
 */
export async function calculateRouteGraphHopper(
  from: RoutePoint,
  to: RoutePoint,
  options: RoutingOptions = {}
): Promise<Route | null> {
  const apiKey = process.env.NEXT_PUBLIC_GRAPHHOPPER_API_KEY;
  if (!apiKey) {
    return null;
  }

  const { mode = "driving" } = options;
  const vehicle = mode === "walking" ? "foot" : mode === "cycling" ? "bike" : "car";

  try {
    const url = `https://graphhopper.com/api/1/route?point=${from.lat},${from.lng}&point=${to.lat},${to.lng}&vehicle=${vehicle}&key=${apiKey}&instructions=true&calc_points=true&points_encoded=false`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("GraphHopper API error");
    }

    const data = await response.json();
    if (!data.paths || data.paths.length === 0) {
      return null;
    }

    const path = data.paths[0];
    const steps = path.instructions?.map((instruction: any) => ({
      distance: instruction.distance || 0,
      duration: instruction.time ? instruction.time / 1000 : 0, // GraphHopper возвращает в миллисекундах
      instruction: instruction.text || "",
      geometry: undefined,
    })) || [];

    // Преобразуем координаты в полилинию
    // GraphHopper возвращает points в формате GeoJSON LineString
    let coordinates: [number, number][] = [];
    if (path.points?.coordinates) {
      // Если points_encoded=false, получаем массив координат [lng, lat]
      coordinates = path.points.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    } else if (path.points?.points) {
      // Если points_encoded=true, нужно декодировать
      // Для простоты используем decodePolyline, но обычно GraphHopper возвращает points_encoded=false
      coordinates = decodePolyline(path.points.points).map(p => [p.lat, p.lng]);
    }
    
    const geometry = JSON.stringify({
      type: "LineString",
      coordinates,
    });

    return {
      distance: path.distance || 0,
      duration: path.time ? Math.round(path.time / 1000) : 0, // GraphHopper возвращает в миллисекундах
      geometry,
      steps,
    };
  } catch (error) {
    console.error("GraphHopper routing error:", error);
    return null;
  }
}

/**
 * Получить маршрут через Yandex Maps API
 * Требует API ключ, но более точный для России
 */
export async function calculateRouteYandex(
  from: RoutePoint,
  to: RoutePoint,
  options: RoutingOptions = {}
): Promise<Route | null> {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  if (!apiKey) {
    return null; // Fallback на другие провайдеры
  }

  const { mode = "driving" } = options;
  const routingMode = mode === "walking" ? "pedestrian" : "auto";

  try {
    const url = `https://api.routing.yandex.net/v2/route?apikey=${apiKey}&waypoints=${from.lat},${from.lng}|${to.lat},${to.lng}&routing_mode=${routingMode}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Yandex Maps API error");
    }

    const data = await response.json();
    if (!data.route || data.route.length === 0) {
      return null;
    }

    const route = data.route[0];
    const steps = route.legs.flatMap((leg: any) =>
      leg.steps.map((step: any) => ({
        distance: step.length,
        duration: step.duration,
        instruction: step.text || "",
        geometry: step.polyline,
      }))
    );

    return {
      distance: route.distance.value,
      duration: route.duration.value,
      geometry: route.geometry,
      steps,
    };
  } catch (error) {
    console.error("Yandex routing error:", error);
    return null;
  }
}

/**
 * Универсальная функция для расчета маршрута
 * Пробует провайдеры в порядке приоритета: Yandex -> GraphHopper -> OSRM
 */
export async function calculateRoute(
  from: RoutePoint,
  to: RoutePoint,
  options: RoutingOptions = {}
): Promise<Route | null> {
  // 1. Сначала пробуем Yandex (если есть ключ) - лучший для России
  const yandexRoute = await calculateRouteYandex(from, to, options);
  if (yandexRoute) {
    return yandexRoute;
  }

  // 2. Пробуем GraphHopper (если есть ключ)
  const graphHopperRoute = await calculateRouteGraphHopper(from, to, options);
  if (graphHopperRoute) {
    return graphHopperRoute;
  }

  // 3. Fallback на OSRM (бесплатный, не требует ключа)
  return calculateRouteOSRM(from, to, options);
}

/**
 * Форматировать расстояние для отображения
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} м`;
  }
  return `${(meters / 1000).toFixed(1)} км`;
}

/**
 * Форматировать время в пути для отображения
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} ч`;
  }
  return `${hours} ч ${remainingMinutes} мин`;
}

/**
 * Декодировать полилинию (Google Maps формат)
 */
export function decodePolyline(encoded: string): RoutePoint[] {
  const points: RoutePoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push({ lat: lat * 1e-5, lng: lng * 1e-5 });
  }

  return points;
}

