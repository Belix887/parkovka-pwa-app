"use client";

import { useState, useEffect } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { useGeolocation } from "@/hooks/useGeolocation";

interface GeolocationPromptProps {
  onLocationReceived?: (lat: number, lng: number) => void;
  onCancel?: () => void;
  autoRequest?: boolean;
}

export function GeolocationPrompt({
  onLocationReceived,
  onCancel,
  autoRequest = false,
}: GeolocationPromptProps) {
  const { coordinates, loading, error, requestLocation, clearError } =
    useGeolocation({
      autoRequest,
      fallbackToIP: false,
      fallbackToCache: true,
    });

  const [dismissed, setDismissed] = useState(false);

  // Уведомляем родителя о получении координат
  useEffect(() => {
    if (coordinates && onLocationReceived) {
      onLocationReceived(coordinates.lat, coordinates.lng);
    }
  }, [coordinates, onLocationReceived]);

  if (dismissed && !coordinates) {
    return null;
  }

  const handleAllow = async () => {
    clearError();
    await requestLocation();
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onCancel) {
      onCancel();
    }
  };

  if (coordinates) {
    return (
      <MotionCard className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Геолокация получена
              </p>
              <p className="text-xs text-green-600">
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </CardContent>
      </MotionCard>
    );
  }

  return (
    <MotionCard>
      <CardHeader
        title="Геолокация"
        subtitle="Для построения маршрута нужен доступ к вашему местоположению"
        icon="📍"
      />
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error.message}</p>
            {error.code === 1 && (
              <p className="text-xs text-red-600 mt-1">
                Разрешите доступ к геолокации в настройках браузера
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            onClick={handleAllow}
            loading={loading}
            icon="📍"
            className="flex-1 mobile-btn"
          >
            {loading ? "Получение..." : "Разрешить геолокацию"}
          </Button>
          {onCancel && (
            <Button
              variant="ghost"
              onClick={handleDismiss}
              disabled={loading}
              className="mobile-btn"
            >
              Пропустить
            </Button>
          )}
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center">
          Мы используем вашу геолокацию только для построения маршрута до
          парковки
        </p>
      </CardContent>
    </MotionCard>
  );
}

