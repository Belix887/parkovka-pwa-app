"use client";

import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { formatDistance, formatDuration } from "@/lib/routing";
import type { Route } from "@/lib/routing";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface RouteInfoProps {
  route: Route | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function RouteInfo({ route, loading, error, onRetry }: RouteInfoProps) {
  if (loading) {
    return (
      <MotionCard>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-[var(--text-secondary)]">
              Построение маршрута...
            </span>
          </div>
        </CardContent>
      </MotionCard>
    );
  }

  if (error) {
    return (
      <MotionCard className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">
                ⚠️ Не удалось построить маршрут
              </p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
              >
                Повторить
              </button>
            )}
          </div>
        </CardContent>
      </MotionCard>
    );
  }

  if (!route) {
    return null;
  }

  return (
    <MotionCard>
      <CardHeader
        title="Маршрут до парковки"
        subtitle="Информация о поездке"
        icon="🗺️"
      />
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📍</span>
              <span className="text-sm font-medium text-gray-700">
                Расстояние
              </span>
            </div>
            <p className="text-xl font-bold text-blue-600">
              {formatDistance(route.distance)}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏱️</span>
              <span className="text-sm font-medium text-gray-700">
                Время в пути
              </span>
            </div>
            <p className="text-xl font-bold text-green-600">
              {formatDuration(route.duration)}
            </p>
          </div>
        </div>

        {route.steps.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
            <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">
              Основные повороты:
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {route.steps.slice(0, 5).map((step, index) => (
                <div
                  key={index}
                  className="text-xs text-[var(--text-muted)] flex items-start gap-2"
                >
                  <span className="text-blue-600 font-bold">
                    {index + 1}.
                  </span>
                  <span>{step.instruction || "Продолжайте движение"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </MotionCard>
  );
}

