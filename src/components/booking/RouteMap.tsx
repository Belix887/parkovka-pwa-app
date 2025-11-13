"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { decodePolyline, formatDistance, formatDuration } from "@/lib/routing";
import type { RoutePoint, Route } from "@/lib/routing";

// Фикс для иконок Leaflet в Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

const startIcon = L.divIcon({
  className: "custom-start-icon",
  html: `
    <div style="
      background: #10b981;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: white;
      font-weight: bold;
    ">📍</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const endIcon = L.divIcon({
  className: "custom-end-icon",
  html: `
    <div style="
      background: #ef4444;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: white;
      font-weight: bold;
    ">🅿️</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface RouteMapProps {
  from: RoutePoint | null;
  to: RoutePoint;
  route: Route | null;
  loading?: boolean;
  height?: string;
}

export function RouteMap({
  from,
  to,
  route,
  loading = false,
  height = "400px",
}: RouteMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    to.lat,
    to.lng,
  ]);
  const [mapZoom, setMapZoom] = useState(13);

  // Обновляем центр карты при изменении маршрута
  useEffect(() => {
    if (from && to) {
      // Центрируем карту между точками
      const centerLat = (from.lat + to.lat) / 2;
      const centerLng = (from.lng + to.lng) / 2;
      setMapCenter([centerLat, centerLng]);

      // Вычисляем зум для показа всего маршрута
      const latDiff = Math.abs(from.lat - to.lat);
      const lngDiff = Math.abs(from.lng - to.lng);
      const maxDiff = Math.max(latDiff, lngDiff);

      if (maxDiff < 0.01) {
        setMapZoom(15);
      } else if (maxDiff < 0.05) {
        setMapZoom(13);
      } else {
        setMapZoom(11);
      }
    }
  }, [from, to]);

  // Декодируем полилинию для отображения
  const routePoints: [number, number][] = route
    ? (() => {
        try {
          // Пробуем декодировать как GeoJSON
          const geometry = JSON.parse(route.geometry);
          if (geometry.type === "LineString" && Array.isArray(geometry.coordinates)) {
            return geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
          }
        } catch {
          // Если не GeoJSON, пробуем как полилинию
          const decoded = decodePolyline(route.geometry);
          return decoded.map((p) => [p.lat, p.lng]);
        }
        return [];
      })()
    : [];

  const openInMaps = (lat: number, lng: number, label: string) => {
    // Yandex Maps
    const yandexUrl = `https://yandex.ru/maps/?pt=${lng},${lat}&z=15`;
    // Google Maps
    const googleUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    // 2GIS
    const dgisUrl = `https://2gis.ru/search/${lat},${lng}`;

    // Открываем Yandex Maps по умолчанию для России
    window.open(yandexUrl, "_blank");
  };

  return (
    <div className="relative w-full" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-xl">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            <span className="text-xs md:text-sm font-medium">Построение маршрута...</span>
          </div>
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%", borderRadius: 12 }}
        className="z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Маршрут */}
        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints}
            color="#3b82f6"
            weight={5}
            opacity={0.7}
          />
        )}

        {/* Точка старта (геолокация пользователя) */}
        {from && (
          <Marker position={[from.lat, from.lng]} icon={startIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-semibold text-green-600 mb-1">
                  📍 Ваше местоположение
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  {from.lat.toFixed(6)}, {from.lng.toFixed(6)}
                </p>
                <button
                  onClick={() => openInMaps(from.lat, from.lng, "Ваше местоположение")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Открыть в картах →
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Точка назначения (парковка) */}
        <Marker position={[to.lat, to.lng]} icon={endIcon}>
          <Popup>
            <div className="p-2">
              <p className="font-semibold text-red-600 mb-1">🅿️ Парковка</p>
              <p className="text-xs text-gray-600 mb-2">
                {to.lat.toFixed(6)}, {to.lng.toFixed(6)}
              </p>
              <button
                onClick={() => openInMaps(to.lat, to.lng, "Парковка")}
                className="text-xs text-blue-600 hover:underline"
              >
                Открыть в картах →
              </button>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Информация о маршруте */}
      {route && (
        <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 bg-white rounded-lg shadow-lg p-2 md:p-3 z-20">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm font-semibold text-gray-800 truncate">
                📍 {formatDistance(route.distance)}
              </p>
              <p className="text-xs text-gray-600 truncate">
                ⏱️ {formatDuration(route.duration)}
              </p>
            </div>
            <button
              onClick={() => openInMaps(to.lat, to.lng, "Парковка")}
              className="px-2 md:px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0 mobile-btn"
            >
              <span className="hidden sm:inline">Навигация</span>
              <span className="sm:hidden">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

