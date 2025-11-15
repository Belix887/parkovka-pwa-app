"use client";
import { useState, useEffect } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { ParkingSpotCard } from "@/components/ui/ParkingSpotCard";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import Link from "next/link";

interface FavoriteSpot {
  id: string;
  spotId: string;
  createdAt: string;
  spot: {
    id: string;
    title: string;
    description: string;
    address: string;
    pricePerHour: number;
    geoLat: number;
    geoLng: number;
    covered: boolean;
    guarded: boolean;
    camera: boolean;
    evCharging: boolean;
    disabledAccessible: boolean;
    wideEntrance: boolean;
    spotNumber?: string | null;
    status: string;
    photos: { url: string }[];
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/favorites?page=${page}&limit=20`);
      
      if (!response.ok) {
        throw new Error("Ошибка загрузки избранного");
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (spotId: string) => {
    // Удаляем из локального состояния
    setFavorites((prev) => prev.filter((fav) => fav.spotId !== spotId));
  };

  const getFeatures = (spot: FavoriteSpot["spot"]) => {
    const features = [];
    if (spot.covered) features.push("Крытая");
    if (spot.guarded) features.push("Охраняемая");
    if (spot.camera) features.push("Камеры");
    if (spot.evCharging) features.push("Зарядка ЭВ");
    if (spot.disabledAccessible) features.push("Для инвалидов");
    if (spot.wideEntrance) features.push("Широкий въезд");
    return features;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
        <MobileNavigation />
        <div className="pt-16 md:pt-0">
          <div className="container py-8">
            <div className="flex items-center justify-center h-96">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
      <MobileNavigation />
      
      <div className="pt-16 md:pt-0">
        <div className="container py-6 md:py-8">
          <MotionCard className="mobile-card">
            <CardHeader
              title="Избранное"
              subtitle="Ваши сохраненные парковочные места"
              icon="❤️"
            />
            <CardContent>
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🤍</div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    Нет избранных мест
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Добавьте места в избранное, чтобы быстро находить их позже
                  </p>
                  <Link href="/catalog">
                    <Button variant="primary" icon="🔍">
                      Найти места
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => (
                      <div key={favorite.id} className="relative">
                        <ParkingSpotCard
                          id={favorite.spot.id}
                          title={favorite.spot.title}
                          description={favorite.spot.description}
                          pricePerHour={favorite.spot.pricePerHour}
                          address={favorite.spot.address}
                          spotNumber={favorite.spot.spotNumber}
                          averageRating={favorite.spot.averageRating}
                          reviewCount={favorite.spot.reviewCount}
                          features={getFeatures(favorite.spot)}
                          photos={favorite.spot.photos.map((p) => p.url)}
                        />
                        <div className="absolute top-4 right-4 z-10">
                          <FavoriteButton
                            spotId={favorite.spot.id}
                            size="lg"
                            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {hasMore && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPage((p) => p + 1);
                          // TODO: Загрузить следующую страницу
                        }}
                      >
                        Загрузить еще
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </MotionCard>
        </div>
      </div>
    </div>
  );
}

