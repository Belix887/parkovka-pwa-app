"use client";
import { useState, useEffect, useCallback } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useGeolocation } from "@/hooks/useGeolocation";
import { GeolocationPrompt } from "@/components/booking/GeolocationPrompt";
import { RouteMap } from "@/components/booking/RouteMap";
import { RouteInfo } from "@/components/booking/RouteInfo";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { ReviewsList } from "@/components/reviews/ReviewsList";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { RatingStars } from "@/components/reviews/RatingStars";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { Route, RoutePoint } from "@/lib/routing";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

interface ParkingSpot {
  id: string;
  title: string;
  description: string;
  pricePerHour: number;
  address: string;
  geoLat: number;
  geoLng: number;
  covered: boolean;
  guarded: boolean;
  camera: boolean;
  evCharging: boolean;
  disabledAccessible: boolean;
  wideEntrance: boolean;
  spotNumber?: string | null;
  ownerId?: string;
  photos: { url: string }[];
}

export default function SpotPage({ params }: { params: Promise<{ id: string }> }) {
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Геолокация и маршрутизация
  const { coordinates: userLocation, loading: locationLoading, requestLocation } = useGeolocation({
    autoRequest: false,
    fallbackToCache: true,
  });
  const [route, setRoute] = useState<Route | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [showGeolocationPrompt, setShowGeolocationPrompt] = useState(false);
  
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params;
      await loadSpot(id);
      await loadCurrentUser();
    };
    loadData();
  }, [params]);

  const loadCurrentUser = async () => {
    try {
      const response = await fetch("/api/me");
      if (response.ok) {
        const user = await response.json();
        setCurrentUserId(user?.id || null);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const loadSpot = async (spotId: string) => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/spots/${spotId}`);
      
      if (!response.ok) {
        throw new Error('Парковочное место не найдено');
      }
      
      const data = await response.json();
      setSpot(data);
      
      // Загружаем статистику отзывов
      loadReviewStats(spotId);
      
      // Проверяем, может ли пользователь оставить отзыв
      checkCanReview(spotId);
      
      // Автоматически запрашиваем геолокацию после загрузки места
      if (!userLocation) {
        setShowGeolocationPrompt(true);
      }
    } catch (error) {
      console.error('Error loading spot:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewStats = async (spotId: string) => {
    try {
      const response = await fetch(`/api/spots/${spotId}/reviews?limit=1`);
      if (response.ok) {
        const data = await response.json();
        setAverageRating(data.statistics?.averageRating || 0);
        setReviewCount(data.statistics?.totalReviews || 0);
      }
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  };

  const checkCanReview = async (spotId: string) => {
    try {
      // Проверяем, есть ли завершенные бронирования пользователя
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const bookings = await response.json();
        const completedBookings = bookings.filter(
          (b: any) => b.spotId === spotId && 
          (b.status === 'PAID' || b.status === 'APPROVED') && 
          new Date(b.endAt) < new Date()
        );
        
        if (completedBookings.length > 0) {
          // Проверяем, не оставлен ли уже отзыв на эти бронирования
          const bookingIds = completedBookings.map((b: any) => b.id);
          const reviewsResponse = await fetch(`/api/spots/${spotId}/reviews?limit=100`);
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            const userReviews = reviewsData.reviews || [];
            const hasReviewForBooking = bookingIds.some((bookingId: string) =>
              userReviews.some((r: any) => r.bookingId === bookingId)
            );
            setCanReview(!hasReviewForBooking);
          } else {
            setCanReview(true);
          }
        } else {
          setCanReview(false);
        }
      }
    } catch (error) {
      console.error('Error checking can review:', error);
      setCanReview(false);
    }
  };

  // Мемоизируем функцию расчета маршрута
  const calculateRouteToSpotMemo = useCallback(async () => {
    if (!userLocation || !spot) return;

    setRouteLoading(true);
    setRouteError(null);

    try {
      const response = await fetch("/api/routing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromLat: userLocation.lat,
          fromLng: userLocation.lng,
          toLat: spot.geoLat,
          toLng: spot.geoLng,
          mode: "driving",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не удалось построить маршрут");
      }

      const routeData = await response.json();
      setRoute({
        distance: routeData.distance,
        duration: routeData.duration,
        geometry: routeData.geometry,
        steps: routeData.steps || [],
      });
    } catch (err: any) {
      setRouteError(err.message || "Ошибка построения маршрута");
      console.error("Route calculation error:", err);
    } finally {
      setRouteLoading(false);
    }
  }, [userLocation, spot]);

  // Расчет маршрута при изменении геолокации или места
  useEffect(() => {
    if (userLocation && spot) {
      calculateRouteToSpotMemo();
    }
  }, [userLocation, spot, calculateRouteToSpotMemo]);

  const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const payload = {
      spotId: formData.get("spotId"),
      startAt: formData.get("startAt"),
      endAt: formData.get("endAt"),
      renterLat: userLocation?.lat,
      renterLng: userLocation?.lng,
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка бронирования");
      }

      const bookingData = await response.json();
      showSuccess("Бронирование создано", "Ваше место успешно забронировано!");
      router.push(`/bookings/${bookingData.id}`);
    } catch (err: any) {
      showError("Ошибка бронирования", err.message || "Не удалось создать бронирование");
    }
  };

  const formatPrice = (price: number) => {
    return `${(price / 100).toLocaleString('ru-RU')} ₽/час`;
  };

  const getFeatureIcon = (feature: string) => {
    const icons: { [key: string]: string } = {
      'Крытая': '🏠',
      'Охраняемая': '🛡️',
      'Камеры': '📹',
      'Зарядка ЭВ': '⚡',
      'Для инвалидов': '♿',
      'Широкий въезд': '🚗'
    };
    return icons[feature] || '✅';
  };

  const getFeatures = (spot: ParkingSpot) => {
    const features = [];
    if (spot.covered) features.push('Крытая');
    if (spot.guarded) features.push('Охраняемая');
    if (spot.camera) features.push('Камеры');
    if (spot.evCharging) features.push('Зарядка ЭВ');
    if (spot.disabledAccessible) features.push('Для инвалидов');
    if (spot.wideEntrance) features.push('Широкий въезд');
    return features;
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8">
        <div className="container">
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !spot) {
    return (
      <main className="min-h-screen py-8">
        <div className="container">
          <MotionCard className="p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              Парковочное место не найдено
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              {error || 'Запрашиваемое парковочное место не существует или было удалено.'}
            </p>
            <Button variant="primary" onClick={() => window.history.back()}>
              ← Назад
            </Button>
          </MotionCard>
        </div>
      </main>
    );
  }

  const features = getFeatures(spot);

  return (
    <main className="min-h-screen py-8">
      <div className="container">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Заголовок и цена */}
            <MotionCard>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                      {spot.title}
                    </h1>
                    {spot.spotNumber && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                          <span>🔢</span>
                          Номер места: <span className="font-bold">{spot.spotNumber}</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-4">
                      <span className="text-red-500">📍</span>
                      <span className="text-lg font-medium">{spot.address}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-3">
                    <div className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white px-6 py-3 rounded-xl font-bold text-2xl shadow-lg">
                      {formatPrice(spot.pricePerHour)}
                    </div>
                    <FavoriteButton
                      spotId={spot.id}
                      size="lg"
                      showText={true}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all"
                    />
                  </div>
                </div>
                
                <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                  {spot.description}
                </p>
              </div>
            </MotionCard>

            {/* Фотографии */}
            {spot.photos.length > 0 && (
              <MotionCard>
                <CardHeader
                  title="Фотографии"
                  subtitle="Посмотрите на парковочное место"
                  icon="📸"
                />
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {spot.photos.map((photo, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img 
                          src={photo.url} 
                          alt={`${spot.title} - фото ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </MotionCard>
            )}

            {/* Геолокация */}
            {showGeolocationPrompt && !userLocation && (
              <GeolocationPrompt
                onLocationReceived={() => {
                  setShowGeolocationPrompt(false);
                  requestLocation();
                }}
                onCancel={() => setShowGeolocationPrompt(false)}
                autoRequest={false}
              />
            )}

            {/* Маршрут и карта */}
            {userLocation && (
              <>
                  <RouteInfo
                  route={route}
                  loading={routeLoading}
                  error={routeError}
                  onRetry={calculateRouteToSpotMemo}
                />
                <MotionCard>
                  <CardHeader
                    title="Маршрут до парковки"
                    subtitle="Интерактивная карта с маршрутом"
                    icon="🗺️"
                  />
                  <CardContent>
                    <RouteMap
                      from={userLocation}
                      to={{ lat: spot.geoLat, lng: spot.geoLng }}
                      route={route}
                      loading={routeLoading}
                      height="400px"
                    />
                  </CardContent>
                </MotionCard>
              </>
            )}

            {/* Обычная карта (если геолокация не получена) */}
            {!userLocation && (
              <MotionCard>
                <CardHeader
                  title="Расположение"
                  subtitle="Посмотрите на карте"
                  icon="🗺️"
                />
                <CardContent>
                  <div className="rounded-xl overflow-hidden h-80">
                    <LeafletMap 
                      center={[spot.geoLat, spot.geoLng]} 
                      spots={[spot]}
                    />
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowGeolocationPrompt(true);
                        requestLocation();
                      }}
                      icon="📍"
                      className="w-full"
                    >
                      Получить маршрут
                    </Button>
                  </div>
                </CardContent>
              </MotionCard>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Особенности */}
            <MotionCard>
              <CardHeader
                title="Особенности"
                subtitle="Что включено"
                icon="✨"
              />
              <CardContent>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg"
                    >
                      <span className="text-2xl">{getFeatureIcon(feature)}</span>
                      <span className="font-medium text-[var(--text-primary)]">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </MotionCard>

            {/* Календарь доступности - скрыт на мобильных для экономии места */}
            <div className="hidden md:block">
              <AvailabilityCalendar
                spotId={spot.id}
                onDateSelect={(date) => {
                  // Автоматически заполняем форму при выборе даты
                  const startInput = document.querySelector('input[name="startAt"]') as HTMLInputElement;
                  const endInput = document.querySelector('input[name="endAt"]') as HTMLInputElement;
                  if (startInput) {
                    const startDate = new Date(date);
                    startDate.setHours(12, 0, 0, 0);
                    startInput.value = format(startDate, "yyyy-MM-dd'T'HH:mm");
                  }
                  if (endInput) {
                    const endDate = new Date(date);
                    endDate.setHours(13, 0, 0, 0);
                    endInput.value = format(endDate, "yyyy-MM-dd'T'HH:mm");
                  }
                }}
              />
            </div>

            {/* Бронирование */}
            <MotionCard>
              <CardHeader
                title="Забронировать"
                subtitle="Выберите время"
                icon="📅"
              />
              <CardContent>
                <form className="space-y-4" onSubmit={handleBookingSubmit}>
                  <input type="hidden" name="spotId" value={spot.id} />
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Начало парковки
                    </label>
                    <input 
                      name="startAt" 
                      type="datetime-local" 
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]" 
                      required 
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Конец парковки
                    </label>
                    <input 
                      name="endAt" 
                      type="datetime-local" 
                      className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]" 
                      required 
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  {/* Информация о времени в пути */}
                  {route && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 md:p-3">
                      <p className="text-xs text-blue-800 mb-1">
                        ⏱️ Время в пути: ~{Math.round(route.duration / 60)} минут
                      </p>
                      <p className="text-xs text-blue-600">
                        Учтите время на дорогу при выборе времени начала парковки
                      </p>
                    </div>
                  )}

                  {/* Информация о депозите (если требуется) */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 md:p-3">
                    <p className="text-xs text-yellow-800">
                      💰 При бронировании может потребоваться депозит. Депозит возвращается полностью после окончания парковки.
                    </p>
                  </div>
                  
                  <Button 
                    type="submit"
                    variant="primary" 
                    size="lg" 
                    className="w-full mobile-btn"
                    icon="🚗"
                  >
                    Забронировать место
                  </Button>
                </form>
              </CardContent>
            </MotionCard>

            {/* Дополнительные действия */}
            <MotionCard>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="md" 
                    className="w-full"
                    icon="📤"
                  >
                    Поделиться
                  </Button>
                </div>
              </CardContent>
            </MotionCard>
          </div>
        </div>

        {/* Отзывы */}
        {spot && (
          <div className="mt-8">
            <MotionCard>
              <CardHeader
                title="Отзывы"
                subtitle={
                  reviewCount > 0
                    ? `${reviewCount} ${reviewCount === 1 ? 'отзыв' : reviewCount < 5 ? 'отзыва' : 'отзывов'}`
                    : "Пока нет отзывов"
                }
                icon="💬"
              />
              <CardContent>
                {/* Средний рейтинг в заголовке */}
                {averageRating > 0 && (
                  <div className="mb-6 flex items-center gap-3">
                    <RatingStars rating={averageRating} size="lg" />
                    <span className="text-lg font-semibold text-[var(--text-primary)]">
                      {averageRating.toFixed(1)} из 5
                    </span>
                  </div>
                )}

                {/* Кнопка оставить отзыв */}
                {canReview && !showReviewForm && (
                  <div className="mb-6">
                    <Button
                      variant="primary"
                      onClick={() => setShowReviewForm(true)}
                      icon="✍️"
                    >
                      Оставить отзыв
                    </Button>
                  </div>
                )}

                {/* Форма отзыва */}
                {showReviewForm && (
                  <div className="mb-6 p-4 bg-[var(--bg-tertiary)] rounded-lg">
                    <ReviewForm
                      spotId={spot.id}
                      onSuccess={() => {
                        setShowReviewForm(false);
                        loadReviewStats(spot.id);
                        // Перезагружаем список отзывов
                        window.location.reload();
                      }}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </div>
                )}

                {/* Список отзывов */}
                <ReviewsList
                  spotId={spot.id}
                  spotOwnerId={spot.ownerId}
                  currentUserId={currentUserId || undefined}
                  onReviewCreated={() => {
                    loadReviewStats(spot.id);
                  }}
                />
              </CardContent>
            </MotionCard>
          </div>
        )}
      </div>
    </main>
  );
}