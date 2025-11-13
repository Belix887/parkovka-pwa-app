"use client";

import { useState, useEffect } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { InteractiveFilters } from "@/components/ui/InteractiveFilters";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import Link from "next/link";

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
  status: string;
}

export default function CatalogPage() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSpots();
  }, []);

  const loadSpots = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/spots");
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки парковочных мест');
      }

      const data = await response.json();
      setSpots(data);
    } catch (error) {
      console.error('Error loading spots:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const filteredSpots = spots.filter(spot => {
    const matchesSearch = spot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         spot.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         spot.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatPrice = (price: number) => `${(price / 100).toLocaleString("ru-RU")} ₽/час`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "AUTO_APPROVED":
        return <Badge variant="success" size="sm">Доступно</Badge>;
      case "PENDING_REVIEW":
      case "PENDING_VERIFICATION":
        return <Badge variant="warning" size="sm">На модерации</Badge>;
      case "AUTO_REJECTED":
      case "REJECTED":
        return <Badge variant="error" size="sm">Недоступно</Badge>;
      default:
        return <Badge variant="default" size="sm">Недоступно</Badge>;
    }
  };

  const getFeatures = (spot: ParkingSpot) => {
    const features = [];
    if (spot.covered) features.push("🏠 Крытое");
    if (spot.guarded) features.push("🛡️ Охрана");
    if (spot.camera) features.push("📹 Камеры");
    if (spot.evCharging) features.push("🔌 EV зарядка");
    if (spot.disabledAccessible) features.push("♿ Для инвалидов");
    if (spot.wideEntrance) features.push("🚗 Широкий въезд");
    return features;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] w-full max-w-full overflow-x-hidden">
      {/* Мобильная навигация */}
      <MobileNavigation />
      
      {/* Основной контент с отступом для мобильной шапки */}
      <div className="pt-14 md:pt-0 w-full max-w-full">
        <div className="container w-full max-w-full">
          {/* Заголовок страницы */}
          <section className="text-center py-4 md:py-8 mb-4 md:mb-8 w-full max-w-full">
            <div className="bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 rounded-lg md:rounded-3xl p-4 md:p-8 w-full max-w-full">
              <h1 className="text-xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight break-words">
                Каталог парковочных мест
              </h1>
              <p className="text-[var(--text-secondary)] text-sm md:text-lg leading-relaxed max-w-full break-words">
                Найдите идеальное место для парковки в Москве
              </p>
            </div>
          </section>

          {/* Поиск и фильтры */}
          <section className="mb-4 md:mb-8 w-full max-w-full">
            <MotionCard className="mobile-card">
              <CardHeader 
                title="Поиск и фильтры" 
                subtitle="Найдите подходящее место"
                icon="🔍"
              />
              <CardContent>
                <div className="space-y-4">
                  {/* Поисковая строка */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Поиск по названию, адресу..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setShowFilters(!showFilters)}
                      className="mobile-btn"
                    >
                      {showFilters ? "Скрыть" : "Фильтры"}
                    </Button>
                  </div>

                  {/* Фильтры */}
                  {showFilters && (
                    <div className="mt-4">
                      <InteractiveFilters />
                    </div>
                  )}
                </div>
              </CardContent>
            </MotionCard>
          </section>

          {/* Результаты поиска */}
          <section className="mb-4 md:mb-8 w-full max-w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-2xl font-bold text-[var(--text-primary)] break-words">
                Найдено мест: {filteredSpots.length}
              </h2>
              <div className="flex gap-2">
                <Link href="/map">
                  <Button variant="outline" size="sm" icon="🗺️" className="mobile-btn">
                    На карте
                  </Button>
                </Link>
              </div>
            </div>

            {/* Загрузка */}
            {loading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            )}

            {/* Ошибка */}
            {error && (
              <MotionCard className="mobile-card">
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">😞</div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                      Ошибка загрузки
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-4">
                      {error}
                    </p>
                    <Button onClick={loadSpots} variant="primary">
                      Попробовать снова
                    </Button>
                  </div>
                </CardContent>
              </MotionCard>
            )}

            {/* Пустой результат */}
            {!loading && !error && filteredSpots.length === 0 && (
              <MotionCard className="mobile-card">
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                      Ничего не найдено
                    </h3>
                    <p className="text-[var(--text-secondary)] mb-4">
                      Попробуйте изменить параметры поиска
                    </p>
                    <Button onClick={() => setSearchQuery("")} variant="outline">
                      Сбросить поиск
                    </Button>
                  </div>
                </CardContent>
              </MotionCard>
            )}

            {/* Список парковочных мест */}
            {!loading && !error && filteredSpots.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredSpots.map((spot) => (
                  <MotionCard key={spot.id} className="mobile-card">
                    <div className="h-32 md:h-40 overflow-hidden rounded-t-lg">
                      {spot.photos && spot.photos.length > 0 ? (
                        <img 
                          src={spot.photos[0].url} 
                          alt={spot.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                          <span className="text-4xl">🅿️</span>
                        </div>
                      )}
                    </div>
                    
                    <CardContent>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm md:text-lg font-bold text-[var(--text-primary)] break-words flex-1">
                          {spot.title}
                        </h3>
                        {getStatusBadge(spot.status)}
                      </div>
                      
                      <p className="text-xs md:text-sm text-[var(--text-secondary)] mb-2 break-words">
                        {spot.address}
                      </p>
                      
                      <p className="text-xs md:text-sm text-[var(--text-secondary)] mb-3 line-clamp-2 break-words">
                        {spot.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm md:text-lg font-bold text-[var(--accent-primary)]">
                          {formatPrice(spot.pricePerHour)}
                        </span>
                      </div>
                      
                      {/* Особенности */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {getFeatures(spot).slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="default" size="sm">
                              {feature}
                            </Badge>
                          ))}
                          {getFeatures(spot).length > 3 && (
                            <Badge variant="default" size="sm">
                              +{getFeatures(spot).length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Link href={`/spots/${spot.id}`} className="block">
                        <Button variant="primary" size="sm" className="w-full mobile-btn" icon="👁️">
                          Подробнее
                        </Button>
                      </Link>
                    </CardContent>
                  </MotionCard>
                ))}
              </div>
            )}
          </section>

          {/* Быстрые действия */}
          <section className="mb-6 md:mb-12 w-full max-w-full">
            <MotionCard className="mobile-card">
              <CardHeader 
                title="Не нашли подходящее место?" 
                subtitle="Попробуйте другие варианты"
                icon="💡"
              />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <Link href="/map">
                    <Button variant="outline" size="lg" className="w-full mobile-btn" icon="🗺️">
                      Поиск на карте
                    </Button>
                  </Link>
                  <Link href="/spots/create">
                    <Button variant="primary" size="lg" className="w-full mobile-btn" icon="➕">
                      Добавить место
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </MotionCard>
          </section>
        </div>
      </div>
    </div>
  );
}
