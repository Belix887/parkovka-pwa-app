"use client";
import { useState, useEffect } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import dynamic from "next/dynamic";

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
  photos: { url: string }[];
}

export default function SpotPage({ params }: { params: Promise<{ id: string }> }) {
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { id } = await params;
      await loadSpot(id);
    };
    loadData();
  }, [params]);

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
    } catch (error) {
      console.error('Error loading spot:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
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
                    <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-4">
                      <span className="text-red-500">📍</span>
                      <span className="text-lg font-medium">{spot.address}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white px-6 py-3 rounded-xl font-bold text-2xl shadow-lg">
                      {formatPrice(spot.pricePerHour)}
                    </div>
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

            {/* Карта */}
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
              </CardContent>
            </MotionCard>
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

            {/* Бронирование */}
            <MotionCard>
              <CardHeader
                title="Забронировать"
                subtitle="Выберите время"
                icon="📅"
              />
              <CardContent>
                <form className="space-y-4" action="/api/bookings" method="post">
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
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    variant="primary" 
                    size="lg" 
                    className="w-full"
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
                    className="w-full hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    icon="❤️"
                  >
                    Добавить в избранное
                  </Button>
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
      </div>
    </main>
  );
}